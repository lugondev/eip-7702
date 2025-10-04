import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, base, hardhat } from 'wagmi/chains'
import { injected, metaMask, coinbaseWallet } from 'wagmi/connectors'

/**
 * Wagmi configuration for EIP-7702 support
 * Includes: Mainnet, Sepolia, Base, and local Hardhat
 * 
 * Base chain added for future support
 * Sepolia is primary testnet for EIP-7702 (Pectra upgrade)
 */
export const config = createConfig({
  chains: [mainnet, sepolia, base, hardhat],
  connectors: [
    injected(),
    metaMask({
      dappMetadata: {
        name: "EIP-7702 Tool",
      },
    }),
    coinbaseWallet({
      appName: "EIP-7702 Tool",
    }),
  ],
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_MAINNET_RPC_URL),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
    [hardhat.id]: http('http://127.0.0.1:8545'),
  },
})