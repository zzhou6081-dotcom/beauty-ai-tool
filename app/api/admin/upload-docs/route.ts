import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

const SEED_SECRET = process.env.SEED_SECRET || 'seed-beauty-2026'

/**
 * POST /api/admin/upload-docs
 * 将 IP 方法论文档上传到 KV，供生产环境 IP 助手使用
 */
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

    await kv.set('beauty_private_docs', {
      methodology,
      contentStrategy,
      copywritingRules,
      dataAnalysis,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[upload-docs] Failed:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { kv: kvClient } = await import('@vercel/kv')
    const docs = await kvClient.get('beauty_private_docs')
    return NextResponse.json({ exists: !!docs })
  } catch (error) {
    return NextResponse.json({ exists: false, error: String(error) })
  }
}
