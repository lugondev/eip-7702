import type { Address } from 'viem'

/**
 * Preset batch transaction templates
 * Pre-configured common use cases for easy testing and demo
 */

export interface BatchTemplate {
  id: string
  name: string
  description: string
  icon: string
  category: 'defi' | 'nft' | 'transfer' | 'social' | 'other'
  calls: Array<{
    to: string
    value: string
    data: string
    description: string
  }>
  requirements?: string[]
  estimatedGas?: string
}

export const BATCH_TEMPLATES: BatchTemplate[] = [
  // Multi-Token Transfer
  {
    id: 'multi-transfer',
    name: 'Multi-Token Transfer',
    description: 'Send ETH to multiple addresses at once',
    icon: '💸',
    category: 'transfer',
    estimatedGas: '~150k',
    calls: [
      {
        to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
        value: '0.001',
        data: '0x',
        description: 'Send 0.001 ETH to Address 1'
      },
      {
        to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        value: '0.002',
        data: '0x',
        description: 'Send 0.002 ETH to Address 2'
      },
      {
        to: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        value: '0.001',
        data: '0x',
        description: 'Send 0.001 ETH to Address 3'
      }
    ],
    requirements: ['Sufficient ETH balance (0.004+ ETH)']
  },

  // DeFi Approve + Swap
  {
    id: 'defi-approve-swap',
    name: 'DeFi Approve + Swap',
    description: 'Approve token and swap in one transaction',
    icon: '🔄',
    category: 'defi',
    estimatedGas: '~200k',
    calls: [
      {
        to: '0x7af963cF6D228E564e2A0aA0DdBF06210B38615D', // Example ERC20 token
        value: '0',
        data: '0x095ea7b3000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb10000000000000000000000000000000000000000000000000de0b6b3a7640000',
        description: 'Approve 1 token to router'
      },
      {
        to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1', // Example router
        value: '0',
        data: '0x38ed1739000000000000000000000000000000000000000000000000000000000000000a',
        description: 'Swap tokens'
      }
    ],
    requirements: ['Token balance', 'Router address', 'Approval amount']
  },

  // NFT Batch Mint
  {
    id: 'nft-batch-mint',
    name: 'NFT Batch Mint',
    description: 'Mint multiple NFTs in one transaction',
    icon: '🎨',
    category: 'nft',
    estimatedGas: '~300k',
    calls: [
      {
        to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Example NFT contract
        value: '0.01',
        data: '0x1249c58b', // mint() function
        description: 'Mint NFT #1'
      },
      {
        to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        value: '0.01',
        data: '0x1249c58b',
        description: 'Mint NFT #2'
      },
      {
        to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        value: '0.01',
        data: '0x1249c58b',
        description: 'Mint NFT #3'
      }
    ],
    requirements: ['NFT contract address', 'Mint fee (0.03 ETH)']
  },

  // Social Recovery Setup
  {
    id: 'social-recovery',
    name: 'Social Recovery Setup',
    description: 'Setup guardians for account recovery',
    icon: '🛡️',
    category: 'social',
    estimatedGas: '~180k',
    calls: [
      {
        to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1', // Recovery contract
        value: '0',
        data: '0x8da5cb5b0000000000000000000000003c44cdddb6a900fa2b585dd299e03d12fa4293bc',
        description: 'Add Guardian 1'
      },
      {
        to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
        value: '0',
        data: '0x8da5cb5b00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8',
        description: 'Add Guardian 2'
      },
      {
        to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
        value: '0',
        data: '0x8da5cb5b000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
        description: 'Add Guardian 3'
      }
    ],
    requirements: ['Recovery contract deployed', 'Guardian addresses']
  },

  // Payment Batch
  {
    id: 'payment-batch',
    name: 'Payment Batch',
    description: 'Pay multiple people at once (salary, invoices, etc)',
    icon: '💰',
    category: 'transfer',
    estimatedGas: '~200k',
    calls: [
      {
        to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
        value: '0.5',
        data: '0x',
        description: 'Salary payment to Employee 1'
      },
      {
        to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        value: '0.3',
        data: '0x',
        description: 'Salary payment to Employee 2'
      },
      {
        to: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        value: '0.2',
        data: '0x',
        description: 'Contractor payment'
      }
    ],
    requirements: ['Sufficient ETH balance (1+ ETH)']
  },

  // Test Simple Transfer
  {
    id: 'test-simple',
    name: 'Test: Simple Transfers',
    description: 'Simple test with small amounts (good for first try)',
    icon: '🧪',
    category: 'other',
    estimatedGas: '~100k',
    calls: [
      {
        to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
        value: '0.0001',
        data: '0x',
        description: 'Test transfer 1'
      },
      {
        to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        value: '0.0001',
        data: '0x',
        description: 'Test transfer 2'
      }
    ],
    requirements: ['Small ETH amount (0.001 ETH)']
  },

  // Self-Transfer Test
  {
    id: 'test-self',
    name: 'Test: Self Transfers',
    description: 'Transfer to yourself - zero risk test',
    icon: '🔄',
    category: 'other',
    estimatedGas: '~63k',
    calls: [
      {
        to: 'SELF', // Will be replaced with user's address
        value: '0.0001',
        data: '0x',
        description: 'Send to self (Test 1)'
      },
      {
        to: 'SELF',
        value: '0.0001',
        data: '0x',
        description: 'Send to self (Test 2)'
      }
    ],
    requirements: ['No risk - sending to yourself']
  },

  // Custom Template (empty)
  {
    id: 'custom',
    name: 'Custom Batch',
    description: 'Start from scratch with empty calls',
    icon: '✏️',
    category: 'other',
    estimatedGas: 'Variable',
    calls: [
      {
        to: '',
        value: '0',
        data: '0x',
        description: 'Custom call 1'
      }
    ],
    requirements: []
  }
]

/**
 * Get template by ID
 */
export function getTemplate(id: string): BatchTemplate | undefined {
  return BATCH_TEMPLATES.find(t => t.id === id)
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: BatchTemplate['category']): BatchTemplate[] {
  return BATCH_TEMPLATES.filter(t => t.category === category)
}

/**
 * Replace SELF placeholder with actual address
 */
export function prepareTemplate(template: BatchTemplate, userAddress: Address): BatchTemplate {
  return {
    ...template,
    calls: template.calls.map(call => ({
      ...call,
      to: call.to === 'SELF' ? userAddress : call.to
    }))
  }
}
