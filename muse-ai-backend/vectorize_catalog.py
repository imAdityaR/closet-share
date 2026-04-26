import os
import time
import psycopg2
from google import genai
from google.genai import types
from google.genai import errors  # Added to catch the specific API error
from dotenv import load_dotenv

load_dotenv()
#add .env  to muse-ai-backend folder with GEMINI_API_KEY and DATABASE_URL variables to access Gemini API and Neon Database
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

print("Connecting to Neon Database...")
conn = psycopg2.connect(os.getenv("DATABASE_URL"))
cur = conn.cursor()

# Only fetch products that do not have an embedding yet
# UPDATED: Added 'description' and changed table to 'products_dummy'
cur.execute("""
    SELECT id, productDisplay, gender, mastercategory, subcategory, articletype, basecolour, season, usage, description 
    FROM products_dummy
    WHERE text_embedding IS NULL;
""")
products = cur.fetchall()

total_left = len(products)
print(f"Found {total_left} products left to vectorize.")

if total_left == 0:
    print("Everything is already vectorized!")
    exit()

batch_size = 100

for i in range(0, total_left, batch_size):
    batch = products[i:i+batch_size]
    
    texts = []
    ids = []
    for row in batch:
        ids.append(row[0])
        # This automatically grabs 'description' now since we added it to the SELECT
        attributes = [str(item) for item in row[1:] if item is not None and str(item).strip() != ""]
        texts.append(" ".join(attributes))
    
    # --- BULLETPROOF RETRY LOOP ---
    success = False
    while not success:
        try:
            # Send to Gemini
            response = client.models.embed_content(
                model="gemini-embedding-001",
                contents=texts,
                config=types.EmbedContentConfig(
                    task_type="RETRIEVAL_DOCUMENT",
                    output_dimensionality=384
                )
            )
            
            # Save back to database
            # UPDATED: Changed table to 'products_dummy'
            for j, embedding_obj in enumerate(response.embeddings):
                cur.execute(
                    "UPDATE products_dummy SET text_embedding = %s WHERE id = %s",
                    (embedding_obj.values, ids[j])
                )
            
            conn.commit()
            print(f"Processed batch: {min(i + batch_size, total_left)} / {total_left}")
            
            success = True # Break out of the while loop to move to the next batch
            time.sleep(2)  # Pause for 2 seconds to keep our requests-per-minute low
            
        except errors.ClientError as e:
            # If we hit the speed limit, pause and try again. If it's a different error, crash.
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                print("⏳ Free tier speed limit hit! Pausing for 40 seconds to let the API cool down...")
                time.sleep(40)
            else:
                raise e

cur.close()
conn.close()
print("Complete! Your dummy catalog is now successfully powered by Gemini.")