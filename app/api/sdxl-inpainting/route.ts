import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

export interface InpaintingRequest {
  imageUrl: string
  maskUrl: string
  prompt: string
  negativePrompt?: string
  strength?: number
}

export async function POST(req: NextRequest) {
  try {
    const body: InpaintingRequest = await req.json()
    const { imageUrl, maskUrl, prompt, negativePrompt, strength = 0.99 } = body

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: '缺少图片 URL' }, { status: 400 })
    }

    if (!maskUrl || typeof maskUrl !== 'string') {
      return NextResponse.json({ error: '缺少mask URL' }, { status: 400 })
    }

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: '缺少提示词' }, { status: 400 })
    }

    console.log('[sdxl-inpainting] 开始生成')
    console.log('[sdxl-inpainting] prompt:', prompt.substring(0, 100))

    // 使用 Stable Diffusion 1.5 Inpainting - 支持base64
    const output = await replicate.run(
      "stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3",
      {
        input: {
          image: imageUrl,
          mask: maskUrl,
          prompt: prompt,
          negative_prompt: negativePrompt || "blurry, bad quality, distorted, different person, changed face",
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
      }
    )

    console.log('[sdxl-inpainting] 生成完成')
    console.log('[sdxl-inpainting] output类型:', typeof output)

    // 处理返回结果
    let resultUrl: string | undefined

    if (output && output.constructor && output.constructor.name === 'FileOutput') {
      const fileOutput = output as any
      if (typeof fileOutput.url === 'function') {
        const urlResult = await fileOutput.url()
        resultUrl = String(urlResult)
      }
    } else if (typeof output === 'string') {
      resultUrl = output
    } else if (Array.isArray(output) && output.length > 0) {
      resultUrl = output[0]
    }

    if (!resultUrl || typeof resultUrl !== 'string') {
      console.error('[sdxl-inpainting] 无法获取图片URL')
      throw new Error('生成失败：未返回有效的图片URL')
    }

    console.log('[sdxl-inpainting] 结果URL:', resultUrl.substring(0, 100))

    return NextResponse.json({
      requestId: `sdxl_${Date.now()}`,
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
    console.error('[sdxl-inpainting] 错误:', err)
    return NextResponse.json({
      error: err.message || '生成失败',
      details: err.toString()
    }, { status: 500 })
  }
}
