import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  // Security: Vercel sends a secret header with cron jobs to ensure hackers can't trigger this manually
  // use secret key when deploying on vercel CRON_SECRET=super_secret_cleanup_key_999
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    // Delete any tracking history older than 30 days
    const result = await sql`
      DELETE FROM user_views 
      WHERE viewed_at < NOW() - INTERVAL '30 days'
    `
    return NextResponse.json({ success: true, message: "Database cleanup complete." })
  } catch (error) {
    console.error("Cleanup cron failed:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}