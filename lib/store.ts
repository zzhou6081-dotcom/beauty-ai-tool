import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
// immer middleware requires the standalone 'immer' package
import type {
  Step1Style,
  Step3Style,
  StepId,
  GenerationResult,
  GenerationStatus,
} from './types'

interface WorkflowState {
  // Step 1
  step1UploadUrl: string | null
  step1UploadPreview: string | null
  step1Results: Partial<Record<Step1Style, GenerationResult>>
  step1SelectedStyle: Step1Style | null
  step1SelectedImageUrl: string | null // the specific image URL chosen from step 1
  step1Status: GenerationStatus
  step1Error: string | null

  // Step 2
  step2Results: GenerationResult | null
  step2Status: GenerationStatus
  step2Error: string | null

  // Step 3
  step3Results: Partial<Record<Step3Style, GenerationResult>>
  step3Status: GenerationStatus
  step3Error: string | null

  // Step 4
  step4SelectedDay: number
  step4Results: GenerationResult | null
  step4Status: GenerationStatus
  step4Error: string | null

  // Navigation
  activeStep: StepId
}

interface WorkflowActions {
  setStep1Upload: (url: string, preview: string) => void
  setStep1Result: (style: Step1Style, result: GenerationResult) => void
  setStep1SelectedStyle: (style: Step1Style, imageUrl: string) => void
  setStep1Status: (status: GenerationStatus, error?: string) => void

  setStep2Result: (result: GenerationResult) => void
  setStep2Status: (status: GenerationStatus, error?: string) => void

  setStep3Result: (style: Step3Style, result: GenerationResult) => void
  setStep3Status: (status: GenerationStatus, error?: string) => void

  setStep4Day: (day: number) => void
  setStep4Result: (result: GenerationResult) => void
  setStep4Status: (status: GenerationStatus, error?: string) => void

  setActiveStep: (step: StepId) => void
  reset: () => void
}

const initialState: WorkflowState = {
  step1UploadUrl: null,
  step1UploadPreview: null,
  step1Results: {},
  step1SelectedStyle: null,
  step1SelectedImageUrl: null,
  step1Status: 'idle',
  step1Error: null,

  step2Results: null,
  step2Status: 'idle',
  step2Error: null,

  step3Results: {},
  step3Status: 'idle',
  step3Error: null,

  step4SelectedDay: 7,
  step4Results: null,
  step4Status: 'idle',
  step4Error: null,

  activeStep: 1,
}

export const useWorkflowStore = create<WorkflowState & WorkflowActions>()(
  immer((set) => ({
    ...initialState,

    setStep1Upload: (url, preview) =>
      set((s) => {
        s.step1UploadUrl = url
        s.step1UploadPreview = preview
        // Reset downstream when new image uploaded
        s.step1Results = {}
        s.step1SelectedStyle = null
        s.step1SelectedImageUrl = null
        s.step1Status = 'idle'
        s.step2Results = null
        s.step2Status = 'idle'
        s.step3Results = {}
        s.step3Status = 'idle'
        s.step4Results = null
        s.step4Status = 'idle'
      }),

    setStep1Result: (style, result) =>
      set((s) => {
        s.step1Results[style] = result
      }),

    setStep1SelectedStyle: (style, imageUrl) =>
      set((s) => {
        s.step1SelectedStyle = style
        s.step1SelectedImageUrl = imageUrl
      }),

    setStep1Status: (status, error) =>
      set((s) => {
        s.step1Status = status
        s.step1Error = error ?? null
      }),

    setStep2Result: (result) =>
      set((s) => {
        s.step2Results = result
      }),

    setStep2Status: (status, error) =>
      set((s) => {
        s.step2Status = status
        s.step2Error = error ?? null
      }),

    setStep3Result: (style, result) =>
      set((s) => {
        s.step3Results[style] = result
      }),

    setStep3Status: (status, error) =>
      set((s) => {
        s.step3Status = status
        s.step3Error = error ?? null
      }),

    setStep4Day: (day) =>
      set((s) => {
        s.step4SelectedDay = day
        // Reset result when day changes
        s.step4Results = null
        s.step4Status = 'idle'
      }),

    setStep4Result: (result) =>
      set((s) => {
        s.step4Results = result
      }),

    setStep4Status: (status, error) =>
      set((s) => {
        s.step4Status = status
        s.step4Error = error ?? null
      }),

    setActiveStep: (step) =>
      set((s) => {
        s.activeStep = step
      }),

    reset: () =>
      set(() => ({
        ...initialState,
      })),
  }))
)
