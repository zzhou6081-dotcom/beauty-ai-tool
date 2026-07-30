import path from 'path'

/**
 * 加载私有文档内容
 * 本地开发：从 private-docs/ 目录读取
 * 生产环境（Vercel）：从 Vercel KV 读取
 */

const isProduction = process.env.KV_REST_API_URL !== undefined

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

async function loadFromKV(): Promise<PrivateDocs> {
  try {
    const { kv } = await import('@vercel/kv')
    const docs = await kv.get<PrivateDocs>('beauty_private_docs')
    if (docs) return docs
  } catch (error) {
    console.error('[doc-loader] KV 读取失败:', error)
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
  return isProduction ? loadFromKV() : loadFromFile()
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
