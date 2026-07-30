import { NextRequest, NextResponse } from 'next/server'
import { STEP1_PROMPTS, STEP2_PROMPT, STEP3_PROMPTS, STEP4_PROMPTS } from '@/lib/prompts'
import type { Step1Style, Step3Style } from '@/lib/types'

const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY!
const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/images/generations'

export interface GenerateRequest {
  step: 1 | 2 | 3 | 4
  imageUrl: string
  variant?: string // Step1: Step1Style, Step3: Step3Style, Step4: day number as string
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json()
    const { step, imageUrl, variant } = body

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: '缺少图片 URL' }, { status: 400 })
    }

    let prompt: string

    if (step === 1) {
      if (!variant || !(variant in STEP1_PROMPTS)) {
        return NextResponse.json({ error: '无效的双眼皮形态' }, { status: 400 })
      }
      prompt = STEP1_PROMPTS[variant as Step1Style]
    } else if (step === 2) {
      prompt = STEP2_PROMPT
    } else if (step === 3) {
      if (!variant || !(variant in STEP3_PROMPTS)) {
        return NextResponse.json({ error: '无效的术前状态' }, { status: 400 })
      }
      prompt = STEP3_PROMPTS[variant as Step3Style]
    } else if (step === 4) {
      const day = parseInt(variant ?? '', 10)
      if (isNaN(day) || day < 1 || day > 10) {
        return NextResponse.json({ error: '无效的恢复天数（1-10）' }, { status: 400 })
      }
      prompt = STEP4_PROMPTS[day]
    } else {
      return NextResponse.json({ error: '无效的步骤' }, { status: 400 })
    }

    // Call SiliconFlow API
    const response = await fetch(SILICONFLOW_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen-Image-Edit',
        prompt: prompt,
        image: imageUrl,
        image_size: '1024x1024',
        num_inference_steps: 20,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[generate] SiliconFlow error:', errorText)
      throw new Error(`API 调用失败: ${response.status}`)
    }

    const result = await response.json()

    // SiliconFlow returns synchronously, format as our response
    return NextResponse.json({
      requestId: `sf_${Date.now()}`,
      status: 'COMPLETED',
      result: {
        images: result.images.map((img: any) => ({
          url: img.url,
          width: 1024,
          height: 1024,
        })),
      },
    })
  } catch (err) {
    console.error('[generate]', err)
    return NextResponse.json({ error: '生成任务提交失败' }, { status: 500 })
  }
}
