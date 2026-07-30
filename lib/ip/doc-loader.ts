import path from 'path'

const isProduction = !!process.env.REDIS_URL

export interface PrivateDocs {
  methodology: string
  contentStrategy: string
  copywritingRules: string
  dataAnalysis: string
}

const FALLBACK: PrivateDocs = {
  methodology: '# IP 运营方法论\n暂无内容，请联系管理员上传文档。',
  contentStrategy: '# 内容策略\n暂无内容。',
  copywritingRules: '# 文案规则\n暂无内容。',
  dataAnalysis: '# 数据分析\n暂无内容。',
}

async function loadFromRedis(): Promise<PrivateDocs> {
  const { createClient } = await import('redis')
  const client = createClient({ url: process.env.REDIS_URL })
  try {
    await client.connect()
    const raw = await client.get('beauty_private_docs')
    await client.disconnect()
    if (raw) return JSON.parse(raw) as PrivateDocs
  } catch (error) {
    console.error('[doc-loader] Redis 读取失败:', error)
    try { await client.disconnect() } catch {}
  }
  return FALLBACK
}

function loadFromFile(): PrivateDocs {
  try {
    const fs = require('fs')
    const DOCS_DIR = path.join(process.cwd(), 'private-docs')
    return {
      methodology: fs.readFileSync(path.join(DOCS_DIR, 'ip-methodology.md'), 'utf-8'),
      contentStrategy: fs.readFileSync(path.join(DOCS_DIR, 'content-strategy.md'), 'utf-8'),
      copywritingRules: fs.readFileSync(path.join(DOCS_DIR, 'copywriting-rules.md'), 'utf-8'),
      dataAnalysis: fs.readFileSync(path.join(DOCS_DIR, 'data-analysis.md'), 'utf-8'),
    }
  } catch (error) {
    console.error('[doc-loader] 文件读取失败:', error)
    return FALLBACK
  }
}

export async function loadPrivateDocs(): Promise<PrivateDocs> {
  return isProduction ? loadFromRedis() : loadFromFile()
}

export function docsExist(): boolean {
  if (isProduction) return true
  try {
    const fs = require('fs')
    return fs.existsSync(path.join(process.cwd(), 'private-docs'))
  } catch {
    return false
  }
}
