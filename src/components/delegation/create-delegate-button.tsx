'use client'

import { Button } from '@/components/ui/button'
import { useGatorContext } from '@/hooks/use-gator-context'

export function CreateDelegateButton() {
  const { generateDelegateWallet } = useGatorContext()

  return (
    <Button onClick={generateDelegateWallet} size="sm">
      Create Delegate Wallet
    </Button>
  )
}
