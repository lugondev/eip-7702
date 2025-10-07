'use client'

import { useChainId, useSwitchChain } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Network, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { isSupportedChain, getChainName, supportedChains } from '@/lib/supported-chains'

export function NetworkStatus() {
  const chainId = useChainId()
  const { switchChain, isPending } = useSwitchChain()
  
  const isSupported = isSupportedChain(chainId)
  const isSepolia = chainId === sepolia.id
  const networkName = getChainName(chainId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Network className="h-4 w-4" />
          Current Network
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Connected to:</span>
          <Badge variant={isSupported ? "default" : "destructive"}>
            {networkName}
          </Badge>
        </div>

        {!isSupported ? (
          <div className="space-y-2">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Unsupported network! Please switch.
              </AlertDescription>
            </Alert>
          </div>
        ) : isSepolia ? (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Sẵn sàng cho EIP-7702</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <CheckCircle className="h-4 w-4" />
            <span>Ready for EIP-7702</span>
          </div>
        )}

        <div className="text-xs text-muted-foreground pt-2 border-t">
          Chain ID: {chainId}
        </div>

        {/* Quick switch to other networks */}
        {isSupported && !isSepolia && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">Quick switch:</p>
            <div className="grid grid-cols-2 gap-1">
              {supportedChains.slice(0, 4).map((chain) => (
                <Button
                  key={chain.id}
                  onClick={() => switchChain({ chainId: chain.id })}
                  disabled={isPending || chainId === chain.id}
                  size="sm"
                  variant="outline"
                  className="text-xs h-8"
                >
                  {chain.name.split(' ')[0]}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}