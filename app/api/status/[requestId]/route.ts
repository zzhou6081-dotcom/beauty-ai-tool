import { NextRequest, NextResponse } from 'next/server'
import { fal } from '@fal-ai/client'

fal.config({ credentials: process.env.FAL_KEY! })

const MODEL_ID = 'fal-ai/flux-pro/kontext'

interface RouteContext {
  params: Promise<{ requestId: string }>
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { requestId } = await params
    if (!requestId) {
      return NextResponse.json({ error: '缺少 requestId' }, { status: 400 })
    }

    const status = await fal.queue.status(MODEL_ID, {
      requestId,
      logs: false,
    })

    if (status.status === 'COMPLETED') {
      const result = await fal.queue.result(MODEL_ID, { requestId })
      return NextResponse.json({ status: 'COMPLETED', result })
    }

    const position = (status as { queue_position?: number }).queue_position ?? null
    return NextResponse.json({ status: status.status, position })
  } catch (err) {
    console.error('[status]', err)
    return NextResponse.json({ error: '状态查询失败' }, { status: 500 })
  }
}
