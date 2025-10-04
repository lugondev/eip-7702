'use client'

import { useContext } from 'react'
import { StepContext } from '@/components/providers/step-provider'

export function useStepContext() {
  const context = useContext(StepContext)

  if (!context) {
    throw new Error('useStepContext must be used within the scope of StepContextProvider')
  }

  return context
}
