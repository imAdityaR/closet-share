import json
import os
import psycopg2
import asyncio
from fastapi import FastAPI
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

app = FastAPI()

# Configure the NEW Gemini client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# --- DATA MODELS ---
class QueryRequest(BaseModel):
    text: str
    limit: int = 5
    gender: Optional[str] = None

class SingleProductRequest(BaseModel):
    id: int

class StyleMatchRequest(BaseModel):
    id: int
    productDisplay: str
    gender: str
    subcategory: str
    basecolour: str
    usage: str
    description: Optional[str] = ""  # Safely accepts description from frontend
    limit: int = 4

class OutfitRequest(BaseModel):
    prompt: str
    gender: str = "Men"

# --- DATABASE HELPER ---
def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))


# --- ENDPOINT 1: HYBRID SEARCH ---
@app.post("/api/recommend")
def get_recommendations(req: QueryRequest):
    # 1. Convert user's search text into a vector
    response = client.models.embed_content(
        model="gemini-embedding-001",
        contents=req.text,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_QUERY",
            output_dimensionality=384
        )
    )
    embedding = response.embeddings[0].values
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    # 2. Perform Vector Math Search
    if req.gender:
        cur.execute(
            """
            SELECT id, productDisplay, gender, mastercategory, subcategory, articletype, basecolour, season, usage, rentalpriceperday, imageurl, description 
            FROM products 
            WHERE gender ILIKE %s
            ORDER BY text_embedding <-> %s::vector 
            LIMIT %s;
            """,
            (req.gender, str(embedding), req.limit)
        )
    else:
        cur.execute(
            """
            SELECT id, productDisplay, gender, mastercategory, subcategory, articletype, basecolour, season, usage, rentalpriceperday, imageurl, description 
            FROM products
            ORDER BY text_embedding <-> %s::vector 
            LIMIT %s;
            """,
            (str(embedding), req.limit)
        )
    
    results = cur.fetchall()
    cur.close()
    conn.close()
    
    # 3. Format Response
    recommendations = []
    for row in results:
        recommendations.append({
            "id": row[0],
            "productDisplay": row[1],
            "gender": row[2],
            "mastercategory": row[3],
            "subcategory": row[4],
            "articletype": row[5],
            "basecolour": row[6],
            "season": row[7],
            "usage": row[8],
            "rentalpriceperday": row[9],
            "imageurl": row[10],
            "description": row[11] if row[11] is not None else "" # Safe NULL handling
        })
        
    return {"data": recommendations}


