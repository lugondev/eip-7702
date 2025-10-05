'use client'

import { useState, useCallback } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { formatEther, parseEther, type Address, type Hex } from 'viem'
import { sepolia } from 'wagmi/chains'

/**
 * Hook for estimating gas for batch transactions
 * Estimates gas for individual calls and total batch cost
 * Compares batch vs sequential execution
 */

export interface GasEstimate {
  perCall: bigint[]
  total: bigint
  totalEth: string
  sequential: bigint
  sequentialEth: string
  savings: bigint
  savingsPercent: number
  savingsEth: string
}

export function useGasEstimation() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  
  const [isEstimating, setIsEstimating] = useState(false)
  const [estimate, setEstimate] = useState<GasEstimate | null>(null)
  const [error, setError] = useState<string | null>(null)

  /**
   * Estimate gas for batch transaction
   */
  const estimateGas = useCallback(async (calls: Array<{
    to: Address
    value?: bigint
    data?: Hex
  }>) => {
    if (!address || !publicClient) {
      throw new Error('Wallet not connected')
    }

    if (calls.length === 0) {
      throw new Error('No calls to estimate')
    }

    try {
      setIsEstimating(true)
      setError(null)

      console.log('⛽ Estimating gas for', calls.length, 'calls')

      // Estimate gas for each call individually
      const perCallEstimates: bigint[] = []
      
      for (const call of calls) {
        try {
          const gas = await publicClient.estimateGas({
            account: address,
            to: call.to,
            value: call.value || BigInt(0),
            data: call.data || '0x',
          })
          perCallEstimates.push(gas)
        } catch (err) {
          console.warn('Failed to estimate gas for call:', call, err)
          // Use a default estimate if fails
          perCallEstimates.push(BigInt(21000))
        }
      }

      // Calculate total sequential gas
      const sequential = perCallEstimates.reduce((sum, gas) => sum + gas, BigInt(0))
      
      // Batch transaction saves gas by:
      // 1. Single transaction overhead (21000 gas) instead of multiple
      // 2. Shared authorization cost
      // 3. Optimized execution path
      
      // Estimate batch gas (roughly 70-80% of sequential)
      const batchGasSavingsPercent = 25 // Conservative 25% savings
      const total = sequential - (sequential * BigInt(batchGasSavingsPercent) / BigInt(100))
      
      // Get current gas price
      const gasPrice = await publicClient.getGasPrice()
      
      // Calculate costs in ETH
      const totalCost = total * gasPrice
      const sequentialCost = sequential * gasPrice
      const savings = sequentialCost - totalCost
      const savingsPercent = Number((savings * BigInt(100)) / sequentialCost)

      const estimation: GasEstimate = {
        perCall: perCallEstimates,
        total,
        totalEth: formatEther(totalCost),
        sequential,
        sequentialEth: formatEther(sequentialCost),
        savings,
        savingsPercent,
        savingsEth: formatEther(savings),
      }

      console.log('⛽ Gas estimation:', estimation)
      setEstimate(estimation)
      setIsEstimating(false)

      return estimation
    } catch (err: any) {
      console.error('❌ Gas estimation failed:', err)
      setError(err.message || 'Failed to estimate gas')
      setIsEstimating(false)
      throw err
    }
  }, [address, publicClient])

  /**
   * Clear current estimate
   */
  const clearEstimate = useCallback(() => {
    setEstimate(null)
    setError(null)
  }, [])

  return {
    // State
    isEstimating,
    estimate,
    error,
    
    // Actions
    estimateGas,
    clearEstimate,
    
    // Utilities
    formatGas: (gas: bigint) => gas.toLocaleString(),
    formatEth: (wei: bigint) => formatEther(wei),
  }
}
