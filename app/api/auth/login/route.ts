import { NextRequest, NextResponse } from 'next/server'
import { loadWhitelist } from '@/lib/auth/whitelist'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: '请输入邮箱和密码' }, { status: 400 })
    }

    // 加载用户列表
    const whitelist = await loadWhitelist()
    const user = whitelist.get(email.toLowerCase())

    if (!user) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
    }

    // 验证密码
    // 如果用户有密码字段，验证密码；如果没有密码字段（老用户/管理员添加的用户），允许任意密码登录
    if (user.password && user.password !== password) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
    }

    // 检查是否过期
    if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
      return NextResponse.json({ error: '账号已过期，请联系管理员' }, { status: 403 })
    }

    // 创建响应并设置 cookie
    const response = NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        modules: user.modules,
        credits: user.credits,
        expiresAt: user.expiresAt,
      },
    })

    // 设置 cookie（7天有效期）
    response.cookies.set('user_email', user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    response.cookies.set('user_name', user.name, {
      httpOnly: false, // 前端需要读取显示
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error('[Auth] Login failed:', error)
    return NextResponse.json({ error: '登录失败，请重试' }, { status: 500 })
  }
}
