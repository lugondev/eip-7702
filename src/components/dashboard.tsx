'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { WalletConnect } from '@/components/wallet-connect'
import { BatchTransactionEnhanced } from '@/components/batch-transaction-enhanced'
import { BatchResultChecker } from '@/components/batch-result-checker'
import { TransactionHistory } from '@/components/transaction-history'
import { CompactHeaderInfo } from '@/components/compact-header-info'
import { RevokeDelegationButton } from '@/components/delegation/revoke-delegation-button'
import { UnsupportedNetworkAlert } from '@/components/ui/unsupported-network-alert'
import { useDelegationStatus } from '@/hooks/use-delegation-status'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, Info, ClipboardCheck, History as HistoryIcon, ExternalLink, Copy, Check } from 'lucide-react'
import { useChainId } from 'wagmi'
import { getExplorerUrl, getExplorerName } from '@/lib/supported-chains'
import { Button } from '@/components/ui/button'
import type { Address } from 'viem'

const STATELESS_DELEGATOR_ADDRESS = (
  process.env.NEXT_PUBLIC_STATELESS_DELEGATOR_ADDRESS || 
  '0x63c0c19a282a1b52b07dd5a65b58948a07dae32b'
) as Address

function DelegatedAddressInfo({ address }: { address: Address }) {
  const chainId = useChainId()
  const explorerUrl = getExplorerUrl(chainId, address)
  const explorerName = getExplorerName(chainId)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
        <code className="flex-1 text-sm font-mono break-all">{address}</code>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0"
          onClick={copyToClipboard}
          title="Copy address"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          <ExternalLink className="h-4 w-4" />
          View on {explorerName || 'Block Explorer'}
        </a>
      )}
    </div>
  )
}

export function EIP7702Dashboard() {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState('batch')
  const { isDelegated, delegatedTo, checkDelegation, isChecking } = useDelegationStatus(STATELESS_DELEGATOR_ADDRESS)

  // Auto-check delegation when connected
  useEffect(() => {
    if (isConnected && address) {
      checkDelegation()
    }
  }, [isConnected, address, checkDelegation])

  // Recheck when switching to info tab
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === 'info' && isConnected && address) {
      checkDelegation()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            EIP-7702 Batch Transactions
          </h1>
          <p className="text-sm text-gray-600 mb-2">
            Execute multiple transactions atomically
          </p>
          <div className="flex justify-center gap-1.5">
            <Badge variant="secondary" className="text-xs py-0">EIP-7702</Badge>
            <Badge variant="secondary" className="text-xs py-0">useSendCalls</Badge>
            <Badge variant="secondary" className="text-xs py-0">Wagmi v2</Badge>
          </div>
        </div>

        {!isConnected ? (
          <div className="max-w-md mx-auto space-y-4">
            <WalletConnect />
          </div>
        ) : (
          <>
            {/* Unsupported Network Alert */}
            <div className="mb-3">
              <UnsupportedNetworkAlert />
            </div>
            
            {/* Compact Header Info */}
            <div className="mb-3">
              <CompactHeaderInfo 
                address={address!}
                delegatorAddress={STATELESS_DELEGATOR_ADDRESS}
                isDelegated={isDelegated || false}
              />
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="batch">
                  <Zap className="h-4 w-4 mr-2" />
                  Batch
                </TabsTrigger>
                <TabsTrigger value="check">
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Check Result
                </TabsTrigger>
                <TabsTrigger value="history">
                  <HistoryIcon className="h-4 w-4 mr-2" />
                  History
                </TabsTrigger>
                <TabsTrigger value="info">
                  <Info className="h-4 w-4 mr-2" />
                  Info
                </TabsTrigger>
              </TabsList>

              <TabsContent value="batch" className="mt-3">
                <div className="space-y-3">
                  {/* Enhanced Batch Transaction Form with Template/Manual/API + ETH/Wei */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Zap className="h-4 w-4" />
                        Batch Transactions
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Execute multiple transactions atomically
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <BatchTransactionEnhanced />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="check" className="mt-3">
                <BatchResultChecker />
              </TabsContent>

              <TabsContent value="history" className="mt-3">
                <TransactionHistory />
              </TabsContent>

              <TabsContent value="info" className="mt-3">
                <div className="space-y-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>About This Demo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">EIP-7702: Batch Transactions</h3>
                        <p className="text-sm text-gray-600">
                          Execute multiple transactions atomically using <code className="bg-gray-100 px-1 py-0.5 rounded">useSendCalls</code> from wagmi/experimental.
                          MetaMask automatically handles EOA → Smart Account upgrade.
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          This demo showcases the power of EIP-7702 by allowing users to upgrade their Externally Owned Accounts (EOA) 
                          to smart accounts temporarily, enabling advanced features like batch transactions, delegation, and sponsored gas.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Delegation Info Card with Revoke */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Current Delegation Status
                      </CardTitle>
                      <CardDescription>
                        {isDelegated ? 'Your account is delegated to a smart contract' : 'Your account is in normal EOA state'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Status:</span>
                        {isDelegated ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            ✓ Correct Implementation
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Not Delegated
                          </Badge>
                        )}
                      </div>

                      {isDelegated && delegatedTo && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Delegated Address:</p>
                          <DelegatedAddressInfo 
                            address={delegatedTo}
                          />
                        </div>
                      )}

                      {/* Revoke Delegation Button */}
                      <div className="pt-2 border-t">
                        <RevokeDelegationButton 
                          implementationAddress={STATELESS_DELEGATOR_ADDRESS}
                          showStatus={false}
                          onSuccess={() => {
                            // Refresh delegation status after revoke
                            setTimeout(() => window.location.reload(), 2000)
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Import flow diagrams */}
                  {/* <EIP7702FlowDiagram /> */}
                  {/* <DelegationFlowDiagram /> */}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Footer */}
        <footer className="mt-6 pt-4 border-t text-center">
          <p className="text-xs text-gray-500">
            EIP-7702 Demo • Built with Wagmi v2 & Next.js • Made with ❤️ by LugonDev • {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  )
}
