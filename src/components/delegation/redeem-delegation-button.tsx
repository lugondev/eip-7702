'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getDeleGatorEnvironment } from '@metamask/delegation-toolkit'
import { Hex } from 'viem'
import { sepolia } from 'viem/chains'
import useDelegateSmartAccount from '@/hooks/use-delegate-smart-account'
import { usePimlicoUtils } from '@/hooks/use-pimlico-utils'
import useStorageClient from '@/hooks/use-storage-client'
import { prepareRedeemDelegationData } from '@/lib/delegation-utils'

export function RedeemDelegationButton() {
  const { smartAccount } = useDelegateSmartAccount()
  const [loading, setLoading] = useState(false)
  const [transactionHash, setTransactionHash] = useState<Hex | null>(null)
  const chain = sepolia
  const { getDelegation } = useStorageClient()
  const { bundlerClient, paymasterClient, pimlicoClient, error } = usePimlicoUtils()

  const handleRedeemDelegation = async () => {
    if (!smartAccount || !bundlerClient || !paymasterClient || !pimlicoClient) return

    try {
      setLoading(true)

      const delegation = getDelegation(smartAccount.address)

      if (!delegation) {
        console.error('No delegation found')
        setLoading(false)
        return
      }

      const redeemData = prepareRedeemDelegationData(delegation)
      const { fast: fee } = await pimlicoClient.getUserOperationGasPrice()

      const userOperationHash = await bundlerClient.sendUserOperation({
        account: smartAccount,
        calls: [
          {
            to: getDeleGatorEnvironment(chain.id).DelegationManager,
            data: redeemData,
          },
        ],
        ...fee,
        paymaster: paymasterClient,
      })

      const { receipt } = await bundlerClient.waitForUserOperationReceipt({
        hash: userOperationHash,
      })

      setTransactionHash(receipt.transactionHash)
      console.log('Delegation redeemed:', receipt)
      setLoading(false)
    } catch (err) {
      console.error('Redeem error:', err)
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

  if (transactionHash) {
    return (
      <div className="space-y-2">
        <Alert>
          <AlertDescription>Transaction successful!</AlertDescription>
        </Alert>
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.open(`https://sepolia.etherscan.io/tx/${transactionHash}`, '_blank')}
        >
          View on Etherscan
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={handleRedeemDelegation} disabled={loading} size="sm">
      {loading ? 'Redeeming...' : 'Redeem Delegation'}
    </Button>
  )
}
