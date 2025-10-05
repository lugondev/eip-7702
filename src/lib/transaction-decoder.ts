import type { Address, Hex } from 'viem'
import { decodeFunctionData, decodeEventLog, parseAbiItem } from 'viem'

/**
 * Transaction decoder utilities
 * Decodes function calls, events, and transaction data
 */

export interface DecodedFunction {
  name: string
  signature: string
  args: Record<string, any>
  value?: bigint
}

export interface DecodedEvent {
  name: string
  signature: string
  args: Record<string, any>
  address: Address
}

export interface TransactionDetail {
  to: Address
  value: bigint
  data: Hex
  decoded?: DecodedFunction
  isContract: boolean
}

/**
 * Common function signatures for popular contracts
 */
export const COMMON_SIGNATURES: Record<string, string> = {
  // ERC20
  '0x095ea7b3': 'approve(address,uint256)',
  '0xa9059cbb': 'transfer(address,uint256)',
  '0x23b872dd': 'transferFrom(address,address,uint256)',
  '0x70a08231': 'balanceOf(address)',
  
  // ERC721
  '0x42842e0e': 'safeTransferFrom(address,address,uint256)',
  '0xb88d4fde': 'safeTransferFrom(address,address,uint256,bytes)',
  '0x6352211e': 'ownerOf(uint256)',
  '0x081812fc': 'getApproved(uint256)',
  '0xe985e9c5': 'isApprovedForAll(address,address)',
  '0xa22cb465': 'setApprovalForAll(address,bool)',
  
  // ERC1155
  '0xf242432a': 'safeTransferFrom(address,address,uint256,uint256,bytes)',
  '0x2eb2c2d6': 'safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)',
  '0x00fdd58e': 'balanceOf(address,uint256)',
  '0x4e1273f4': 'balanceOfBatch(address[],uint256[])',
  
  // Uniswap V2
  '0x7ff36ab5': 'swapExactETHForTokens(uint256,address[],address,uint256)',
  '0x18cbafe5': 'swapExactTokensForETH(uint256,uint256,address[],address,uint256)',
  '0x38ed1739': 'swapExactTokensForTokens(uint256,uint256,address[],address,uint256)',
  
  // Uniswap V3
  '0x414bf389': 'exactInputSingle((address,address,uint24,address,uint256,uint256,uint256,uint160))',
  '0xc04b8d59': 'exactInput((bytes,address,uint256,uint256,uint256))',
  
  // Multicall
  '0xac9650d8': 'multicall(bytes[])',
  '0x5ae401dc': 'multicall(uint256,bytes[])',
  
  // WETH
  '0xd0e30db0': 'deposit()',
  '0x2e1a7d4d': 'withdraw(uint256)',
  
  // Common
  '0x': 'transfer()', // Native transfer
}

/**
 * Get function signature from selector
 */
export function getFunctionSignature(selector: string): string | null {
  return COMMON_SIGNATURES[selector.toLowerCase()] || null
}

/**
 * Decode function data using known signatures
 */
export function decodeFunction(data: Hex): DecodedFunction | null {
  if (!data || data === '0x' || data.length < 10) {
    return null
  }

  try {
    const selector = data.slice(0, 10).toLowerCase()
    const signature = getFunctionSignature(selector)
    
    if (!signature) {
      return {
        name: 'Unknown',
        signature: selector,
        args: {}
      }
    }

    const functionName = signature.split('(')[0]
    
    // Try to decode with viem
    try {
      const abi = parseAbiItem(`function ${signature}`)
      const decoded = decodeFunctionData({
        abi: [abi],
        data
      })

      return {
        name: functionName,
        signature,
        args: decoded.args as Record<string, any>
      }
    } catch {
      // If decode fails, just return signature
      return {
        name: functionName,
        signature,
        args: {}
      }
    }
  } catch (error) {
    console.error('Failed to decode function:', error)
    return null
  }
}

/**
 * Format decoded arguments for display
 */
