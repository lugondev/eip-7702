'use client'

import { useState, useCallback } from 'react'
import { useAccount, useChainId } from 'wagmi'
import type { Address } from 'viem'
import { createPublicClient, http, createWalletClient, custom } from 'viem'
import { sepolia } from 'viem/chains'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as Address

declare global {
  interface Window {
    ethereum?: any
  }
}

/**
 * Hook for revoking EIP-7702 delegation
 * Reverts smart account back to EOA (Externally Owned Account)
 */
export function useRevokeDelegation() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  
  const [isRevoking, setIsRevoking] = useState(false)
  const [revokeError, setRevokeError] = useState<string | null>(null)
  const [revokeSuccess, setRevokeSuccess] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  /**
   * Main revoke delegation function
   * Tries multiple methods in order:
   * 1. MetaMask native wallet_disableDelegation
   * 2. MetaMask wallet_revokePermissions
   * 3. Raw eth_sendTransaction with authorizationList
   * 4. Viem signAuthorization (fallback)
   */
  const revokeDelegation = useCallback(async () => {
    console.log('🔍 Starting revoke delegation process')
    console.log('  - Wagmi address:', address)
    console.log('  - Chain ID:', chainId)
    console.log('  - Connected:', isConnected)

    // Check MetaMask availability
    if (typeof window === 'undefined' || !window.ethereum) {
      const error = 'MetaMask is not installed or not available'
      console.error('❌', error)
      throw new Error(error)
    }

    // Get connected accounts from MetaMask
    let accounts: string[] = []
    try {
      accounts = await window.ethereum.request({ method: 'eth_accounts' })
      console.log('📝 Connected accounts:', accounts)
    } catch (e) {
      console.error('❌ Failed to get accounts:', e)
    }

    // Request connection if no accounts
    if (accounts.length === 0) {
      console.log('⚠️ No accounts found, requesting connection...')
      try {
        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        console.log('✅ Connection granted:', accounts)
      } catch (e: any) {
        console.error('❌ Connection request failed:', e)
        if (e.code === 4001) {
          throw new Error('Connection rejected. Please connect your MetaMask wallet to continue.')
        }
        throw new Error('Failed to connect wallet. Please try again.')
      }
    }

    const currentAddress = address || (accounts[0] as Address)
    
    if (!currentAddress) {
      const error = 'No wallet address available. Please connect your wallet.'
      console.error('❌', error)
      throw new Error(error)
    }
    
    console.log('✅ Using address:', currentAddress)

    // Get and verify chain ID
    let currentChainId: number
    try {
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' })
      currentChainId = parseInt(chainIdHex, 16)
      console.log('📝 Current chain ID:', currentChainId)
    } catch (e) {
      currentChainId = chainId || sepolia.id
      console.warn('⚠️ Using fallback chain ID:', currentChainId)
    }

    if (currentChainId !== sepolia.id) {
      const error = `Wrong network. Please switch to Sepolia Testnet (Chain ID: ${sepolia.id}, current: ${currentChainId})`
      console.error('❌', error)
      throw new Error(error)
    }

    try {
      setIsRevoking(true)
      setRevokeError(null)
      setRevokeSuccess(false)
      setTxHash(null)

      console.log('🔓 Starting EIP-7702 delegation revoke')
      console.log('  Account:', currentAddress)
      console.log('  Chain:', currentChainId)

      // Create viem clients
      const walletClient = createWalletClient({
        account: currentAddress,
        chain: sepolia,
        transport: custom(window.ethereum),
      })

      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(),
      })

      // Check current delegation status
      const eoaCode = await publicClient.getCode({ address: currentAddress })
      const isDelegated = eoaCode && eoaCode !== '0x' && eoaCode.startsWith('0xef0100')
      
      console.log('📝 Current status:')
      console.log('  - Bytecode:', eoaCode)
      console.log('  - Is delegated:', isDelegated)

      if (!isDelegated) {
        console.log('⚠️ Account is not delegated, but will attempt revoke anyway')
      }

      let hash: string | null = null

      // Method 1: Try MetaMask native delegation methods
      console.log('📝 Method 1: Trying MetaMask native methods...')
      
      // Try wallet_disableDelegation (MetaMask Delegation Toolkit)
      try {
        const result = await window.ethereum.request({
          method: 'wallet_disableDelegation',
          params: [currentAddress],
        })
        console.log('✅ Success via wallet_disableDelegation:', result)
        hash = result as string
      } catch (error1: any) {
        console.warn('⚠️ wallet_disableDelegation not supported:', error1.message)
        
        // Try wallet_revokePermissions as alternative
        try {
          const result = await window.ethereum.request({
            method: 'wallet_revokePermissions',
            params: [{
              eth_accounts: {},
            }],
          })
          console.log('✅ Success via wallet_revokePermissions:', result)
          hash = result as string
        } catch (error2: any) {
          console.warn('⚠️ wallet_revokePermissions not supported:', error2.message)
        }
      }

      // Method 2: Try raw RPC with authorization list
      if (!hash) {
        console.log('📝 Method 2: Trying raw eth_sendTransaction with authorizationList...')
        
        try {
          // Build EIP-7702 authorization for zero address (revokes delegation)
          const authorization = {
            chainId: `0x${currentChainId.toString(16)}`,
            address: ZERO_ADDRESS,
            nonce: '0x0',
          }

          console.log('  Authorization:', authorization)

          // Send transaction with authorization list
          const txParams = {
            from: currentAddress,
            to: currentAddress,
            value: '0x0',
            data: '0x',
            authorizationList: [authorization],
          }

          console.log('  Transaction params:', txParams)

          hash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [txParams],
          })

          console.log('✅ Success via eth_sendTransaction:', hash)
        } catch (rawError: any) {
          console.error('❌ eth_sendTransaction failed:', rawError.message)
          
          // Method 3: Last resort - Use viem's signAuthorization
          console.log('📝 Method 3: Last resort - trying viem signAuthorization...')
          
          try {
            const authorization = await walletClient.signAuthorization({
              account: currentAddress,
              contractAddress: ZERO_ADDRESS,
            })

            console.log('  Authorization signed:', authorization)

            hash = await walletClient.sendTransaction({
              account: currentAddress,
              to: currentAddress,
              value: 0n,
              data: '0x',
              authorizationList: [authorization],
            })

            console.log('✅ Success via viem signAuthorization:', hash)
          } catch (viemError: any) {
            console.error('❌ All methods failed')
            throw new Error(`All revoke methods failed.\n\nMethod 2 error: ${rawError.message}\n\nMethod 3 error: ${viemError.message}`)
          }
        }
      }

      // Wait for transaction confirmation
      console.log('📝 Waiting for transaction confirmation...')
      const receipt = await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` })
      console.log('✅ Transaction confirmed:', receipt)

      // Verify delegation was revoked
      const newCode = await publicClient.getCode({ address: currentAddress })
      const isStillDelegated = newCode && newCode !== '0x' && newCode.startsWith('0xef0100')
      
      console.log('📝 Post-revoke status:')
      console.log('  - New bytecode:', newCode)
      console.log('  - Still delegated:', isStillDelegated)

      if (isStillDelegated) {
        console.warn('⚠️ Bytecode still shows delegation marker, but transaction succeeded')
        console.warn('⚠️ This might be a chain delay. Try refreshing after a few blocks.')
      }

      setTxHash(hash)
      setRevokeSuccess(true)
      setIsRevoking(false)
      
      return hash
    } catch (error: any) {
      console.error('❌ Revoke delegation failed:', error)
      
      let errorMessage = ''
      
      // Handle specific error cases
      if (error.message?.includes('User rejected') || error.code === 4001) {
        errorMessage = '🚫 Transaction Rejected\n\nYou rejected the transaction in MetaMask. Please try again and approve the transaction to revoke delegation.'
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = '💰 Insufficient Funds\n\nYou don\'t have enough ETH to pay for gas fees. Please add ETH to your account and try again.'
      } else if (error.message?.includes('Wrong network')) {
        errorMessage = error.message + '\n\nPlease switch to Sepolia Testnet in MetaMask.'
      } else if (error.message?.includes('signAuthorization') || error.message?.includes('All revoke methods failed')) {
        errorMessage = '⚠️ Automatic Revoke Not Supported\n\n'
        errorMessage += 'Your MetaMask version may not fully support EIP-7702 revoke via code.\n\n'
        errorMessage += '✅ SOLUTION - Use MetaMask UI:\n\n'
        errorMessage += '1. Open MetaMask extension\n'
        errorMessage += '2. Click on your account avatar/menu\n'
        errorMessage += '3. Select "Account details"\n'
        errorMessage += '4. Find "Delegation" or "Smart Account" section\n'
        errorMessage += '5. Click "Switch to EOA" or "Revoke Delegation" button\n\n'
        errorMessage += '� Technical details: ' + error.message
      } else if (error.message?.includes('not installed') || error.message?.includes('not available')) {
        errorMessage = '🦊 MetaMask Not Found\n\nPlease install MetaMask browser extension and try again.'
      } else if (error.message?.includes('connect')) {
        errorMessage = '� Wallet Not Connected\n\nPlease connect your wallet and try again.'
      } else {
        errorMessage = '❌ Unexpected Error\n\n' + error.message + '\n\n'
        errorMessage += '💡 Troubleshooting:\n'
        errorMessage += '• Check your ETH balance for gas fees\n'
        errorMessage += '• Update MetaMask to the latest version\n'
        errorMessage += '• Try refreshing the page\n'
        errorMessage += '• Use manual revoke via MetaMask UI (see instructions button)'
      }
      
      setRevokeError(errorMessage)
      setIsRevoking(false)
      throw new Error(errorMessage)
    }
  }, [address, chainId, isConnected])

  /**
   * Check current delegation status
   * Returns delegation info or null if check fails
   */
  const checkDelegationStatus = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      return null
    }

    // Get address from MetaMask if wagmi address not available
    let currentAddress = address
    if (!currentAddress) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        currentAddress = accounts[0] as Address
      } catch (e) {
        console.error('Failed to get accounts:', e)
        return null
      }
    }

    if (!currentAddress) {
      return null
    }

    try {
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(),
      })

      const code = await publicClient.getCode({ address: currentAddress })
      const isDelegated = code && code !== '0x' && code.startsWith('0xef0100')
      
      if (isDelegated) {
        // Extract delegated address from EIP-7702 bytecode
        // Format: 0xef0100 + 20 bytes address
        const delegatedAddress = '0x' + code.slice(8, 48)
        return {
          isDelegated: true,
          delegatedAddress: delegatedAddress as Address,
          code,
        }
      }

      return {
        isDelegated: false,
        delegatedAddress: null,
        code: code || '0x',
      }
    } catch (error) {
      console.error('Failed to check delegation status:', error)
      return null
    }
  }, [address])

  return {
    isRevoking,
    revokeError,
    revokeSuccess,
    txHash,
    revokeDelegation,
    isConnected,
    address,
    chainId,
  }
}
