import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

const KV_KEY = 'beauty_whitelist'
const SEED_SECRET = process.env.SEED_SECRET || 'seed-beauty-2026'

/**
 * POST /api/admin/seed-kv
 * 首次部署时调用，将初始用户数据写入 KV
 * Body: { secret: string, users: UserPermissions[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 简单鉴权
    if (body.secret !== SEED_SECRET) {
      return NextResponse.json({ error: '无权操作' }, { status: 403 })
    }

    const users = body.users
    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'users 不能为空' }, { status: 400 })
    }

    await kv.set(KV_KEY, users)
    return NextResponse.json({ success: true, count: users.length })
  } catch (error) {
    console.error('[Seed KV] Failed:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

/**
 * GET /api/admin/seed-kv
 * 查看当前 KV 中的用户数量（不返回敏感数据）
 */
export async function GET(request: NextRequest) {
  try {
    const data = await kv.get<any[]>(KV_KEY)
    return NextResponse.json({
      count: data?.length ?? 0,
      emails: data?.map(u => u.email) ?? [],
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
