import { mainnet, sepolia, base, arbitrum, bsc, bscTestnet } from 'wagmi/chains'
import type { Chain } from 'wagmi/chains'

/**
 * Mega Testnet custom chain configuration
 */
export const megaTestnet: Chain = {
  id: 10008,
  name: 'Mega Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Mega Testnet',
    symbol: 'MEGA',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.mega.io'],
    },
  },
  blockExplorers: {
    default: { name: 'MegaScan', url: 'https://testnet.megascan.io' },
  },
  testnet: true,
}

/**
 * List of all supported chains in the application
 */
export const supportedChains = [
  mainnet,
  bsc,
  bscTestnet,
  megaTestnet,
  base,
  arbitrum,
  sepolia,
] as const

/**
 * Map of chain IDs to chain names for quick lookup
 */
export const chainIdToName: Record<number, string> = {
  [mainnet.id]: 'Ethereum Mainnet',
  [bsc.id]: 'BNB Smart Chain',
  [bscTestnet.id]: 'BNB Smart Chain Testnet',
  [megaTestnet.id]: 'Mega Testnet',
  [base.id]: 'Base Mainnet',
  [arbitrum.id]: 'Arbitrum One',
  [sepolia.id]: 'Sepolia Testnet',
}

/**
 * Check if a chain ID is supported
 */
export function isSupportedChain(chainId: number): boolean {
  return chainId in chainIdToName
}

/**
 * Get chain name by chain ID
 */
export function getChainName(chainId: number): string {
  return chainIdToName[chainId] || `Unknown Chain (${chainId})`
}

/**
 * Get all supported chain IDs
 */
export function getSupportedChainIds(): number[] {
  return Object.keys(chainIdToName).map(Number)
}
