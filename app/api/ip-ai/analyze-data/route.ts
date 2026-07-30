import { NextRequest, NextResponse } from 'next/server'
import { callClaude, parseJSONResponse } from '@/lib/ip/claude-client'
import { getDataAnalysisPrompt } from '@/lib/ip/system-prompts'

/**
 * 功能B：数据 → 分析报告
 * POST /api/ip-ai/analyze-data
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { ipInfo, data, dataDescription } = body

    if (!ipInfo || !data) {
      return NextResponse.json(
        { error: '缺少 IP 信息或数据' },
        { status: 400 }
      )
    }

    console.log('[analyze-data] 开始分析')

    // 生成系统提示词
    const systemPrompt = await getDataAnalysisPrompt(ipInfo)

    // 构建用户消息
    let userMessage = '请分析以下运营数据：\n\n'
    if (dataDescription) {
      userMessage += `数据说明：${dataDescription}\n\n`
    }
    userMessage += `数据内容：\n${JSON.stringify(data, null, 2)}`

    // 调用 Claude API
    const response = await callClaude(systemPrompt, userMessage, {
      maxTokens: 3072,
    })

    // 解析 JSON 响应
    const analysis = parseJSONResponse(response as string)

    console.log('[analyze-data] 分析完成')

    return NextResponse.json({
      success: true,
      analysis: {
        accountMetrics: analysis.accountMetrics,
        contentMetrics: analysis.contentMetrics,
        optimization: analysis.optimization,
      },
    })
  } catch (error: any) {
    console.error('[analyze-data] 错误:', error)
    return NextResponse.json(
      {
        error: '分析失败',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
