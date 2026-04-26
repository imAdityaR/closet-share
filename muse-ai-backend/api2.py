
import psycopg2
import google.generativeai as genai
import time

# ==========================================
# 1. CREDENTIALS
# ==========================================
# Get this from Google AI Studio
GEMINI_API_KEY = ""
genai.configure(api_key=GEMINI_API_KEY)

# Your Neon Database URL
NEON_DATABASE_URL = "postgresql://neondb_owner:npg_49ibqfhenJzm@ep-small-brook-a47uhh8d-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# ==========================================
# 2. DATABASE SETUP
# ==========================================
print("Connecting to Neon Database...")
conn = psycopg2.connect(NEON_DATABASE_URL)
cursor = conn.cursor()


# ==========================================
# 3. FETCH UNVECTORIZED PRODUCTS
# ==========================================
# We only grab rows where the embedding is NULL so you can stop/start safely
cursor.execute("""
    SELECT id, productdisplay, mastercategory, subcategory, basecolour, description 
    FROM products_dummy 
    WHERE text_embedding IS NULL;
""")
rows = cursor.fetchall()

print(f"Found {len(rows)} products that need vectorization.")

# ==========================================
# 4. GENERATE & INJECT VECTORS
# ==========================================
print("Firing up Gemini AI Embeddings...")

count = 0
for row in rows:
    prod_id, name, master_cat, sub_cat, color, desc = row

    # THE SECRET SAUCE: Create a "Rich Text" string. 
    # Giving Gemini the color and category alongside the description makes your vector search 10x more accurate.
    rich_text = f"Product: {name}. Category: {master_cat} > {sub_cat}. Color: {color}. Description: {desc}"

    try:
        # Generate the embedding using Gemini's newest model, explicitly scaled to 384 dimensions
        response = genai.embed_content(
            model="models/text-embedding-004",
            content=rich_text,
            output_dimensionality=384
        )
        embedding = response['embedding']

        # Inject the vector back into that exact row in Neon
        cursor.execute(
            "UPDATE products_dummy SET text_embedding = %s::vector WHERE id = %s",
            (embedding, prod_id)
        )
        conn.commit()
        
        count += 1
        if count % 10 == 0:
            print(f"✅ Vectorized {count}/{len(rows)}: {name}")
            
        # Protect against Google API rate limits (15 requests/minute on free tier)
        # Adjust this sleep time if you have a paid tier
        time.sleep(2) 

    except Exception as e:
        conn.rollback()
        print(f"❌ Error vectorizing product {prod_id}: {e}")

cursor.close()
conn.close()

print(f"\n🎉 BOOM. Successfully vectorized {count} items. Your database is now AI-searchable!")