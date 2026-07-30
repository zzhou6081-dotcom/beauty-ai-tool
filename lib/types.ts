export type Step1Style = 'parallel' | 'fan' | 'open_fan' | 'wide'
export type Step3Style = 'standard' | 'puffy' | 'inner_double'
export type StepId = 1 | 2 | 3 | 4
export type GenerationStatus = 'idle' | 'uploading' | 'submitting' | 'polling' | 'complete' | 'error'

export interface GeneratedImage {
  url: string
  width?: number
  height?: number
  content_type?: string
}

export interface GenerationResult {
  images: GeneratedImage[]
  seed?: number
}

export const STEP1_STYLE_LABELS: Record<Step1Style, string> = {
  parallel: '平行双眼皮',
  fan: '扇形双眼皮',
  open_fan: '开扇形双眼皮',
  wide: '宽双眼皮',
}

export const STEP3_STYLE_LABELS: Record<Step3Style, string> = {
  standard: '标准单眼皮',
  puffy: '肿泡眼',
  inner_double: '内双',
}

export const STEP1_STYLES: Step1Style[] = ['parallel', 'fan', 'open_fan', 'wide']
export const STEP3_STYLES: Step3Style[] = ['standard', 'puffy', 'inner_double']

export const RECOVERY_DAY_LABELS: Record<number, string> = {
  1: '第1天',
  2: '第2天',
  3: '第3天',
  4: '第4天',
  5: '第5天',
  6: '第6天',
  7: '第7天（拆线）',
  8: '第8天',
  9: '第9天',
  10: '第10天',
}
