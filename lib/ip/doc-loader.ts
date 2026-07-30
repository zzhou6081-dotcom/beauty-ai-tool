import fs from 'fs'
import path from 'path'

/**
 * 加载私有文档内容
 * 这些文档存储你的专有 IP 运营方法论，不会暴露给用户
 */

const DOCS_DIR = path.join(process.cwd(), 'private-docs')

export interface PrivateDocs {
  methodology: string      // IP 运营方法论
  contentStrategy: string  // 内容策略
  copywritingRules: string // 文案创作规则
  dataAnalysis: string     // 数据分析模板
}

/**
 * 读取所有私有文档
 */
export function loadPrivateDocs(): PrivateDocs {
  try {
    const methodology = fs.readFileSync(
      path.join(DOCS_DIR, 'ip-methodology.md'),
      'utf-8'
    )
    const contentStrategy = fs.readFileSync(
      path.join(DOCS_DIR, 'content-strategy.md'),
      'utf-8'
    )
    const copywritingRules = fs.readFileSync(
      path.join(DOCS_DIR, 'copywriting-rules.md'),
      'utf-8'
    )
    const dataAnalysis = fs.readFileSync(
      path.join(DOCS_DIR, 'data-analysis.md'),
      'utf-8'
    )

    return {
      methodology,
      contentStrategy,
      copywritingRules,
      dataAnalysis,
    }
  } catch (error) {
    console.error('[doc-loader] 无法加载私有文档:', error)
    // 返回默认占位内容
    return {
      methodology: '# IP 运营方法论\n暂无内容',
      contentStrategy: '# 内容策略\n暂无内容',
      copywritingRules: '# 文案规则\n暂无内容',
      dataAnalysis: '# 数据分析\n暂无内容',
    }
  }
}

/**
 * 检查私有文档是否存在
 */
export function docsExist(): boolean {
  return fs.existsSync(DOCS_DIR)
}
