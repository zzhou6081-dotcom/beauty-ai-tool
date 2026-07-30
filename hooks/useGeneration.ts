'use client'
import { useState, useCallback, useRef } from 'react'
import type { GenerateRequest } from '@/app/api/generate/route'
import type { GenerationResult } from '@/lib/types'

type GenStatus = 'idle' | 'submitting' | 'polling' | 'complete' | 'error'

interface Options {
  onComplete: (result: GenerationResult) => void
  onError?: (error: string) => void
  pollIntervalMs?: number
}

export function useGeneration({ onComplete, onError, pollIntervalMs = 2000 }: Options) {
  const [status, setStatus] = useState<GenStatus>('idle')
  const [queuePosition, setQueuePosition] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const pollStatus = useCallback(
    async (requestId: string) => {
      try {
        const res = await fetch(`/api/status/${encodeURIComponent(requestId)}`)
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || '状态查询失败')

        if (data.status === 'COMPLETED') {
          stopPolling()
          setStatus('complete')
          const images = (data.result as { images?: GenerationResult['images'] })?.images ?? []
          const seed = (data.result as { seed?: number })?.seed
          onComplete({ images, seed })
          return
        }

        if (data.status === 'IN_QUEUE' || data.status === 'IN_PROGRESS') {
          setQueuePosition(typeof data.position === 'number' ? data.position : null)
          timerRef.current = setTimeout(() => pollStatus(requestId), pollIntervalMs)
          return
        }

        throw new Error(`意外的任务状态: ${data.status}`)
      } catch (err) {
        stopPolling()
        setStatus('error')
        const msg = err instanceof Error ? err.message : '未知错误'
        onError?.(msg)
      }
    },
    [onComplete, onError, pollIntervalMs, stopPolling]
  )

  const generate = useCallback(
    async (request: GenerateRequest) => {
      stopPolling()
      setStatus('submitting')
      setQueuePosition(null)

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || '任务提交失败')

        // SiliconFlow returns immediately with result
        if (data.status === 'COMPLETED' && data.result) {
          setStatus('complete')
          const images = data.result.images ?? []
          const seed = data.result.seed
          onComplete({ images, seed })
        } else {
          // Fallback to polling for other providers
          setStatus('polling')
          timerRef.current = setTimeout(() => pollStatus(data.requestId as string), pollIntervalMs)
        }
      } catch (err) {
        setStatus('error')
        const msg = err instanceof Error ? err.message : '未知错误'
        onError?.(msg)
      }
    },
    [pollStatus, pollIntervalMs, stopPolling, onError, onComplete]
  )

  return { generate, status, queuePosition, stopPolling, reset: () => { stopPolling(); setStatus('idle') } }
}
