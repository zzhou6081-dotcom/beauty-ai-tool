import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })

  // 清除 cookies
  response.cookies.delete('user_email')
  response.cookies.delete('user_name')

  return response
}
