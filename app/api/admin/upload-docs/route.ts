import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'redis'

const SEED_SECRET = process.env.SEED_SECRET || 'seed-beauty-2026'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (body.secret !== SEED_SECRET) {
      return NextResponse.json({ error: '无权操作' }, { status: 403 })
    }
    const { methodology, contentStrategy, copywritingRules, dataAnalysis } = body
    if (!methodology || !contentStrategy || !copywritingRules || !dataAnalysis) {
      return NextResponse.json({ error: '缺少文档字段' }, { status: 400 })
    }
    const client = createClient({ url: process.env.REDIS_URL })
    await client.connect()
    await client.set('beauty_private_docs', JSON.stringify({ methodology, contentStrategy, copywritingRules, dataAnalysis }))
    await client.disconnect()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function GET() {
  try {
    const client = createClient({ url: process.env.REDIS_URL })
    await client.connect()
    const raw = await client.get('beauty_private_docs')
    await client.disconnect()
    return NextResponse.json({ exists: !!raw })
  } catch (error) {
    return NextResponse.json({ exists: false, error: String(error) })
  }
}
