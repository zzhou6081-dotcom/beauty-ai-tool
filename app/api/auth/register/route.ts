import { NextResponse } from 'next/server'
import { loadWhitelist, saveWhitelist } from '@/lib/auth/whitelist'
import type { UserPermissions } from '@/lib/auth/whitelist'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '请填写完整信息' },
        { status: 400 }
      )
    }

    // Load existing users
    const whitelist = await loadWhitelist()

    // Check if email already exists
    const existingUser = whitelist.get(email.toLowerCase())
    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      )
    }

    // Create new user with default permissions
    const newUser: UserPermissions = {
      email: email.toLowerCase(),
      name,
      password, // Store password (in production, should be hashed)
      modules: {
        ipAssistant: false,
        imageGeneration: false,
        workflow: false,
        assets: true, // Allow assets by default so they can see the dashboard
      },
      credits: 0,
      expiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add to whitelist
    whitelist.set(newUser.email, newUser)
    await saveWhitelist(whitelist)

    return NextResponse.json(
      {
        success: true,
        message: '注册成功',
        user: {
          email: newUser.email,
          name: newUser.name,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: '注册失败，请重试' },
      { status: 500 }
    )
  }
}
