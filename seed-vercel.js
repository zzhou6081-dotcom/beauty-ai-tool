#!/usr/bin/env node
/**
 * 一键将用户数据和文档上传到 Vercel KV
 * 运行: node seed-vercel.js
 */

const fs = require('fs')
const path = require('path')
const https = require('https')

const BASE_URL = 'https://beauty-ai-tool-lake.vercel.app'
const SECRET = 'seed-beauty-2026'

function post(url, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data)
    const urlObj = new URL(url)
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }) }
        catch { resolve({ status: res.statusCode, body: data }) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function main() {
  console.log('🚀 开始初始化 Vercel KV 数据...\n')

  // 1. 上传用户数据
  console.log('📋 上传用户数据...')
  const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/whitelist.json'), 'utf-8'))
  const userResult = await post(`${BASE_URL}/api/admin/seed-kv`, { secret: SECRET, users })
  if (userResult.status === 200 && userResult.body.success) {
    console.log(`   ✅ 成功：${userResult.body.count} 个用户已上传`)
  } else {
    console.log(`   ❌ 失败：`, userResult.body)
  }

  // 2. 上传 IP 方法论文档
  console.log('\n📚 上传 IP 方法论文档...')
  const docsDir = path.join(__dirname, 'private-docs')
  const docs = {
    methodology: fs.readFileSync(path.join(docsDir, 'ip-methodology.md'), 'utf-8'),
    contentStrategy: fs.readFileSync(path.join(docsDir, 'content-strategy.md'), 'utf-8'),
    copywritingRules: fs.readFileSync(path.join(docsDir, 'copywriting-rules.md'), 'utf-8'),
    dataAnalysis: fs.readFileSync(path.join(docsDir, 'data-analysis.md'), 'utf-8'),
  }
  const docsResult = await post(`${BASE_URL}/api/admin/upload-docs`, { secret: SECRET, ...docs })
  if (docsResult.status === 200 && docsResult.body.success) {
    console.log('   ✅ 成功：IP 方法论文档已上传')
  } else {
    console.log('   ❌ 失败：', docsResult.body)
  }

  console.log('\n🎉 完成！访问 https://beauty-ai-tool-lake.vercel.app 开始使用')
}

main().catch(console.error)
