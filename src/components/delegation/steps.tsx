'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import useDelegateSmartAccount from '@/hooks/use-delegate-smart-account'
import useDelegatorSmartAccount from '@/hooks/use-delegator-smart-account'
import { useStepContext } from '@/hooks/use-step-context'
import useStorageClient from '@/hooks/use-storage-client'
import { AddressCard } from './address-card'
import { CreateDelegateButton } from './create-delegate-button'
import { DeployDelegatorButton } from './deploy-delegator-button'
import { CreateDelegationButton } from './create-delegation-button'
import { RedeemDelegationButton } from './redeem-delegation-button'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function Steps() {
  const { step, changeStep } = useStepContext()
  const { address } = useAccount()
  const { smartAccount } = useDelegatorSmartAccount()
  const { smartAccount: delegateSmartAccount } = useDelegateSmartAccount()
  const { getDelegation } = useStorageClient()
  const [storedDelegation, setStoredDelegation] = useState<any>(null)

  // Auto-advance steps based on state
  useEffect(() => {
    if (!address) {
      changeStep(1)
    }

    if (address && smartAccount && !delegateSmartAccount) {
      smartAccount.isDeployed().then((isDeployed) => {
        if (!isDeployed) {
          changeStep(2)
        } else if (isDeployed) {
          changeStep(3)
        }
      })
    }

    if (address && smartAccount && delegateSmartAccount) {
      const delegation = getDelegation(delegateSmartAccount.address)
      if (!delegation) {
        changeStep(4)
      } else {
        changeStep(5)
      }
    }
  }, [address, smartAccount, delegateSmartAccount])

  // Refresh stored delegation when on step 5
  useEffect(() => {
    if (step === 5 && delegateSmartAccount) {
      const delegation = getDelegation(delegateSmartAccount.address)
      setStoredDelegation(delegation)
    }
  }, [step, delegateSmartAccount])

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Address Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AddressCard
          address={smartAccount?.address}
          title="Delegator Account"
          description="The delegator is an embedded smart account with a MetaMask EOA as its signer. This account creates the delegation."
          fallbackText="Not connected"
        />

        <AddressCard
          address={delegateSmartAccount?.address}
          title="Delegate Account"
          description="The delegate is an embedded smart account with a locally generated private key. This account receives the delegation."
          fallbackText="Not created yet"
        />
      </div>

      {/* Step Navigation */}
      <div className="flex justify-center space-x-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <Button
            key={s}
            variant={step === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => changeStep(s)}
            className="w-10 h-10 rounded-full p-0"
          >
            {s}
          </Button>
        ))}
      </div>

      {/* Step Content */}
      {step === 1 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Step 1: Connect Wallet</h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            The first step is to connect your wallet. You can customize the Wagmi config to connect to any chain you
            want, and use the connector of your choice.
          </p>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Step 2: Deploy Delegator Account</h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            The MetaMask smart contract account that grants authority to the delegate account. The Deploy Delegator
            button will send a dummy user operation to deploy the smart account on-chain.
          </p>
          <DeployDelegatorButton />
        </Card>
      )}

      {step === 3 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Step 3: Create Delegate Account</h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            The MetaMask smart contract account that receives the delegation. Initially this will be counterfactual (not
            deployed on-chain), until it is deployed by submitting a user operation.
          </p>
          <CreateDelegateButton />
        </Card>
      )}

      {step === 4 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Step 4: Create Delegation</h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            The delegator creates and signs a delegation, granting specific authority to the delegate account. In this
            case, the delegation is limited to 1 call. The signed delegation will be persisted in localStorage.
            <br />
            <br />
            The delegator <strong className="font-bold italic">must</strong> specify sufficient caveats to limit the
            authority being granted to the delegate.
          </p>
          <CreateDelegationButton />
        </Card>
      )}

      {step === 5 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Step 5: Redeem Delegation</h3>
          
          {storedDelegation && (
            <div className="mb-6">
              <div className="mt-4 bg-secondary rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-sm">📋 Delegation to Redeem:</h4>
                <div className="bg-background rounded-lg p-3 overflow-x-auto">
                  <pre className="text-xs">
                    <code>{JSON.stringify(storedDelegation, null, 2)}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          <p className="text-muted-foreground mb-6 leading-relaxed">
            The redeemer submits a user operation that executes the action allowed by the delegation (in this case,
            transfer nothing to no one) on behalf of the delegator. We are using the signed delegation stored in
            localStorage to execute on behalf of the delegator.
          </p>
          <RedeemDelegationButton />
        </Card>
      )}
    </div>
  )
}
