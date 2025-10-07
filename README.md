# EIP-7702 Batch Transactions Demo

A modern demo implementing **EIP-7702** for EOA account abstraction using **wagmi/experimental** `useSendCalls`:

## 🚀 Features

- 🚀 **Zero Setup**: No smart account deployment needed
- 🦊 **MetaMask Integration**: Auto-prompts to upgrade EOA to smart account
- ⚡ **Atomic Execution**: All transactions succeed or all fail
- 📦 **ERC-5792 Compliant**: Using `wallet_sendCalls` standard
- 🎯 **Preset Templates**: 8 ready-to-use templates for common use cases
- ⛽ **Gas Estimation**: Compare batch vs sequential gas costs
- � **Transaction History**: Auto-save and track all batch transactions
- 🔍 **Enhanced Result Viewer**: Decode 50+ common function signatures
- 🔐 **Revoke Delegation**: Reset account to normal EOA anytime

👉 **Perfect for**: Simple batch transactions, quick demos, minimal complexity

## 📚 Documentation

### 📖 In-App Documentation
- **[/docs](http://localhost:3000/docs)** - Complete EIP-7702 specification, motivation, and technical details
- **[/reference](http://localhost:3000/reference)** - Code examples, tutorials, and best practices
- **[Demo](http://localhost:3000)** - Live interactive demo with batch transactions

### 📝 Project Guides
- [EIP-7702 Implementation Guide](.docs/wagmi-viem-implementation.md)
- [Comparison V1 vs V2](.docs/comparison-v1-vs-v2.md)
- [Revoke Delegation Guide](.docs/revoke-delegation-guide.md) - Complete guide with 4 methods
- [Revoke Implementation](.docs/REVOKE_IMPLEMENTATION.md) - Quick start & API reference
- [Revoke Examples](.docs/revoke-examples.tsx) - Copy-paste code snippets

## Main Features

### 🎯 Core Features
- 🔐 **Authorization Signing**: Sign authorization to delegate EOA to smart contract
- ⚡ **Batch Transactions**: Modern approach with `useSendCalls` - MetaMask automatically handles authorization
- 🔑 **Session Keys**: Manage session keys with expiration
- 📊 **Monitoring**: Track delegation status and activities

### 📚 NEW Features (Phase 1 - October 2025)
- 🔐 **Revoke Delegation**: Reset account to normal EOA - clear delegation anytime
  - UI component with status display in Info tab
  - Multiple revoke methods (Hook, Viem)
  - Complete documentation with examples
- ⛽ **Gas Estimation**: See gas costs before submitting - compare batch vs sequential
- 🎯 **Preset Templates**: 8 ready-to-use templates for common use cases (DeFi, NFT, Transfers)
  - Multi-Token Transfer
  - DeFi Approve + Swap
  - NFT Batch Mint
  - Social Recovery Setup
  - Payment Batch
  - Test Templates (Simple & Self-transfers)

### 📚 NEW Features (Phase 2 - October 2025)
- 📜 **Transaction History**: Auto-save all batch transactions with full details
  - Persistent localStorage storage (last 100 transactions)
  - Search and filter by status, date, or batch ID
  - Export/Import history as JSON
  - Statistics dashboard (total, confirmed, pending, failed)
  - Quick access to transaction details and receipts
- 🔍 **Enhanced Result Viewer**: Detailed transaction decoder and analyzer
  - **Function Decoder**: Automatically decode 50+ common function signatures
    - ERC20: transfer, approve, transferFrom
    - ERC721/1155: safeTransferFrom, setApprovalForAll
    - Uniswap V2/V3: swap functions
    - WETH: deposit, withdraw
  - **Transaction Details**: Beautiful UI showing:
    - Decoded function names and arguments
    - Transaction type detection (Transfer, Swap, Approval, etc.)
    - Gas usage with color-coded warnings
    - Value transfers in ETH and wei
    - Raw data with copy-to-clipboard
  - **Visual Timeline**: Step-by-step execution flow
    - Transaction submitted timestamp
    - Confirmation with block number
    - Failed status with error messages
  - **Share & Export**: Share transaction details easily
  - **Expandable Call Details**: Click to view full details for each call
  - **Etherscan Integration**: Direct links to addresses and transactions

### 📚 Documentation Features
- 📖 **Interactive Docs Page**: Complete EIP-7702 specification with examples
- 💻 **Code Reference**: Copy-paste ready code snippets for all use cases
- 🎨 **Visual Flow Diagrams**: Step-by-step visualization of EIP-7702 and EIP-7710 processes
- 🧭 **Navigation Bar**: Easy access to Demo, Docs, and Reference sections
- ✅ **Best Practices Guide**: Production-ready recommendations and troubleshooting

## Project Structure

```
eip-7702/
├── src/
│   ├── app/                       # Next.js 15 App Router
│   │   ├── page.tsx              # Home/Demo page
│   │   ├── docs/                 # Documentation pages
│   │   │   └── page.tsx          # EIP-7702 specification
│   │   ├── reference/            # Code reference pages
│   │   │   └── page.tsx          # Examples & tutorials
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── components/               # React components
│   │   ├── dashboard.tsx         # Main dashboard with 4 tabs
│   │   ├── batch-transaction-enhanced.tsx  # Batch transaction with templates
│   │   ├── batch-result-checker.tsx  # Check batch results
│   │   ├── transaction-history.tsx   # Transaction history viewer
│   │   ├── enhanced-result-viewer.tsx # Transaction decoder
│   │   ├── gas-estimation-display.tsx # Gas estimation
│   │   ├── compact-header-info.tsx   # Account info header
│   │   ├── delegation/           # Delegation components
│   │   │   ├── revoke-delegation-button.tsx
│   │   │   └── steps.tsx
│   │   ├── providers/            # Context providers
│   │   └── ui/                   # UI components (shadcn)
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-batch-calls.ts    # Batch transaction logic
│   │   ├── use-delegation-status.ts  # Check delegation status
│   │   ├── use-revoke-delegation.ts  # Revoke delegation
│   │   ├── use-gas-estimation.ts     # Gas estimation
│   │   └── use-transaction-history.ts # Transaction history
│   ├── lib/                      # Utilities & config
│   │   ├── wagmi.ts             # Wagmi configuration
│   │   ├── utils.ts             # Helper functions
│   │   ├── batch-templates.ts   # Preset templates
│   │   ├── transaction-decoder.ts # Function decoder
│   │   ├── supported-chains.ts  # Chain configurations
│   │   └── abis/                # Contract ABIs
│   └── types/                    # TypeScript types
└── README.md
```

## System Requirements

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git

## Quick Start

### 1. Install dependencies

```bash
# Clone repository
git clone <your-repo-url>
cd eip-7702

# Install dependencies
pnpm install
```

### 2. Setup environment

```bash
# Copy environment template
cp .env.local.example .env.local

# Get free Alchemy API key: https://www.alchemy.com/
# Update .env.local with your keys:
# NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY_HERE

# Contract addresses are pre-configured for Sepolia
```

### 3. Start application

```bash
# Start development server
pnpm dev
```

### 4. Test EIP-7702 Batch Transactions

1. Open http://localhost:3000
2. Connect MetaMask wallet
3. Switch to **Sepolia testnet**
4. Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
5. Go to **"Batch Transactions"** tab
6. Choose a template or create custom transactions
7. Review gas estimation
8. Click **"Execute Batch"**
9. MetaMask prompts: **"Upgrade to Smart Account?"** → Approve
10. All transactions execute atomically! 🎉
11. Check result in **"Check Result"** tab or on Etherscan

**That's it! No manual authorization needed - MetaMask handles everything!**

### 5. View Transaction History

1. Go to **"Transaction History"** tab
2. View all past batch transactions
3. Search and filter by status or date
4. Click on any transaction to see decoded details
5. Export/Import history as JSON

### 6. Check Account Info & Revoke Delegation

1. Go to **"Info"** tab
2. View current delegation status
3. See delegated contract address (if delegated)
4. Click **"Revoke Delegation"** to reset to normal EOA
5. Confirm transaction in MetaMask
6. Account reverted to normal EOA! 🎉

**Alternative Methods:**
- Use hook: `const { revokeDelegation } = useRevokeDelegation()`
- MetaMask UI: Account Details → Switch to EOA
- See full guide: [.docs/revoke-delegation-guide.md](.docs/revoke-delegation-guide.md)

## Smart Contracts

### 🌟 EIP7702StatelessDelegator (Recommended)

**Address**: `0x63c0c19a282a1b52b07dd5a65b58948a07dae32b` (Sepolia)

Contract used in real EIP-7702 transactions on Sepolia:
- **Stateless Design**: No contract storage, lower gas costs
- **Simple & Efficient**: Single execute function with Execution struct
- **Battle-tested**: Used in production transactions
- **ERC-7579 Compatible**: Follows Module standard

```solidity
struct Execution {
    address target;
    uint256 value;
    bytes callData;
}

function execute(Execution calldata _execution) external payable;
```

## Frontend Features

### Tech Stack
- **Next.js 15** with App Router
- **React 19** with Server Components  
- **Viem 2.37.12** for EIP-7702 support
- **Wagmi 2.x** for wallet management
- **Tailwind CSS** + Radix UI for styling
- **shadcn/ui** for component library

### Supported Networks
- ✅ **Ethereum Mainnet** (Chain ID: 1)
- ✅ **BNB Smart Chain** (Chain ID: 56)
- ✅ **BNB Smart Chain Testnet** (Chain ID: 97)
- ✅ **Mega Testnet** (Chain ID: 10008)
- ✅ **Base Mainnet** (Chain ID: 8453)
- ✅ **Arbitrum One** (Chain ID: 42161)
- ✅ **Sepolia Testnet** (Chain ID: 11155111)

### Wallet Connection
- 🦊 **MetaMask Only** - Optimized for MetaMask wallet
- No WalletConnect or other connectors
- MetaMask automatically handles EIP-7702 authorization

### Main Pages

- **[Home /](/)**: Interactive demo with batch transactions
- **[Docs /docs](/docs)**: Complete EIP-7702 specification and guides
- **[Reference /reference](/reference)**: Code examples, tutorials, and best practices

### Main Components

- **Dashboard**: Main interface with 4 tabs (Batch Transactions, Check Result, Transaction History, Info)
- **BatchTransactionEnhanced**: 
  - Create multiple transaction calls
  - 8 preset templates for common use cases
  - Gas estimation before execution
  - Auto sign authorization + encode + send
  - Atomic execution (all or nothing)
  - Uses `useSendCalls` hook (ERC-5792)
- **BatchResultChecker**: Check status and results of batch transactions
- **TransactionHistory**: 
  - View all past transactions
  - Search and filter capabilities
  - Export/Import as JSON
  - Statistics dashboard
- **EnhancedResultViewer**: 
  - Decode 50+ common function signatures
  - Transaction details with gas usage
  - Visual timeline of execution
  - Etherscan integration
- **RevokeDelegationButton**: Component for revoking delegation
  - Status display with delegated address
  - Revoke button with loading states
  - Success/Error messages
  - Etherscan links
- **CompactHeaderInfo**: Display address, balance, network info
- **WalletConnect**: MetaMask connection with network detection

### Hooks

- **useBatchCalls**: Main hook for batch transactions
  - Uses wagmi's `useSendCalls` (ERC-5792)
  - Automatic authorization handling
  - Transaction status tracking
- **useRevokeDelegation**: Revoke delegation logic
  - Multiple revoke methods (Viem, Contract)
  - Delegation status checking
  - Error handling with helpful messages
  - Transaction tracking
- **useDelegationStatus**: Check delegation state
  - Check if account is delegated
  - Get delegated contract address
  - Auto-refresh capabilities
- **useGasEstimation**: Estimate gas costs
  - Compare batch vs sequential execution
  - Calculate gas savings
  - Display estimated costs
- **useTransactionHistory**: Manage transaction history
  - Auto-save transactions to localStorage
  - Search and filter capabilities
  - Export/Import as JSON

### Key Features

✅ **Complete EIP-7702 Flow**:
1. Sign authorization → 2. Encode call data → 3. Send type 0x04 tx → 4. Verify on Etherscan

✅ **Error Handling**: Comprehensive error messages and recovery flows

✅ **Network Detection**: Auto-detect wrong network and prompt switch

✅ **Loading States**: Visual feedback for async operations

✅ **Transaction Tracking**: Links to Etherscan for all transactions

## Development Commands

```bash
# Install all dependencies
pnpm install

# Development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Type check
pnpm type-check

# Clean build artifacts
pnpm clean
```

## Deployment

### Deploy to Vercel (Recommended)

#### Option 1: Deploy via Vercel Dashboard (Easiest)

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click **"Import Project"**
4. Select your repository
5. Configure environment variables:
   - `NEXT_PUBLIC_SEPOLIA_RPC_URL`
   - `NEXT_PUBLIC_PIMLICO_API_KEY` (optional, for EIP-7710)
6. Click **"Deploy"**
7. Done! Your app is live 🎉

#### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally (if not installed)
pnpm add -g vercel

# Login to Vercel
vercel login

# Build and deploy to production
pnpm build
vercel --prod

# Or deploy preview (for testing)
vercel
```

#### Environment Variables Setup on Vercel

Go to your project settings → Environment Variables and add:

```env
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_PIMLICO_API_KEY=your_pimlico_api_key
```

**Note**: Environment variables with `NEXT_PUBLIC_` prefix are exposed to the browser.

### Deploy to Other Platforms

#### Netlify
```bash
pnpm build
# Deploy .next folder
```

#### Self-hosted (VPS/AWS/DigitalOcean)
```bash
# Build application
pnpm build

# Start production server
pnpm start

# Or use PM2 for process management
pm2 start pnpm --name "eip-7702" -- start
```

### Production Considerations

1. Ensure all environment variables are set
2. Test thoroughly on Sepolia testnet first
3. Monitor gas costs and transaction success rates
4. Set up error tracking (e.g., Sentry)
5. Configure proper CORS and security headers

## Security Considerations

### Frontend Security

- ✅ Transaction confirmation UIs
- ✅ Input sanitization and validation
- ✅ Secure signature handling
- ✅ Clear user prompts for all actions
- ✅ Network validation before transactions

## Troubleshooting

### Common Issues

1. **MetaMask not prompting for authorization**
   - Ensure you're on a supported network (Sepolia recommended)
   - Update MetaMask to latest version
   - Try refreshing the page and reconnecting wallet

2. **Batch transaction fails**
   - Check gas limits and balances
   - Verify all transaction calls are valid
   - Review error messages in Check Result tab

3. **Cannot revoke delegation**
   - Ensure account is actually delegated (check Info tab)
   - Try different revoke methods (see revoke guide)
   - Check network connection and gas balance

4. **Gas estimation showing N/A**
   - Some networks may not support gas estimation
   - Transaction will still work, just estimate manually
   - Check console for detailed errors

### Debug Tips

```bash
# Check build issues
pnpm build

# View detailed error logs
pnpm dev
# Then check browser console (F12)

# Clear Next.js cache
rm -rf .next
pnpm dev
```

## Contributing

1. Fork repository
2. Create feature branch
3. Follow code standards in `.copilot.instructions.md`
4. Test your changes thoroughly
5. Submit pull request with clear description

## License

MIT License - see LICENSE file for more details.

## Resources

- [EIP-7702 Specification](https://eips.ethereum.org/EIPS/eip-7702)
- [Viem Documentation](https://viem.sh)
- [Next.js 15 Docs](https://nextjs.org/docs)