export function formatDecodedArgs(args: Record<string, any>): string {
  if (!args || Object.keys(args).length === 0) {
    return 'No arguments'
  }

  return Object.entries(args)
    .map(([key, value]) => {
      if (typeof value === 'bigint') {
        return `${key}: ${value.toString()}`
      }
      if (Array.isArray(value)) {
        return `${key}: [${value.length} items]`
      }
      if (typeof value === 'object') {
        return `${key}: ${JSON.stringify(value)}`
      }
      return `${key}: ${value}`
    })
    .join('\n')
}

/**
 * Decode transaction details
 */
export function decodeTransaction(tx: {
  to: Address
  value?: bigint
  data?: Hex
}): TransactionDetail {
  const data = tx.data || '0x'
  const decoded = decodeFunction(data)
  
  return {
    to: tx.to,
    value: tx.value || BigInt(0),
    data,
    decoded: decoded || undefined,
    isContract: data !== '0x' && data.length > 2
  }
}

/**
 * Estimate transaction type
 */
export function getTransactionType(tx: TransactionDetail): string {
  if (!tx.isContract && tx.value > BigInt(0)) {
    return 'Native Transfer'
  }
  
  if (!tx.decoded) {
    return 'Contract Interaction'
  }
  
  const name = tx.decoded.name.toLowerCase()
  
  if (name.includes('swap')) return 'Token Swap'
  if (name.includes('transfer')) return 'Token Transfer'
  if (name.includes('approve')) return 'Token Approval'
  if (name.includes('mint')) return 'NFT Mint'
  if (name.includes('deposit')) return 'Deposit'
  if (name.includes('withdraw')) return 'Withdraw'
  if (name.includes('multicall')) return 'Batch Call'
  
  return 'Contract Call'
}

/**
 * Format gas used with color coding
 */
export function formatGasDisplay(gasUsed: bigint, gasLimit?: bigint): {
  formatted: string
  percentage?: number
  color: 'green' | 'yellow' | 'red'
} {
  const formatted = gasUsed.toLocaleString()
  
  if (!gasLimit) {
    return { formatted, color: 'green' }
  }
  
  const percentage = Number((gasUsed * BigInt(100)) / gasLimit)
  
  let color: 'green' | 'yellow' | 'red' = 'green'
  if (percentage > 90) color = 'red'
  else if (percentage > 70) color = 'yellow'
  
  return { formatted, percentage, color }
}

/**
 * Common event signatures
 */
export const COMMON_EVENTS: Record<string, string> = {
  // ERC20/ERC721 Transfer & Approval (same signature)
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef': 'Transfer(address,address,uint256)',
  '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925': 'Approval(address,address,uint256)',
  '0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31': 'ApprovalForAll(address,address,bool)',
  
  // Uniswap V2
  '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822': 'Swap(address,uint256,uint256,uint256,uint256,address)',
  '0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1': 'Sync(uint112,uint112)',
  
  // Uniswap V3
  '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67': 'Swap(address,address,int256,int256,uint160,uint128,int24)',
}

/**
 * Decode event log
 */
export function decodeEvent(log: {
  topics: Hex[]
  data: Hex
  address: Address
}): DecodedEvent | null {
  if (!log.topics || log.topics.length === 0) {
    return null
  }

  try {
    const eventSignature = COMMON_EVENTS[log.topics[0]]
    
    if (!eventSignature) {
      return {
        name: 'Unknown Event',
        signature: log.topics[0],
        args: {},
        address: log.address
      }
    }

    const eventName = eventSignature.split('(')[0]
    
    try {
      const abi = parseAbiItem(`event ${eventSignature}`)
      const decoded = decodeEventLog({
        abi: [abi],
        data: log.data,
        topics: log.topics as [`0x${string}`, ...`0x${string}`[]]
      })

      return {
        name: eventName,
        signature: eventSignature,
        args: decoded.args as Record<string, any>,
        address: log.address
      }
    } catch {
      return {
        name: eventName,
        signature: eventSignature,
        args: {},
        address: log.address
      }
    }
  } catch (error) {
    console.error('Failed to decode event:', error)
    return null
  }
}
