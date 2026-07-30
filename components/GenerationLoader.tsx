'use client'

interface Props {
  status: 'submitting' | 'polling' | 'error' | string
  queuePosition?: number | null
  errorMessage?: string | null
}

export function GenerationLoader({ status, queuePosition, errorMessage }: Props) {
  if (status === 'error') {
    return (
      <div className="flex items-center gap-2 text-red-500 text-sm py-2">
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{errorMessage ?? '生成失败，请重试'}</span>
      </div>
    )
  }

  const label =
    status === 'submitting'
      ? '提交任务中...'
      : queuePosition != null && queuePosition > 0
        ? `排队中 (第 ${queuePosition} 位)...`
        : 'AI 生成中...'

  return (
    <div className="flex items-center gap-3 text-sm text-zinc-500 py-2" aria-live="polite" aria-label={label}>
      <span className="relative flex h-4 w-4 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-4 w-4 bg-violet-500" />
      </span>
      <span>{label}</span>
    </div>
  )
}
