'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { WalletConnect } from '@/components/wallet-connect'
import { BatchTransactionV2 } from '@/components/batch-transaction-v2'
import { BatchResultChecker } from '@/components/batch-result-checker'
import { TransactionHistory } from '@/components/transaction-history'
import { AccountInfo } from '@/components/account-info'
import { NetworkStatus } from '@/components/network-status'
import { DelegationStatus } from '@/components/delegation-status'
import { RevokeDelegationButton } from '@/components/delegation/revoke-delegation-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, Info, ClipboardCheck, History as HistoryIcon } from 'lucide-react'
import type { Address } from 'viem'

const STATELESS_DELEGATOR_ADDRESS = (
  process.env.NEXT_PUBLIC_STATELESS_DELEGATOR_ADDRESS || 
  '0x63c0c19a282a1b52b07dd5a65b58948a07dae32b'
) as Address

export function EIP7702Dashboard() {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState('batch')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            EIP-7702 Batch Transactions
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Execute multiple transactions atomically
          </p>
          <div className="flex justify-center gap-2">
            <Badge variant="secondary">EIP-7702</Badge>
            <Badge variant="secondary">useSendCalls</Badge>
            <Badge variant="secondary">Wagmi v2</Badge>
          </div>
        </div>

        {!isConnected ? (
          <div className="max-w-md mx-auto space-y-4">
            <WalletConnect />
            <NetworkStatus />
          </div>
        ) : (
          <>
            <div className="mb-6 grid gap-4 md:grid-cols-4">
              <div className="md:col-span-3">
                <AccountInfo 
                  address={address!}
                  implementationAddress={STATELESS_DELEGATOR_ADDRESS}
                />
              </div>
              <div>
                <NetworkStatus />
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="batch">
                  <Zap className="h-4 w-4 mr-2" />
                  Batch (EIP-7702)
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

              <TabsContent value="batch" className="mt-6">
                <div className="space-y-6">
                  {/* Revoke Delegation */}
                  <RevokeDelegationButton 
                    implementationAddress={STATELESS_DELEGATOR_ADDRESS}
                    showStatus={true}
                    onSuccess={() => {
                      // Refresh delegation status after revoke
                      setTimeout(() => window.location.reload(), 2000)
                    }}
                  />
                  
                  {/* Batch Transaction Form */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Batch Transactions (EIP-7702)</CardTitle>
                      <CardDescription>
                        Execute multiple transactions atomically using useSendCalls
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BatchTransactionV2 />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="check" className="mt-6">
                <BatchResultChecker />
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <TransactionHistory />
              </TabsContent>

              <TabsContent value="info" className="mt-6">
                <div className="space-y-6">
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

                  {/* Import flow diagrams */}
                  {/* <EIP7702FlowDiagram /> */}
                  {/* <DelegationFlowDiagram /> */}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  )
}
