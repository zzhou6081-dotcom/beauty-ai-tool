import { NextRequest, NextResponse } from 'next/server'
import { callClaude, parseJSONResponse } from '@/lib/ip/claude-client'
import { getContentGenerationPrompt } from '@/lib/ip/system-prompts'
import type { IPAgent } from '@/lib/ip/types'

/**
 * 功能A：选题 → 文案生成
 * POST /api/ip-ai/generate-content
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { ipInfo, topic } = body

    if (!ipInfo || !topic) {
      return NextResponse.json(
        { error: '缺少 IP 信息或选题' },
        { status: 400 }
      )
    }

    console.log('[generate-content] 开始生成:', { ipInfo, topic })

    // 生成系统提示词
    const systemPrompt = getContentGenerationPrompt(ipInfo)

    // 调用 Claude API
    const response = await callClaude(
      systemPrompt,
      `选题：${topic}\n\n请为这个选题创作完整内容。`,
      { maxTokens: 2048 }
    )

    // 解析 JSON 响应
    const content = parseJSONResponse(response as string)

    console.log('[generate-content] 生成成功')

    return NextResponse.json({
      success: true,
      content: {
        title: content.title,
        body: content.body,
        conclusion: content.conclusion,
        tags: content.tags,
      },
    })
  } catch (error: any) {
    console.error('[generate-content] 错误:', error)
    return NextResponse.json(
      {
        error: '生成失败',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
