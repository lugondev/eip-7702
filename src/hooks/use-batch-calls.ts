'use client'

import { useState, useCallback } from 'react'
import { useAccount, useChainId } from 'wagmi'
import type { Address, Hex } from 'viem'
import { getAddress } from 'viem'
import { sepolia } from 'wagmi/chains'

/**
 * EIP-7702 Batch Transaction Hook
 * Uses wagmi/experimental useSendCalls for MetaMask wallet_sendCalls (ERC-5792)
 * 
 * References:
 * - https://wagmi.sh/react/api/hooks/useSendCalls
 * - https://docs.metamask.io/wallet/concepts/batch-transactions/
 * - https://eips.ethereum.org/EIPS/eip-5792
 */

export interface BatchCall {
  to: Address
  data?: Hex
  value?: bigint
}

export function useBatchCalls() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  
  const [checkError, setCheckError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Send batch calls using MetaMask's wallet_sendCalls (EIP-5792)
   * This will automatically prompt MetaMask to upgrade EOA to smart account
   */
  const executeBatchCalls = useCallback(async (calls: BatchCall[]) => {
    console.log('=== PRE-CHECK DEBUG ===')
    console.log('isConnected:', isConnected)
    console.log('address:', address)
    console.log('chainId:', chainId)
    console.log('window.ethereum:', !!window.ethereum)
    
    if (!isConnected) {
      throw new Error('Wallet not connected')
    }

    if (!address) {
      throw new Error('Address not available')
    }

    if (!chainId) {
      throw new Error('Chain ID not available')
    }

    if (chainId !== sepolia.id) {
      throw new Error('Please switch to Sepolia network')
    }

    if (calls.length === 0) {
      throw new Error('No calls to execute')
    }

    if (!window.ethereum) {
      throw new Error('MetaMask not installed')
    }

    console.log('🚀 Executing batch calls:', calls)
    console.log('Chain ID:', chainId, `(0x${chainId.toString(16)})`)

    try {
      setIsLoading(true)
      setCheckError(null)
      
      // Call MetaMask's wallet_sendCalls directly
      // MetaMask expects specific structure with chainId as hex string
      const chainIdHex = `0x${chainId.toString(16)}`
      
      console.log('=== DEBUG INFO ===')
      console.log('chainId (decimal):', chainId)
      console.log('chainIdHex:', chainIdHex)
      console.log('address:', address)
      console.log('calls count:', calls.length)
      
      // Extra validation
      if (!chainIdHex || chainIdHex === '0xNaN') {
        throw new Error(`Invalid chainId conversion: ${chainId} -> ${chainIdHex}`)
      }
      
      if (!address || address === '0x') {
        throw new Error(`Invalid address: ${address}`)
      }
      
      // Build params object with explicit types
      const callsData = calls.map(call => {
        // MetaMask requires checksummed addresses
        const checksummedTo = getAddress(call.to)
        
        const callData: any = {
          to: checksummedTo,
        }
        
        // Only add data if it exists AND is not empty "0x"
        // MetaMask doesn't accept "0x" - must either omit field or have real data
        if (call.data && call.data !== '0x') {
          callData.data = call.data
        }
        
        // Only add value if it exists and is not zero
        if (call.value && call.value > BigInt(0)) {
          callData.value = `0x${call.value.toString(16)}`
        }
        
        return callData
      })
      
      // MetaMask EIP-5792 spec: single object with all fields at top level
      const paramsObject = {
        version: '2.0.0',
        chainId: chainIdHex, // Must be hex string (e.g., "0xaa36a7" for Sepolia)
        from: address,
        calls: callsData,
        atomicRequired: true, // Must be at top level
      }
      
      console.log('=== PARAMS BEING SENT ===')
      console.log('chainIdHex:', chainIdHex, 'type:', typeof chainIdHex)
      console.log('address:', address, 'type:', typeof address)
      console.log('atomicRequired:', true, 'type:', typeof true)
      console.log('callsData:', callsData)
      console.log('Full params object:', paramsObject)
      console.log('Stringified:', JSON.stringify(paramsObject, null, 2))
      
      // Final validation before sending
      if (typeof paramsObject.chainId !== 'string') {
        throw new Error(`chainId must be string, got: ${typeof paramsObject.chainId}`)
      }
      
      if (typeof paramsObject.atomicRequired !== 'boolean') {
        throw new Error('atomicRequired must be boolean')
      }
      
      if (typeof paramsObject.from !== 'string') {
        throw new Error(`from must be string, got: ${typeof paramsObject.from}`)
      }
      
      console.log('✅ All validations passed, sending to MetaMask...')
      
      const result = await window.ethereum.request({
        method: 'wallet_sendCalls',
        params: [paramsObject],
      })

      console.log('✅ Batch calls submitted successfully')
      console.log('Result:', result)
      
      setIsLoading(false)
      
      return result
    } catch (error: any) {
      console.error('❌ Failed to execute batch calls:', error)
      setCheckError(error.message || 'Failed to execute batch calls')
      setIsLoading(false)
      throw error
    }
  }, [isConnected, address, chainId])

  return {
    // State
    isLoading,
    error: checkError,
    
    // Actions
    executeBatchCalls,
    
    // Utilities
    isConnected,
    address,
    chainId,
  }
}

declare global {
  interface Window {
    ethereum?: any
  }
}
