'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { WalletConnect } from '@/components/wallet-connect'
import { BatchTransactionV2 } from '@/components/batch-transaction-v2'
import { AccountInfo } from '@/components/account-info'
import { NetworkStatus } from '@/components/network-status'
import { DelegationStatus } from '@/components/delegation-status'
import { Steps } from '@/components/delegation/steps'
import { GatorProvider } from '@/components/providers/gator-provider'
import { StepProvider } from '@/components/providers/step-provider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, Info, Workflow } from 'lucide-react'
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
            <Badge variant="secondary">EIP-7710</Badge>
            <Badge variant="secondary">useSendCalls</Badge>
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="batch">
                  <Zap className="h-4 w-4 mr-2" />
                  Batch (EIP-7702)
                </TabsTrigger>
                <TabsTrigger value="delegation">
                  <Workflow className="h-4 w-4 mr-2" />
                  Delegation (EIP-7710)
                </TabsTrigger>
                <TabsTrigger value="info">
                  <Info className="h-4 w-4 mr-2" />
                  Info
                </TabsTrigger>
              </TabsList>

              <TabsContent value="batch" className="mt-6">
                <div className="space-y-6">
                  {/* Delegation Status */}
                  <DelegationStatus implementationAddress={STATELESS_DELEGATOR_ADDRESS} />
                  
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

              <TabsContent value="delegation" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Delegation Toolkit (EIP-7710)</CardTitle>
                    <CardDescription>
                      Create and manage delegations with MetaMask Smart Accounts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <StepProvider>
                      <GatorProvider>
                        <Steps />
                      </GatorProvider>
                    </StepProvider>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="info" className="mt-6">
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
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">EIP-7710: Delegation Toolkit</h3>
                      <p className="text-sm text-gray-600">
                        Create and manage delegations using MetaMask Delegation Toolkit. Includes smart account deployment,
                        delegation creation with caveats, and delegation redemption with sponsored gas (Pimlico).
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  )
}
