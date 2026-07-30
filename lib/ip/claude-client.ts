import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

/**
 * 调用 Claude API
 */
export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  options: {
    stream?: boolean
    maxTokens?: number
  } = {}
): Promise<string> {
  const { stream = false, maxTokens = 4096 } = options

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    const textContent = response.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response')
    }

    return textContent.text
  } catch (error) {
    console.error('[claude-client] API 调用失败:', error)
    throw error
  }
}

/**
 * 流式调用 Claude API（用于聊天界面）
 */
export async function callClaudeStream(
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  maxTokens: number = 4096
) {
  return anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages,
  })
}

/**
 * 解析 JSON 响应（Claude 有时会在 JSON 外包裹其他文字）
 */
export function parseJSONResponse(text: string): any {
  // 尝试直接解析
  try {
    return JSON.parse(text)
  } catch {
    // 提取 JSON 块
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0])
      } catch {
        throw new Error('无法解析 JSON 响应')
      }
    }

    // 提取 JSON 数组
    const arrayMatch = text.match(/\[[\s\S]*\]/)
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0])
      } catch {
        throw new Error('无法解析 JSON 响应')
      }
    }

    throw new Error('响应中未找到有效的 JSON')
  }
}
