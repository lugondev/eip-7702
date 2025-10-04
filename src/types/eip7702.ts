import type { Address, Hash, Hex } from 'viem'

// EIP-7702 Authorization tuple
export interface AuthorizationTuple {
  chainId: number
  address: Address
  nonce: bigint
  yParity: number
  r: Hex
  s: Hex
}

// Transaction call structure
export interface Call {
  target: Address
  value: bigint
  data: Hex
}

// Session key data
export interface SessionKey {
  address: Address
  expiry: number
  active: boolean
}

// Operator permission
export interface Operator {
  address: Address
  allowed: boolean
}

// Sponsor info for paymaster
export interface SponsorInfo {
  address: Address
  balance: bigint
  maxGasPerTx: bigint
  active: boolean
}

// Token payment configuration
export interface TokenPayment {
  token: Address
  rate: bigint // tokens per gas unit
  enabled: boolean
}

// Transaction batch
export interface TransactionBatch {
  calls: Call[]
  sponsorAddress?: Address
  usePaymaster: boolean
  gasLimit?: bigint
}

// EIP-7702 Transaction
export interface EIP7702Transaction {
  to?: Address
  value?: bigint
  data?: Hex
  gasLimit?: bigint
  authorizationList: AuthorizationTuple[]
}

// UI States
export interface UIState {
  isLoading: boolean
  error?: string
  success?: string
}

// Contract addresses (from deployment)
export interface ContractAddresses {
  implementation: Address
  paymaster: Address
  network: string
  blockNumber: number
}

// User account state
export interface AccountState {
  address: Address
  isDelegated: boolean
  implementationAddress?: Address
  nonce: number
  operators: Operator[]
  sessionKeys: SessionKey[]
}

// Gas estimation result
export interface GasEstimate {
  gasLimit: bigint
  gasPrice: bigint
  totalCost: bigint
}

// Authorization signing data
export interface AuthorizationData {
  chainId: number
  implementationAddress: Address
  nonce: bigint
  signature?: {
    r: Hex
    s: Hex
    yParity: number
  }
}