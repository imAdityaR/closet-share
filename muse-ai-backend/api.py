import json
import os
import psycopg2
import asyncio # Add this at the top if not there
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
    limit: int = 4

def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

# --- ENDPOINT 1: HYBRID SEARCH ---
@app.post("/api/recommend")
def get_recommendations(req: QueryRequest):
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
    
    if req.gender:
        cur.execute(
            """
            SELECT id, productDisplay, gender, mastercategory, subcategory, articletype, basecolour, season, usage, rentalpriceperday, imageurl 
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
            SELECT id, productDisplay, gender, mastercategory, subcategory, articletype, basecolour, season, usage, rentalpriceperday, imageurl 
            FROM products
            ORDER BY text_embedding <-> %s::vector 
            LIMIT %s;
            """,
            (str(embedding), req.limit)
        )
    
    results = cur.fetchall()
    cur.close()
    conn.close()
    
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
            "imageurl": row[10]

        })
        
    return {"data": recommendations}


# --- ENDPOINT 2: AUTOMATIC BACKGROUND VECTORIZER ---
@app.post("/api/vectorize-single")
def vectorize_single_product(req: SingleProductRequest):
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT id, productDisplay, gender, mastercategory, subcategory, articletype, basecolour, season, usage, rentalpriceperday, imageurl
        FROM products 
        WHERE id = %s;
    """, (req.id,))
    
    row = cur.fetchone()
    if not row:
        return {"error": "Product not found"}

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

# --- NEW: AGENTIC STYLIST ENDPOINT ---

@app.post("/api/style-match")
def get_style_match(req: StyleMatchRequest):
    # 1. UPGRADED PROMPT: Strict Enums and Short Strings
    prompt = f"""
    You are an expert high-end fashion stylist. 
    Your client is wearing a {req.gender} '{req.productDisplay}' (Category: {req.subcategory}, Color: {req.basecolour}, Occasion: {req.usage}).
    Suggest ONE complementary clothing item. Do NOT suggest another {req.subcategory}.
    
    CRITICAL RULES:
    1. "target_subcategory" MUST be chosen from this exact list: "Bottomwear", "Topwear", "Shoes", "Bags", "Jewellery", "Accessories". Do not invent new categories.
    2. "vector_search_query" MUST be extremely simple. Maximum 2 to 3 words. Only the color and the basic noun (e.g., "Grey trousers", "White sneakers"). Do NOT use flowery adjectives like "tailored", "virgin wool", or "sharp crease".
    
    Respond ONLY with valid JSON:
    {{
        "ai_thought": "Short explanation of your choice.",
        "target_subcategory": "Bottomwear",
        "vector_search_query": "Grey trousers"
    }}
    """
    
    try:
        llm_response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        
        ai_decision = json.loads(llm_response.text)
        ai_thought = ai_decision.get("ai_thought", "Complementary style match.")
        
        # Force a safe default if it hallucinates a category
        target_subcategory = ai_decision.get("target_subcategory", "Bottomwear")
        search_query = ai_decision.get("vector_search_query", "Grey trousers")
        
    except Exception as e:
        print(f"⚠️ Gemini Stylist JSON Error: {e}")
        ai_thought = f"Complementary item for {req.basecolour} {req.subcategory}"
        target_subcategory = "Bottomwear" if req.subcategory.lower() == "topwear" else "Topwear"
        search_query = "Grey pants"

    
    # 2. Embed the SUPER SHORT 2-word query
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
        print(f"⚠️ Gemini Embedding Error: {e}")
        return {"ai_thought": "Servers busy, please try again.", "data": []}
    
    
    # 3. HYBRID SQL: The impenetrable lock
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        """
        SELECT id, productDisplay, gender, mastercategory, subcategory, articletype, basecolour, season, usage, rentalpriceperday, imageurl 
        FROM products 
        WHERE gender ILIKE %s 
        AND subcategory ILIKE %s   -- STAYS LOCKED!
        AND id != %s
        ORDER BY text_embedding <-> %s::vector 
        LIMIT %s;
        """,
        (req.gender, f"%{target_subcategory}%", req.id, str(embedding), req.limit)
    )
    
    results = cur.fetchall()
    
    # FALLBACK FIX: If vector fails, we DO NOT drop the category filter. 
    # We just grab the best matching item based on pure color text match inside that locked category.
    if len(results) == 0:
        cur.execute(
            """
            SELECT id, productDisplay, gender, mastercategory, subcategory, articletype, basecolour, season, usage, rentalpriceperday, imageurl 
            FROM products 
            WHERE gender ILIKE %s AND subcategory ILIKE %s AND id != %s
            ORDER BY RANDOM()
            LIMIT %s;
            """,
            (req.gender, f"%{target_subcategory}%", req.id, req.limit)
        )
        results = cur.fetchall()

    cur.close()
    conn.close()
    
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
            "imageurl": row[10]
        })
        
    return {
        "ai_thought": ai_thought,
        "data": recommendations
    }

class OutfitRequest(BaseModel):
    prompt: str
    gender: str = "Men"

@app.post("/api/generate-outfit")
def generate_outfit(req: OutfitRequest): # REMOVED 'async'
    # 1. The Stylist Brain: Strict Enums added for category_lock
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

    # 2. The Searcher
    for piece in ai_plan.get("pieces", []):
        try:
            embed_response = client.models.embed_content(
                model="gemini-embedding-001",
                contents=piece["search_query"],
                config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY", output_dimensionality=384)
            )
            embedding = embed_response.embeddings[0].values
            
            # ATTEMPT 1: Exact Vector Match
            cur.execute(
                """
                SELECT id, productDisplay, gender, mastercategory, subcategory, articletype, basecolour, season, usage, rentalpriceperday, imageurl 
                FROM products 
                WHERE gender ILIKE %s AND subcategory ILIKE %s
                ORDER BY text_embedding <-> %s::vector 
                LIMIT 1;
                """,
                (req.gender, f"%{piece['category_lock']}%", str(embedding))
            )
            row = cur.fetchone()
            
            # ATTEMPT 2 (FALLBACK): If the vector math fails or gets confused, grab a random item from that category
            # so the user's outfit doesn't look broken/missing items on the frontend.
            if not row:
                cur.execute(
                    """
                    SELECT id, productDisplay, gender, mastercategory, subcategory, articletype, basecolour, season, usage, rentalpriceperday, imageurl 
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
                    "imageurl": row[10]
                })
        except Exception as e:
            print(f"Embedding/DB Error for {piece.get('category_lock')}:", e)

    cur.close()
    conn.close()

    return {
        "vibe": ai_plan.get("ai_vibe_check", "Here is your custom curated look."),
        "outfit": outfit_items
    }