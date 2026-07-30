/**
 * IP 智能体数据类型定义
 */

export interface IPAgent {
  id: string
  name: string
  type: 'founder' | 'doctor' // 创始人IP / 医生IP
  info: {
    positioning: string      // 定位
    targetAudience: string   // 目标人群
    contentStyle: string     // 内容风格
    keywords: string[]       // 关键词
  }
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  agentId: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  type: 'chat' | 'content-gen' | 'data-analysis' | 'calendar'
}

export interface GeneratedContent {
  id: string
  agentId: string
  topic: string
  content: {
    title: string
    body: string
    conclusion: string
    tags: string[]
  }
  createdAt: string
}

export interface DataAnalysis {
  id: string
  agentId: string
  dataSource: string
  analysis: {
    accountMetrics: string
    contentMetrics: string
    optimization: string
  }
  createdAt: string
}

export interface CalendarPlan {
  id: string
  agentId: string
  days: number
  plans: Array<{
    date: string
    topic: string
    angle: string
    outline: string[]
  }>
  createdAt: string
}
