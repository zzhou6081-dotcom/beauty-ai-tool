import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { imageUrl, prompt } = body

    if (!imageUrl || !prompt) {
      return NextResponse.json({ error: '缺少图片或提示词' }, { status: 400 })
    }

    // 提取base64数据
    const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/)
    if (!matches) {
      return NextResponse.json({ error: '图片格式无效' }, { status: 400 })
    }
    const mimeType = matches[1]
    const base64Data = matches[2]

    console.log('[gemini-edit] 开始生成，mimeType:', mimeType)
    console.log('[gemini-edit] 图片大小:', Math.round(base64Data.length / 1024), 'KB')
    console.log('[gemini-edit] prompt:', prompt.substring(0, 100))

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-image-generation',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    })

    console.log('[gemini-edit] 生成完成')

    // 提取生成的图片
    const parts = response.candidates?.[0]?.content?.parts ?? []
    let resultBase64: string | undefined
    let resultMimeType = 'image/jpeg'

    for (const part of parts) {
      if (part.inlineData?.data) {
        resultBase64 = part.inlineData.data
        resultMimeType = part.inlineData.mimeType ?? 'image/jpeg'
        break
      }
    }

    if (!resultBase64) {
      console.error('[gemini-edit] 未返回图片数据')
      return NextResponse.json({ error: '生成失败，未返回图片' }, { status: 500 })
    }

    const resultUrl = `data:${resultMimeType};base64,${resultBase64}`
    console.log('[gemini-edit] 成功，图片大小:', Math.round(resultBase64.length / 1024), 'KB')

    return NextResponse.json({
      requestId: `gemini_${Date.now()}`,
      status: 'COMPLETED',
      result: {
        images: [{ url: resultUrl, width: 1024, height: 1024 }],
      },
    })
  } catch (err: any) {
    console.error('[gemini-edit] 错误:', err)
    return NextResponse.json({
      error: err.message || '生成失败',
      details: err.toString(),
    }, { status: 500 })
  }
}