# --- ENDPOINT 2: AUTOMATIC BACKGROUND VECTORIZER ---
@app.post("/api/vectorize-single")
def vectorize_single_product(req: SingleProductRequest):
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT id, productDisplay, gender, mastercategory, subcategory, articletype, basecolour, season, usage, rentalpriceperday, imageurl, description
        FROM products 
        WHERE id = %s;
    """, (req.id,))
    
    row = cur.fetchone()
    if not row:
        return {"error": "Product not found"}

    # Dynamically format text string, ignoring NULL descriptions automatically
    attributes = [str(item) for item in row[1:] if item is not None and str(item).strip() != ""]
    rich_text = " ".join(attributes)
    
    response = client.models.embed_content(
        model="gemini-embedding-001",
        contents=rich_text,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_DOCUMENT",
            output_dimensionality=384
        )
    )
    embedding = response.embeddings[0].values
    
    cur.execute(
        "UPDATE products SET text_embedding = %s WHERE id = %s",
        (embedding, req.id)
    )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {"status": "success", "message": f"Product {req.id} vectorized via Gemini."}


# --- ENDPOINT 3: AGENTIC STYLIST ("Complete The Look") ---
@app.post("/api/style-match")
def get_style_match(req: StyleMatchRequest):
    # 1. Inject the description securely into the prompt
    desc_context = f"\n    Additional Garment Details: {req.description}" if req.description else ""

    # THE UPGRADE: Ask for a full outfit breakdown, not just one item!
    prompt = f"""
    You are an expert high-end fashion stylist. 
    Your client is wearing a {req.gender} '{req.productDisplay}' (Category: {req.subcategory}, Color: {req.basecolour}, Occasion: {req.usage}).{desc_context}
    
    Suggest {req.limit} DISTINCT complementary clothing items to complete the look. 
    Ensure you pick DIFFERENT subcategories to build a full outfit (e.g., one bottom, one shoe, one accessory, one bag). Do NOT suggest another {req.subcategory}.
    
    CRITICAL RULES:
    1. "target_subcategory" MUST be chosen from this exact list: "Bottomwear", "Topwear", "Shoes", "Bags", "Jewellery", "Accessories".
    2. "vector_search_query" MUST be extremely simple. Maximum 2 to 3 words. Only the color and the basic noun (e.g., "Black trousers", "White sneakers", "Silver watch"). Do NOT use flowery adjectives.
    
    Respond ONLY with valid JSON:
    {{
        "ai_thought": "Short explanation of the curated look.",
        "items": [
            {{"target_subcategory": "Bottomwear", "vector_search_query": "Black trousers"}},
            {{"target_subcategory": "Shoes", "vector_search_query": "White sneakers"}},
            {{"target_subcategory": "Accessories", "vector_search_query": "Silver watch"}}
        ]
    }}
    """
    
    # 2. Ask Gemini 2.5 Flash to act as the stylist
    try:
        llm_response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        
        ai_decision = json.loads(llm_response.text)
        ai_thought = ai_decision.get("ai_thought", "Curated complementary pieces.")
        items_to_fetch = ai_decision.get("items", [])
        
    except Exception as e:
        print(f"⚠️ Gemini Stylist JSON Error: {e}")
        ai_thought = f"Complementary items for {req.basecolour} {req.subcategory}"
        # Fallback array if LLM crashes
        items_to_fetch = [
            {"target_subcategory": "Bottomwear", "vector_search_query": "Black pants"},
            {"target_subcategory": "Shoes", "vector_search_query": "Sneakers"}
        ]

    conn = get_db_connection()
    cur = conn.cursor()
    
    recommendations = []
    # Keep track of IDs so we never recommend the main item OR duplicates
    used_ids = [req.id] 
    
    # 3. Loop through the AI's varied suggestions and fetch EXACTLY 1 for each
    for piece in items_to_fetch[:req.limit]:
        target_sub = piece.get("target_subcategory", "Bottomwear")
        search_query = piece.get("vector_search_query", "Black pants")
        
        try:
            embed_response = client.models.embed_content(
                model="gemini-embedding-001",
                contents=search_query,
                config=types.EmbedContentConfig(
                    task_type="RETRIEVAL_QUERY",
                    output_dimensionality=384
                )
            )
            embedding = embed_response.embeddings[0].values
        except Exception as e:
            print(f"⚠️ Gemini Embedding Error for {search_query}: {e}")
            continue # Skip this specific item if embedding fails
        
        # 4. Fetch the single best match from the database
        cur.execute(
            """
            SELECT id, productDisplay, gender, mastercategory, subcategory, articletype, basecolour, season, usage, rentalpriceperday, imageurl, description 
            FROM products 
            WHERE gender ILIKE %s 
            AND subcategory ILIKE %s
            AND id != ALL(%s::int[]) -- Prevent duplicate recommendations
            ORDER BY text_embedding <-> %s::vector 
            LIMIT 1;
            """,
            (req.gender, f"%{target_sub}%", used_ids, str(embedding))
        )
        
        row = cur.fetchone()
        
        # Fallback if vector math fails for this specific category
        if not row:
            cur.execute(
                """
                SELECT id, productDisplay, gender, mastercategory, subcategory, articletype, basecolour, season, usage, rentalpriceperday, imageurl, description 
                FROM products 
                WHERE gender ILIKE %s AND subcategory ILIKE %s AND id != ALL(%s::int[])
                ORDER BY RANDOM()
                LIMIT 1;
                """,
                (req.gender, f"%{target_sub}%", used_ids)
            )
            row = cur.fetchone()

        # If we found an item, format it and add its ID to the exclusion list
        if row:
            used_ids.append(row[0])
            recommendations.append({
                "id": row[0],
                "productDisplay": row[1],
                "gender": row[2],
                "mastercategory": row[3],
                "subcategory": row[4],
                "articletype": row[5],
                "basecolour": row[6],
                "season": row[7],
                "usage": row[8],
                "rentalpriceperday": row[9],
                "imageurl": row[10],
                "description": row[11] if row[11] is not None else ""
            })

    cur.close()
    conn.close()
        
    return {
        "ai_thought": ai_thought,
        "data": recommendations
    }

# --- ENDPOINT 4: OUTFIT GENERATOR ---
@app.post("/api/generate-outfit")
def generate_outfit(req: OutfitRequest):
    # 1. Ask Gemini to break the user's vibe into 3 pieces
    system_prompt = f"""
    You are an elite fashion stylist. The user is asking for an outfit: "{req.prompt}".
    They are looking for {req.gender}'s clothing.
    
    Break this exact vibe down into 3 distinct pieces.
    
    CRITICAL RULES:
    1. "category_lock" MUST be chosen EXACTLY from this list: "Topwear", "Bottomwear", "Footwear". Do not use words like 'Shoes' or 'Pants'.
    2. Keep the "search_query" strictly to 2-3 words (e.g., "Black leather jacket", "Beige cargo", "White sneakers").
    
    Respond EXACTLY with this JSON structure:
    {{
        "ai_vibe_check": "A short, hype sentence about the outfit vibe.",
        "pieces": [
            {{"category_lock": "Topwear", "search_query": "..."}},
            {{"category_lock": "Bottomwear", "search_query": "..."}},
            {{"category_lock": "Footwear", "search_query": "..."}}
        ]
    }}
    """
    
    try:
        llm_response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=system_prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        ai_plan = json.loads(llm_response.text)
    except Exception as e:
        print("Stylist LLM Error:", e)
        return {"error": "Failed to conceptualize outfit"}

    outfit_items = []
    conn = get_db_connection()
    cur = conn.cursor()

    # 2. Iterate through each piece and find the best match in the DB
    for piece in ai_plan.get("pieces", []):
        try:
            embed_response = client.models.embed_content(
                model="gemini-embedding-001",
                contents=piece["search_query"],
                config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY", output_dimensionality=384)
            )
            embedding = embed_response.embeddings[0].values
            
            cur.execute(
                """
                SELECT id, productDisplay, gender, mastercategory, subcategory, articletype, basecolour, season, usage, rentalpriceperday, imageurl, description 
                FROM products 
                WHERE gender ILIKE %s AND subcategory ILIKE %s
                ORDER BY text_embedding <-> %s::vector 
                LIMIT 1;
                """,
                (req.gender, f"%{piece['category_lock']}%", str(embedding))
            )
            row = cur.fetchone()
            
            if not row:
                cur.execute(
                    """
                    SELECT id, productDisplay, gender, mastercategory, subcategory, articletype, basecolour, season, usage, rentalpriceperday, imageurl, description 
                    FROM products 
                    WHERE gender ILIKE %s AND subcategory ILIKE %s
                    ORDER BY RANDOM()
                    LIMIT 1;
                    """,
                    (req.gender, f"%{piece['category_lock']}%")
                )
                row = cur.fetchone()
            
            if row:
                outfit_items.append({
                    "id": row[0],
                    "productDisplay": row[1],
                    "gender": row[2],
                    "mastercategory": row[3],
                    "subcategory": row[4],
                    "articletype": row[5],
                    "basecolour": row[6],
                    "season": row[7],
                    "usage": row[8],
                    "rentalpriceperday": row[9],
                    "imageurl": row[10],
                    "description": row[11] if row[11] is not None else ""
                })
        except Exception as e:
            print(f"Embedding/DB Error for {piece.get('category_lock')}:", e)

    cur.close()
    conn.close()

    return {
        "vibe": ai_plan.get("ai_vibe_check", "Here is your custom curated look."),
        "outfit": outfit_items
    }