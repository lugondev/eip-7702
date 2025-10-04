'use client'

import { useEffect, useState } from 'react'
import { Implementation, MetaMaskSmartAccount, toMetaMaskSmartAccount } from '@metamask/delegation-toolkit'
import { Hex } from 'viem'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'

export default function useDelegatorSmartAccount(): {
  smartAccount: MetaMaskSmartAccount | null
} {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const [smartAccount, setSmartAccount] = useState<MetaMaskSmartAccount | null>(null)

  useEffect(() => {
    if (!address || !walletClient || !publicClient) return

    console.log('Creating delegator smart account')

    toMetaMaskSmartAccount({
      client: publicClient,
      implementation: Implementation.Hybrid,
      deployParams: [address as Hex, [], [], []],
      deploySalt: '0x',
      signer: { walletClient },
    }).then((smartAccount) => {
      setSmartAccount(smartAccount)
    })
  }, [address, walletClient, publicClient])

  return { smartAccount }
}
