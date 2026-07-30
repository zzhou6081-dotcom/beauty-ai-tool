'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { useAuth } from '@/hooks/useAuth'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  customPrompt: string // IP专属提示词
  isProject: boolean // 是否是项目（有自定义提示词）
  createdAt: string
  updatedAt: string
}

export default function IPAssistantPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showEditProjectModal, setShowEditProjectModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectPrompt, setNewProjectPrompt] = useState('')
  const [editProjectName, setEditProjectName] = useState('')
  const [editProjectPrompt, setEditProjectPrompt] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 登录检查 - 使用 useEffect 而不是条件性返回
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 加载对话历史
  useEffect(() => {
    const stored = localStorage.getItem('ip-conversations')
    if (stored) {
      const convs = JSON.parse(stored)
      setConversations(convs)
      if (convs.length > 0 && !activeConvId) {
        setActiveConvId(convs[0].id)
        setMessages(convs[0].messages)
      }
    }
  }, [])

  // 切换对话时加载消息
  useEffect(() => {
    if (activeConvId) {
      const conv = conversations.find((c) => c.id === activeConvId)
      if (conv) {
        setMessages(conv.messages)
      }
    }
  }, [activeConvId, conversations])

  // 保存对话到 localStorage
  const saveConversations = (convs: Conversation[]) => {
    localStorage.setItem('ip-conversations', JSON.stringify(convs))
    setConversations(convs)
  }

  // 新建聊天（无需自定义提示词）
  const createNewChat = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: '新聊天',
      messages: [],
      customPrompt: '',
      isProject: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updated = [newConv, ...conversations]
    saveConversations(updated)
    setActiveConvId(newConv.id)
    setMessages([])
  }

  // 打开新建项目模态框
  const openProjectModal = () => {
    setShowProjectModal(true)
  }

  // 打开编辑项目模态框
  const openEditProjectModal = () => {
    const activeConv = conversations.find((c) => c.id === activeConvId)
    if (activeConv && activeConv.isProject) {
      setEditProjectName(activeConv.title)
      setEditProjectPrompt(activeConv.customPrompt)
      setShowEditProjectModal(true)
    }
  }

  // 确认创建新项目
  const confirmCreateProject = () => {
    if (!newProjectName.trim()) {
      alert('请输入项目名称')
      return
    }

    const newConv: Conversation = {
      id: Date.now().toString(),
      title: newProjectName.trim(),
      messages: [],
      customPrompt: newProjectPrompt.trim(),
      isProject: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updated = [newConv, ...conversations]
    saveConversations(updated)
    setActiveConvId(newConv.id)
    setMessages([])
    setShowProjectModal(false)
    setNewProjectName('')
    setNewProjectPrompt('')
  }

  // 确认编辑项目
  const confirmEditProject = () => {
    if (!editProjectName.trim()) {
      alert('请输入项目名称')
      return
    }

    const updated = conversations.map((conv) => {
      if (conv.id === activeConvId) {
        return {
          ...conv,
          title: editProjectName.trim(),
          customPrompt: editProjectPrompt.trim(),
          updatedAt: new Date().toISOString(),
        }
      }
      return conv
    })
    saveConversations(updated)
    setShowEditProjectModal(false)
    setEditProjectName('')
    setEditProjectPrompt('')
  }

  // 删除对话
  const deleteConversation = (id: string) => {
    if (!confirm('确定删除此对话？')) return
    const updated = conversations.filter((c) => c.id !== id)
    saveConversations(updated)
    if (activeConvId === id) {
      if (updated.length > 0) {
        setActiveConvId(updated[0].id)
        setMessages(updated[0].messages)
      } else {
        setActiveConvId(null)
        setMessages([])
      }
    }
  }

  // 发送消息
  const handleSend = async () => {
    if (!input.trim() || loading) return

    // 检查权限
    if (!user?.modules?.ipAssistant && (!user?.credits || user.credits <= 0)) {
      alert('您暂无 IP 助手使用权限。请开通会员或充值积分后使用。')
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }

    // 添加用户消息
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    // 自动调整 textarea 高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      // 获取当前项目的自定义提示词
      const currentConv = conversations.find((c) => c.id === activeConvId)
      const customPrompt = currentConv?.customPrompt || ''

      // 准备请求数据
      const requestBody: any = {
        message: input.trim(),
        customPrompt,
        conversationHistory: updatedMessages.slice(-20), // 增加到最近20条消息作为上下文
      }

      // 如果有上传文件，添加到请求中
      if (uploadedFile) {
        let fileContent = ''

        // 根据文件类型处理
        if (uploadedFile.name.endsWith('.xlsx') || uploadedFile.name.endsWith('.xls')) {
          // Excel文件需要特殊处理
          const XLSX = await import('xlsx')
          const arrayBuffer = await uploadedFile.arrayBuffer()
          const workbook = XLSX.read(arrayBuffer, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          fileContent = XLSX.utils.sheet_to_csv(worksheet)
        } else {
          // 文本类文件直接读取
          fileContent = await uploadedFile.text()
        }

        requestBody.fileContent = fileContent
        requestBody.fileName = uploadedFile.name
      }

      // 调用API
      const response = await fetch('/api/ip-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()

        // 如果是权限问题，显示友好提示
        if (response.status === 403 || errorData.needUpgrade) {
          alert(errorData.error || '您暂无 IP 助手使用权限。请开通会员或充值积分后使用。')
          setLoading(false)
          return
        }

        throw new Error(errorData.error || 'API调用失败')
      }

      const data = await response.json()
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      }

      const finalMessages = [...updatedMessages, assistantMessage]
      setMessages(finalMessages)

      // 清除上传的文件
      setUploadedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // 更新对话标题（取第一条消息的前20个字符）
      let convToUpdate = conversations.find((c) => c.id === activeConvId)
      if (!convToUpdate) {
        // 如果没有活动对话，创建一个
        convToUpdate = {
          id: Date.now().toString(),
          title: input.trim().substring(0, 20) + (input.length > 20 ? '...' : ''),
          messages: finalMessages,
          customPrompt: '',
          isProject: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        const updated = [convToUpdate, ...conversations]
        saveConversations(updated)
        setActiveConvId(convToUpdate.id)
      } else {
        // 更新现有对话
        if (convToUpdate.messages.length === 0) {
          convToUpdate.title = input.trim().substring(0, 20) + (input.length > 20 ? '...' : '')
        }
        convToUpdate.messages = finalMessages
        convToUpdate.updatedAt = new Date().toISOString()
        const updated = conversations.map((c) => (c.id === activeConvId ? convToUpdate! : c))
        saveConversations(updated)
      }
    } catch (error) {
      console.error('发送失败:', error)
      alert('发送失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // Enter 发送，Shift+Enter 换行
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 自动调整 textarea 高度
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
  }

  // 处理文件上传
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 限制文件类型和大小
      const allowedTypes = ['.txt', '.csv', '.json', '.xlsx', '.xls', '.md', '.pdf']
      const maxSize = 10 * 1024 * 1024 // 10MB

      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()
      if (!allowedTypes.includes(fileExt)) {
        alert('仅支持 TXT、CSV、JSON、Excel、Markdown、PDF 格式文件')
        return
      }

      if (file.size > maxSize) {
        alert('文件大小不能超过 10MB')
        return
      }

      setUploadedFile(file)
    }
  }

  const activeConv = conversations.find((c) => c.id === activeConvId)

  // 显示加载状态
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  // 如果未登录，返回 null（useEffect 会处理跳转）
  if (!user) {
    return null
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={[
            'bg-gray-900 text-white flex flex-col transition-all duration-300',
            sidebarOpen ? 'w-64' : 'w-0',
          ].join(' ')}
        >
          {sidebarOpen && (
            <>
              {/* Header - 两个按钮 */}
              <div className="p-4 border-b border-gray-700 space-y-2">
                <button
                  onClick={createNewChat}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  新聊天
                </button>
                <button
                  onClick={openProjectModal}
                  className="w-full bg-rose-600/80 hover:bg-rose-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  新建项目
                </button>
              </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-2">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  还没有对话记录
                  <p className="text-xs text-gray-500 mt-2">点击上方按钮开始</p>
                </div>
              ) : (
                <>
                  {/* 项目区域 */}
                  {conversations.filter(c => c.isProject).length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 px-2 mb-2 font-medium">项目</div>
                      {conversations.filter(c => c.isProject).map((conv) => (
                        <div
                          key={conv.id}
                          onClick={() => setActiveConvId(conv.id)}
                          className={[
                            'group flex items-center gap-2 p-3 mb-1 rounded-lg cursor-pointer transition-all',
                            activeConvId === conv.id
                              ? 'bg-gray-700 shadow-lg'
                              : 'hover:bg-gray-800',
                          ].join(' ')}
                        >
                          <div className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate font-medium">{conv.title}</p>
                            <p className="text-xs text-gray-400 truncate">
                              {new Date(conv.updatedAt).toLocaleDateString('zh-CN')}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteConversation(conv.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 text-sm transition-opacity"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 聊天区域 */}
                  {conversations.filter(c => !c.isProject).length > 0 && (
                    <div>
                      <div className="text-xs text-gray-500 px-2 mb-2 font-medium">聊天</div>
                      {conversations.filter(c => !c.isProject).map((conv) => (
                        <div
                          key={conv.id}
                          onClick={() => setActiveConvId(conv.id)}
                          className={[
                            'group flex items-center gap-2 p-3 mb-1 rounded-lg cursor-pointer transition-all',
                            activeConvId === conv.id
                              ? 'bg-gray-700 shadow-lg'
                              : 'hover:bg-gray-800',
                          ].join(' ')}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{conv.title}</p>
                            <p className="text-xs text-gray-400 truncate">
                              {new Date(conv.updatedAt).toLocaleDateString('zh-CN')}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteConversation(conv.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 text-sm transition-opacity"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700">
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' })
                  router.push('/login')
                }}
                className="w-full text-sm text-gray-400 hover:text-white py-2 transition-colors text-left"
              >
                ← 退出登录
              </button>
            </div>
          </>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900 flex-1">
            {activeConv?.title || 'IP 操盘手助手'}
          </h1>
          {activeConv?.isProject && (
            <>
              <span className="text-xs bg-rose-100 text-rose-600 px-2 py-1 rounded">
                项目
              </span>
              <button
                onClick={openEditProjectModal}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                编辑项目
              </button>
            </>
          )}
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4">
              <div className="text-6xl mb-6">⚡</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                IP 助手
              </h2>
              <p className="text-gray-500 text-center max-w-md mb-8">
                基于专业方法论，为你提供选题文案、数据分析和周期规划服务
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
                <button
                  onClick={() => setInput('帮我生成一篇关于医美双眼皮的选题文案')}
                  className="bg-white border-2 border-gray-200 hover:border-rose-300 rounded-xl p-4 text-left transition-all hover:shadow-md"
                >
                  <div className="text-2xl mb-2">📝</div>
                  <h3 className="font-semibold text-gray-900 mb-1">选题文案</h3>
                  <p className="text-sm text-gray-600">
                    输入话题，生成完整文案
                  </p>
                </button>
                <button
                  onClick={() => setInput('分析我的账号数据')}
                  className="bg-white border-2 border-gray-200 hover:border-rose-300 rounded-xl p-4 text-left transition-all hover:shadow-md"
                >
                  <div className="text-2xl mb-2">📊</div>
                  <h3 className="font-semibold text-gray-900 mb-1">数据分析</h3>
                  <p className="text-sm text-gray-600">
                    上传数据，获取分析报告
                  </p>
                </button>
                <button
                  onClick={() => setInput('帮我规划未来14天的选题')}
                  className="bg-white border-2 border-gray-200 hover:border-rose-300 rounded-xl p-4 text-left transition-all hover:shadow-md"
                >
                  <div className="text-2xl mb-2">📅</div>
                  <h3 className="font-semibold text-gray-900 mb-1">周期规划</h3>
                  <p className="text-sm text-gray-600">
                    生成7/14/30天选题日历
                  </p>
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto py-8 px-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={[
                    'flex gap-4 mb-6',
                    msg.role === 'user' ? 'justify-end' : 'justify-start',
                  ].join(' ')}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center flex-shrink-0 text-white font-bold shadow-md">
                      AI
                    </div>
                  )}
                  <div
                    className={[
                      'max-w-[80%] rounded-2xl px-4 py-3 shadow-sm',
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-rose-600 to-rose-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-900',
                    ].join(' ')}
                  >
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </div>
                    <div
                      className={[
                        'text-xs mt-2 flex items-center gap-1',
                        msg.role === 'user' ? 'text-rose-100' : 'text-gray-400',
                      ].join(' ')}
                    >
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-gray-600 font-bold">
                      U
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-4 mb-6">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center flex-shrink-0 text-white font-bold shadow-md">
                    AI
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" />
                      <span
                        className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.15s' }}
                      />
                      <span
                        className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.3s' }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-3xl mx-auto">
            {/* 文件上传提示 */}
            {uploadedFile && (
              <div className="mb-3 flex items-center gap-2 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-lg px-3 py-2 text-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <span className="text-rose-600">📎</span>
                <span className="flex-1 text-rose-700 truncate font-medium">{uploadedFile.name}</span>
                <span className="text-xs text-rose-500">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </span>
                <button
                  onClick={() => {
                    setUploadedFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="text-rose-400 hover:text-rose-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex gap-3 items-end">
              {/* 文件上传按钮 */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                accept=".txt,.csv,.json,.xlsx,.xls,.md,.pdf"
                className="hidden"
              />
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="text-gray-500 hover:text-rose-600 disabled:text-gray-300 p-3 rounded-lg hover:bg-rose-50 transition-all"
                  title="上传数据文件进行分析"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <span className="text-xs text-gray-400">上传文件</span>
              </div>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="输入你的需求...（Enter 发送，Shift+Enter 换行）"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 resize-none overflow-hidden transition-all"
                style={{ minHeight: '48px', maxHeight: '200px' }}
                disabled={loading}
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:shadow-none transform hover:scale-105 disabled:scale-100"
              >
                {loading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  '发送'
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">
              本平台基于 Claude AI 和 ChatGPT，为 IP 内容运营提供智能化支持。所有对话数据完全保密。
            </p>
          </div>
        </div>
      </main>
      </div>

      {/* 新建项目模态框 */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">新建 IP 项目</h2>
            <p className="text-sm text-gray-600 mb-4">
              为这个 IP 项目设置名称和专属提示词，AI 将根据方法论和提示词生成专业内容。
            </p>

            {/* 项目名称 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                项目名称 *
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="例如：医美双眼皮IP、抗衰保养IP..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-400"
              />
            </div>

            {/* IP提示词 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IP 专属提示词（可选）
              </label>
              <textarea
                value={newProjectPrompt}
                onChange={(e) => setNewProjectPrompt(e.target.value)}
                placeholder="例如：这是一个医美双眼皮项目的IP，目标受众是25-35岁女性，主打自然美学，注重术后恢复周期的展示..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-400 resize-none"
                rows={6}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowProjectModal(false)
                  setNewProjectName('')
                  setNewProjectPrompt('')
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmCreateProject}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
              >
                创建项目
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑项目模态框 */}
      {showEditProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">编辑项目</h2>
            <p className="text-sm text-gray-600 mb-4">
              修改项目名称和 IP 专属提示词
            </p>

            {/* 项目名称 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                项目名称 *
              </label>
              <input
                type="text"
                value={editProjectName}
                onChange={(e) => setEditProjectName(e.target.value)}
                placeholder="例如：医美双眼皮IP、抗衰保养IP..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-400"
              />
            </div>

            {/* IP提示词 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IP 专属提示词（可选）
              </label>
              <textarea
                value={editProjectPrompt}
                onChange={(e) => setEditProjectPrompt(e.target.value)}
                placeholder="例如：这是一个医美双眼皮项目的IP，目标受众是25-35岁女性，主打自然美学，注重术后恢复周期的展示..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-400 resize-none"
                rows={6}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEditProjectModal(false)
                  setEditProjectName('')
                  setEditProjectPrompt('')
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmEditProject}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
              >
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
