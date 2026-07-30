import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'redis'

const SEED_SECRET = process.env.SEED_SECRET || 'seed-beauty-2026'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (body.secret !== SEED_SECRET) {
      return NextResponse.json({ error: '无权操作' }, { status: 403 })
    }
    const users = body.users
    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'users 不能为空' }, { status: 400 })
    }
    const client = createClient({ url: process.env.REDIS_URL })
    await client.connect()
    await client.set('beauty_whitelist', JSON.stringify(users))
    await client.disconnect()
    return NextResponse.json({ success: true, count: users.length })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function GET() {
  try {
    const client = createClient({ url: process.env.REDIS_URL })
    await client.connect()
    const raw = await client.get('beauty_whitelist')
    await client.disconnect()
    const users = raw ? JSON.parse(raw) : []
    return NextResponse.json({ count: users.length, emails: users.map((u: any) => u.email) })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
