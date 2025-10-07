'use client'

import { useChainId, useSwitchChain } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Network, CheckCircle, RefreshCw } from 'lucide-react'
import { supportedChains, getChainName } from '@/lib/supported-chains'

/**
 * Network Switcher Component
 * Displays all supported networks with ability to switch between them
 */
export function NetworkSwitcher() {
  const chainId = useChainId()
  const { switchChain, isPending } = useSwitchChain()

  const handleSwitchNetwork = (targetChainId: number) => {
    if (chainId === targetChainId) return
    switchChain({ chainId: targetChainId })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Select Network
        </CardTitle>
        <CardDescription>
          Switch between supported networks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {supportedChains.map((chain) => {
            const isActive = chainId === chain.id
            const isTestnet = chain.testnet || chain.id === 11155111 || chain.id === 97 || chain.id === 10008

            return (
              <Button
                key={chain.id}
                onClick={() => handleSwitchNetwork(chain.id)}
                disabled={isPending || isActive}
                variant={isActive ? "default" : "outline"}
                className={`h-auto py-4 justify-start ${
                  isActive ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-3 w-full">
                  <Network className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                    isActive ? 'text-white' : 'text-blue-600'
                  }`} />
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{chain.name}</span>
                      {isActive && (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs opacity-80">
                        Chain ID: {chain.id}
                      </span>
                      {isTestnet && (
                        <Badge variant="secondary" className="text-xs">
                          Testnet
                        </Badge>
                      )}
                    </div>
                    {chain.nativeCurrency && (
                      <span className="text-xs opacity-70">
                        {chain.nativeCurrency.symbol}
                      </span>
                    )}
                  </div>
                </div>
              </Button>
            )
          })}
        </div>

        {isPending && (
          <div className="flex items-center justify-center gap-2 text-sm mt-4 p-3 bg-blue-50 rounded-md">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="font-medium">Switching network...</span>
          </div>
        )}

        <div className="mt-4 p-3 bg-muted rounded-md">
          <p className="text-xs text-muted-foreground">
            <strong>Current Network:</strong> {getChainName(chainId)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            ✨ All networks support EIP-7702
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
