'use client'

import { Button } from '@/components/ui/button'
import useDelegateSmartAccount from '@/hooks/use-delegate-smart-account'
import useDelegatorSmartAccount from '@/hooks/use-delegator-smart-account'
import { useStepContext } from '@/hooks/use-step-context'
import useStorageClient from '@/hooks/use-storage-client'
import { prepareRootDelegation } from '@/lib/delegation-utils'

export function CreateDelegationButton() {
  const { smartAccount } = useDelegatorSmartAccount()
  const { storeDelegation } = useStorageClient()
  const { smartAccount: delegateSmartAccount } = useDelegateSmartAccount()
  const { changeStep } = useStepContext()

  const handleCreateDelegation = async () => {
    if (!smartAccount || !delegateSmartAccount) return
    
    console.log('Creating delegation:', smartAccount.address, delegateSmartAccount.address)
    const delegation = prepareRootDelegation(smartAccount, delegateSmartAccount.address)

    const signature = await smartAccount.signDelegation({
      delegation,
    })

    const signedDelegation = {
      ...delegation,
      signature,
    }

    console.log('Signed delegation:', signedDelegation)
    storeDelegation(signedDelegation)
    changeStep(5)
  }

  return (
    <Button onClick={handleCreateDelegation} size="sm">
      Create Delegation
    </Button>
  )
}
