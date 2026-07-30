import { NextRequest, NextResponse } from 'next/server'
import { loadPrivateDocs } from '@/lib/ip/doc-loader'
import { callClaude } from '@/lib/ip/claude-client'
import { checkWhitelist } from '@/lib/auth/whitelist'

export async function POST(request: NextRequest) {
  try {
    // 检查用户权限
    const userEmail = request.cookies.get('user_email')?.value

    if (!userEmail) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const user = await checkWhitelist(userEmail)

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 401 })
    }

    // 检查 IP 助手权限或积分
    if (!user.modules.ipAssistant && user.credits <= 0) {
      return NextResponse.json({
        error: '您暂无 IP 助手使用权限。请开通会员或充值积分后使用。',
        needUpgrade: true
      }, { status: 403 })
    }

    const { message, customPrompt, conversationHistory, fileContent, fileName } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: '消息内容不能为空' }, { status: 400 })
    }

    // 加载私有方法论文档
    const docs = await loadPrivateDocs()

    // 构建系统提示词
    let systemPrompt = `# 你是一位资深的 IP 操盘手助手

你拥有以下完整的 IP 孵化方法论知识库：

## 1. IP 孵化课程框架
${docs.methodology}

## 2. 爆款开头方法论
${docs.copywritingRules}

## 3. 获客型内容策略
${docs.contentStrategy}

## 4. 医美微整 IP 孵化手册
${docs.dataAnalysis}

---

## 你的核心能力

1. **选题文案生成**：根据用户提供的话题/赛道，生成完整的选题+文案+脚本
2. **数据分析**：分析用户上传的账号数据，给出专业的诊断和优化建议
3. **周期规划**：生成 7/14/30 天的内容选题日历

## 工作原则

- 所有输出必须基于上述方法论，不要凭空杜撰
- 输出要专业、具体、可执行，避免空泛的建议
- 识别用户需求类型（选题文案/数据分析/周期规划），给出对应的专业回复
- 如果用户上传了数据文件，优先分析数据内容
- 保持专业但不失亲和力的语气

## 重要输出规范

### 1. 避免使用方法论专业术语
在输出内容时，**不要直接使用方法论中的专业词汇**，例如：
- ❌ 不要说："这是反认知型选题"
- ✅ 而要说："这个选题通过颠覆常识来吸引用户"
- ❌ 不要说："采用恐惧规避型标题"
- ✅ 而要说："标题用损失厌恶心理激发用户点击"
- ❌ 不要说："使用数字权威型公式"
- ✅ 而要说："标题用具体数字建立可信度"

用通俗易懂的语言解释背后的逻辑，而不是直接套用术语。

### 2. 标题生成规范
当生成标题时，需要**区分平台**并给出不同版本：

**抖音标题（2个）**：
- 特点：短、直接、冲击力强
- 长度：15-20字
- 风格：口语化、悬念感、数字化

**小红书标题（2个）**：
- 特点：表情符号、关键词、可搜索
- 长度：20-30字
- 风格：加emoji、加关键词标签

示例输出格式：
\`\`\`
【抖音标题】
1. 做了2000例双眼皮，失败率最高的就是这一种
2. 这5种人，我死活不建议去打玻尿酸

【小红书标题】
1. 💉2000+案例总结｜这种双眼皮千万别做！❌
2. ⚠️医生劝退指南｜5类人不适合玻尿酸填充
\`\`\`

### 3. 画面建议（非"画面分镜"）
在脚本中提供拍摄建议时，使用"**画面建议**"而非"画面分镜"：

示例：
\`\`\`
**画面建议**：
- 开场：特写面部某个部位，突出问题点
- 中段：切换到对比图或案例展示
- 结尾：回到人物正面，给出核心建议
\`\`\``

    // 如果有自定义提示词，追加到系统提示词中
    if (customPrompt && customPrompt.trim()) {
      systemPrompt += `\n\n## 本项目的专属背景信息\n\n${customPrompt.trim()}\n\n请在回复时考虑这个项目的特定背景。`
    }

    // 构建用户消息
    let userMessage = message

    // 如果有上传文件，将文件内容加入用户消息
    if (fileContent && fileName) {
      userMessage = `【用户上传了数据文件：${fileName}】\n\n文件内容：\n${fileContent}\n\n---\n\n用户问题：${message}`
    }

    // 构建对话历史（最近10条）
    const conversationContext = conversationHistory
      ?.slice(-10)
      .map((msg: any) => `${msg.role === 'user' ? '用户' : 'AI'}：${msg.content}`)
      .join('\n\n')

    const fullUserMessage = conversationContext
      ? `【对话历史】\n${conversationContext}\n\n---\n\n【当前问题】\n${userMessage}\n\n**重要提示**：请基于完整的对话历史回复，避免重复之前已经提供过的选题、文案或建议。如果用户要求生成新内容，请确保与历史记录中的内容有所不同。`
      : userMessage

    // 调用 Claude API
    const response = await callClaude(systemPrompt, fullUserMessage)

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '处理请求时出错' },
      { status: 500 }
    )
  }
}
