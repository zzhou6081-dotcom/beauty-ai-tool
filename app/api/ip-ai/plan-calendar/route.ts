import { NextRequest, NextResponse } from 'next/server'
import { callClaude, parseJSONResponse } from '@/lib/ip/claude-client'
import { getCalendarPlanningPrompt } from '@/lib/ip/system-prompts'

/**
 * 功能C：周期性选题规划
 * POST /api/ip-ai/plan-calendar
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { ipInfo, days = 14, context } = body

    if (!ipInfo) {
      return NextResponse.json(
        { error: '缺少 IP 信息' },
        { status: 400 }
      )
    }

    console.log('[plan-calendar] 开始规划:', { days })

    // 生成系统提示词
    const systemPrompt = await getCalendarPlanningPrompt(ipInfo, days)

    // 构建用户消息
    let userMessage = `请为未来 ${days} 天规划选题日历。`
    if (context) {
      userMessage += `\n\n补充信息：${context}`
    }

    // 调用 Claude API
    const response = await callClaude(systemPrompt, userMessage, {
      maxTokens: 4096,
    })

    // 解析 JSON 响应
    const plans = parseJSONResponse(response as string)

    console.log('[plan-calendar] 规划完成，共', plans.length, '条')

    return NextResponse.json({
      success: true,
      plans,
    })
  } catch (error: any) {
    console.error('[plan-calendar] 错误:', error)
    return NextResponse.json(
      {
        error: '规划失败',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
