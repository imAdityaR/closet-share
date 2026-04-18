import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function initializeDatabase() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT now()
      )
    `

    // Create products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        productDisplay TEXT NOT NULL,
        gender TEXT,
        masterCategory TEXT,
        subCategory TEXT,
        articleType TEXT,
        baseColour TEXT,
        season TEXT,
        year INTEGER,
        usage TEXT,
        rentalPricePerDay INTEGER,
        securityDeposit INTEGER,
        imageUrl TEXT,
        created_at TIMESTAMP DEFAULT now()
      )
    `

    // Create wishlist table
    await sql`
      CREATE TABLE IF NOT EXISTS wishlist (
        user_id TEXT NOT NULL,
        product_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        PRIMARY KEY (user_id, product_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `

    // Create cart table
    await sql`
      CREATE TABLE IF NOT EXISTS cart (
        user_id TEXT NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT now(),
        PRIMARY KEY (user_id, product_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `

    // Create orders table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        total_paid INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `

    // Create order_items table
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        order_id TEXT NOT NULL,
        product_id INTEGER NOT NULL,
        rental_days INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT now(),
        PRIMARY KEY (order_id, product_id),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `

    console.log('[v0] Database initialized successfully')
  } catch (error) {
    console.error('[v0] Database initialization error:', error)
    throw error
  }
}

export { sql }
