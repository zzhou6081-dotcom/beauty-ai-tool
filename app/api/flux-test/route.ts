import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

export interface FluxGenerateRequest {
  imageUrl: string
  prompt: string
  strength?: number
}

export async function POST(req: NextRequest) {
  try {
    const body: FluxGenerateRequest = await req.json()
    const { imageUrl, prompt, strength = 0.65 } = body

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: '缺少图片 URL' }, { status: 400 })
    }

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: '缺少提示词' }, { status: 400 })
    }

    console.log('[flux-test] 开始生成，prompt:', prompt.substring(0, 100))
    console.log('[flux-test] 图片大小:', Math.round(imageUrl.length / 1024), 'KB')

    // 使用 Flux 1.1 Pro 进行图像编辑
    const output = await replicate.run(
      "black-forest-labs/flux-1.1-pro",
      {
        input: {
          prompt: prompt,
          image: imageUrl,
          prompt_strength: strength,
          output_format: "jpg",
          output_quality: 90,
          aspect_ratio: "1:1",
        },
      }
    )

    console.log('[flux-test] 生成完成')
    console.log('[flux-test] output类型:', typeof output)
    console.log('[flux-test] output constructor:', output?.constructor?.name)

    // Replicate的FileOutput对象需要特殊处理
    let resultUrl: string | undefined

    // FileOutput对象 - 需要调用url()方法或读取stream
    if (output && output.constructor && output.constructor.name === 'FileOutput') {
      console.log('[flux-test] 检测到FileOutput对象')
      const fileOutput = output as any

      // FileOutput有url()方法返回Promise
      if (typeof fileOutput.url === 'function') {
        const urlResult = await fileOutput.url()
        console.log('[flux-test] url()返回类型:', typeof urlResult)
        console.log('[flux-test] url()返回值:', urlResult)
        resultUrl = String(urlResult)
        console.log('[flux-test] 转换为字符串:', resultUrl)
      } else if (typeof fileOutput.toString === 'function') {
        resultUrl = fileOutput.toString()
        console.log('[flux-test] 通过toString()获取:', resultUrl)
      } else {
        // 尝试读取stream
        console.log('[flux-test] 尝试读取FileOutput的stream...')
        const chunks: Buffer[] = []
        for await (const chunk of fileOutput) {
          chunks.push(Buffer.from(chunk))
        }
        const buffer = Buffer.concat(chunks)
        resultUrl = buffer.toString('utf-8').trim()
        console.log('[flux-test] Stream读取结果:', resultUrl)
      }
    } else if (typeof output === 'string') {
      resultUrl = output
    } else if (Array.isArray(output) && output.length > 0) {
      resultUrl = output[0]
    }

    if (!resultUrl || typeof resultUrl !== 'string' || resultUrl === '[object Object]') {
      console.error('[flux-test] 无法获取图片URL')
      console.error('[flux-test] output详情:', output)
      console.error('[flux-test] output keys:', Object.keys(output || {}))
      throw new Error('生成失败：未返回有效的图片URL')
    }

    console.log('[flux-test] 结果URL:', resultUrl.substring(0, 100))

    return NextResponse.json({
      requestId: `flux_${Date.now()}`,
      status: 'COMPLETED',
      result: {
        images: [{
          url: resultUrl,
          width: 1024,
          height: 1024,
        }],
      },
    })
  } catch (err: any) {
    console.error('[flux-test] 错误:', err)
    return NextResponse.json({
      error: err.message || '生成失败',
      details: err.toString()
    }, { status: 500 })
  }
}
