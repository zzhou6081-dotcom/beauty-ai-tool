import { NextRequest, NextResponse } from 'next/server'
import { checkWhitelist } from '@/lib/auth/whitelist'

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.cookies.get('user_email')?.value

    if (!userEmail) {
      return NextResponse.json({ authenticated: false })
    }

    // 验证白名单
    const user = await checkWhitelist(userEmail)

    if (!user) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        email: user.email,
        name: user.name,
        modules: user.modules,
        credits: user.credits,
      },
    })
  } catch (error) {
    console.error('[Auth] Check failed:', error)
    return NextResponse.json({ authenticated: false })
  }
}
