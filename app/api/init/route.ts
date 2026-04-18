import { initializeDatabase } from '@/lib/db'
import { seedDatabase } from '@/lib/seed'

export async function GET() {
  try {
    console.log('[v0] Initializing database...')
    await initializeDatabase()
    console.log('[v0] Seeding database with products...')
    await seedDatabase()
    return Response.json({ success: true, message: 'Database initialized and seeded' })
  } catch (error) {
    console.error('[v0] Init error:', error)
    return Response.json({ success: false, error: String(error) }, { status: 500 })
  }
}
