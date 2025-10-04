'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import useDelegatorSmartAccount from '@/hooks/use-delegator-smart-account'
import { usePimlicoUtils } from '@/hooks/use-pimlico-utils'
import { useStepContext } from '@/hooks/use-step-context'
import { zeroAddress } from 'viem'

export function DeployDelegatorButton() {
  const [loading, setLoading] = useState(false)
  const { smartAccount } = useDelegatorSmartAccount()
  const { changeStep } = useStepContext()
  const { bundlerClient, paymasterClient, pimlicoClient, error } = usePimlicoUtils()

  const handleDeployDelegator = async () => {
    if (!smartAccount || !bundlerClient || !paymasterClient || !pimlicoClient) return
    
    try {
      setLoading(true)
      const { fast: fee } = await pimlicoClient.getUserOperationGasPrice()

      const userOperationHash = await bundlerClient.sendUserOperation({
        account: smartAccount,
        calls: [
          {
            to: zeroAddress,
          },
        ],
        paymaster: paymasterClient,
        ...fee,
      })

      const { receipt } = await bundlerClient.waitForUserOperationReceipt({
        hash: userOperationHash,
      })

      console.log('Delegator deployed:', receipt)
      setLoading(false)
      changeStep(3)
    } catch (err) {
      console.error('Deploy error:', err)
      setLoading(false)
    }
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Error: {error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Button onClick={handleDeployDelegator} disabled={loading} size="sm">
      {loading ? 'Deploying...' : 'Deploy Delegator Account'}
    </Button>
  )
}
