'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import type { Address } from 'viem'

/**
 * Hook to check if an EOA has been delegated to an implementation (EIP-7702)
 * Returns delegation status and functions to delegate/revoke
 */
export function useDelegationStatus(implementationAddress?: Address) {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  
  const [isDelegated, setIsDelegated] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [delegatedTo, setDelegatedTo] = useState<Address | null>(null)

  /**
   * Check if address is delegated by reading code at address
   * EIP-7702 delegated accounts have code starting with 0xef01...
   */
  const checkDelegation = useCallback(async () => {
    if (!address || !publicClient) {
      setIsDelegated(null)
      setDelegatedTo(null)
      return
    }

    try {
      setIsChecking(true)
      
      // Read code at address
      const code = await publicClient.getBytecode({ address })
      
      console.log('🔍 Checking delegation for:', address)
      console.log('Code:', code)
      
      if (!code || code === '0x') {
        // No code = regular EOA, not delegated
        setIsDelegated(false)
        setDelegatedTo(null)
        console.log('❌ Not delegated (EOA)')
      } else if (code.startsWith('0xef01')) {
        // EIP-7702 delegation code format: 0xef0100 + 20 bytes address
        // Full format: 0x ef01 00 + 40 hex chars (20 bytes)
        // Position:    0  2  4 6 8...48
        const implementationAddr = `0x${code.slice(8, 48)}` as Address
        setIsDelegated(true)
        setDelegatedTo(implementationAddr)
        console.log('✅ Delegated to:', implementationAddr)
        console.log('Full code:', code)
      } else {
        // Has code but not EIP-7702 format (regular contract?)
        setIsDelegated(false)
        setDelegatedTo(null)
        console.log('⚠️ Has code but not EIP-7702 format:', code.slice(0, 10))
      }
    } catch (error) {
      console.error('Error checking delegation:', error)
      setIsDelegated(null)
      setDelegatedTo(null)
    } finally {
      setIsChecking(false)
    }
  }, [address, publicClient])

  /**
   * Delegate current EOA to implementation address
   * This will be triggered by wallet_sendCalls automatically
   */
  const delegate = useCallback(async (targetImplementation: Address) => {
    if (!window.ethereum || !address) {
      throw new Error('Wallet not connected')
    }

    console.log('🔐 Delegating to:', targetImplementation)
    
    // The actual delegation happens when wallet_sendCalls is executed
    // MetaMask will prompt user to delegate their EOA
    // We just need to make a call that requires delegation
    
    return { success: true }
  }, [address])

  /**
   * Revoke delegation by sending EIP-7702 authorization to 0x0
   * Note: Current MetaMask may not support this directly yet
   */
  const revokeDelegation = useCallback(async () => {
    if (!window.ethereum || !address) {
      throw new Error('Wallet not connected')
    }

    console.log('🔓 Attempting to revoke delegation for:', address)
    
    try {
      // EIP-7702 revoke: Need to send transaction with authorization list
      // pointing to 0x0000000000000000000000000000000000000000
      // However, MetaMask's current implementation may not support this yet
      
      // Method 1: Try using wallet_sendCalls with empty authorization
      // This SHOULD revoke the delegation according to EIP-7702 spec
      throw new Error(
        'Revoke delegation is not yet supported in current MetaMask version. ' +
        'To revoke, you need to send a transaction with EIP-7702 authorization list ' +
        'that sets delegation to 0x0000000000000000000000000000000000000000. ' +
        'This feature is coming in future MetaMask updates.'
      )
      
      // TODO: When MetaMask supports it, use this:
      // const txHash = await window.ethereum.request({
      //   method: 'eth_sendTransaction',
      //   params: [{
      //     from: address,
      //     to: address,
      //     value: '0x0',
      //     authorizationList: [{
      //       chainId: chainId,
      //       address: '0x0000000000000000000000000000000000000000',
      //       nonce: nonce,
      //     }]
      //   }],
      // })
      
    } catch (error: any) {
      console.error('❌ Failed to revoke delegation:', error)
      throw error
    }
  }, [address])

  // Don't auto-check - let user trigger manually
  // useEffect(() => {
  //   if (isConnected && address) {
  //     checkDelegation()
  //   }
  // }, [isConnected, address, checkDelegation])

  return {
    // State
    isDelegated,
    delegatedTo,
    isChecking,
    isConnected,
    address,
    
    // Actions
    checkDelegation,
    delegate,
    revokeDelegation,
    
    // Helpers
    isDelegatedToTarget: implementationAddress 
      ? delegatedTo?.toLowerCase() === implementationAddress.toLowerCase()
      : false,
  }
}

declare global {
  interface Window {
    ethereum?: any
  }
}
