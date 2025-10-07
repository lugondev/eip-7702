import { http, createConfig } from 'wagmi'
import { metaMask } from 'wagmi/connectors'
import { supportedChains, megaTestnet } from './supported-chains'
import { mainnet, bsc, bscTestnet, base, arbitrum, sepolia } from 'wagmi/chains'

/**
 * Wagmi configuration for EIP-7702 support
 * Supported networks:
 * - Ethereum Mainnet
 * - BNB Smart Chain
 * - BNB Smart Chain Testnet
 * - Mega Testnet
 * - Base Mainnet
 * - Arbitrum One
 * - Sepolia
 * 
 * Only MetaMask connector is enabled
 */
export const config = createConfig({
  chains: supportedChains as any,
  connectors: [
    metaMask({
      dappMetadata: {
        name: "EIP-7702 Tool",
      },
    }),
  ],
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_MAINNET_RPC_URL),
    [bsc.id]: http(process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org'),
    [bscTestnet.id]: http(process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545'),
    [megaTestnet.id]: http(process.env.NEXT_PUBLIC_MEGA_TESTNET_RPC_URL || 'https://testnet-rpc.mega.io'),
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
    [arbitrum.id]: http(process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc'),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
  },
})