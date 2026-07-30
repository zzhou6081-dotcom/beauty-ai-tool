import { NextRequest, NextResponse } from 'next/server'
import { getAllUsers, upsertUser, deleteUser } from '@/lib/auth/whitelist'

// GET - 获取所有用户
export async function GET(request: NextRequest) {
  try {
    const users = await getAllUsers()
    return NextResponse.json({ users })
  } catch (error) {
    console.error('[Admin API] Get users failed:', error)
    return NextResponse.json({ error: '获取用户列表失败' }, { status: 500 })
  }
}

// POST - 添加或更新用户
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, modules, credits, expiresAt } = body

    if (!email || !name) {
      return NextResponse.json({ error: '邮箱和姓名不能为空' }, { status: 400 })
    }

    await upsertUser({
      email,
      name,
      modules: modules || {
        ipAssistant: false,
        imageGeneration: false,
        workflow: false,
        assets: false,
      },
      credits: credits || 0,
      expiresAt: expiresAt || null,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Admin API] Upsert user failed:', error)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}

// DELETE - 删除用户
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: '邮箱不能为空' }, { status: 400 })
    }

    await deleteUser(email)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Admin API] Delete user failed:', error)
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}
