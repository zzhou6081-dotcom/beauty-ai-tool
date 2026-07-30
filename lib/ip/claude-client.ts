/**
 * AI 客户端
 * 使用 OpenAI 兼容接口（支持中转站）
 */

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

async function callOpenAICompat(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number = 4096
): Promise<string> {
  const baseURL = process.env.ANTHROPIC_BASE_URL || 'https://cc.zhihuiapi.top'
  const apiKey = process.env.ANTHROPIC_API_KEY || ''
  const model = process.env.CLAUDE_MODEL || 'gpt-5.4-mini'

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ]

  const res = await fetch(`${baseURL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`AI API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('No content in AI response')
  return content
}

export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  options: { maxTokens?: number } = {}
): Promise<string> {
  const { maxTokens = 4096 } = options
  try {
    return await callOpenAICompat(systemPrompt, userMessage, maxTokens)
  } catch (error) {
    console.error('[claude-client] API 调用失败:', error)
    throw error
  }
}

export function parseJSONResponse(text: string): any {
  try {
    return JSON.parse(text)
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[0]) } catch {}
    }
    const arrayMatch = text.match(/\[[\s\S]*\]/)
    if (arrayMatch) {
      try { return JSON.parse(arrayMatch[0]) } catch {}
    }
    throw new Error('无法解析 JSON 响应')
  }
}
