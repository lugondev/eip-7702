'use client'

import { useEffect, useState } from 'react'
import { useGatorContext } from './use-gator-context'
import { Implementation, MetaMaskSmartAccount, toMetaMaskSmartAccount } from '@metamask/delegation-toolkit'
import { Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { usePublicClient } from 'wagmi'

export default function useDelegateSmartAccount() {
  const { delegateWallet } = useGatorContext()
  const publicClient = usePublicClient()

  const [smartAccount, setSmartAccount] = useState<MetaMaskSmartAccount | null>(null)

  useEffect(() => {
    if (delegateWallet === '0x' || !publicClient) return

    console.log('Creating delegate smart account')
    const account = privateKeyToAccount(delegateWallet as `0x${string}`)

    toMetaMaskSmartAccount({
      client: publicClient,
      implementation: Implementation.Hybrid,
      deployParams: [account.address as Hex, [], [], []],
      deploySalt: '0x',
      signer: { account },
    }).then((smartAccount) => {
      setSmartAccount(smartAccount)
    })
  }, [delegateWallet, publicClient])

  return { smartAccount }
}
