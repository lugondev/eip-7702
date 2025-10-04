'use client'

import { useChainId, useSwitchChain } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Network, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'

export function NetworkStatus() {
  const chainId = useChainId()
  const { switchChain, isPending } = useSwitchChain()
  
  const isSepolia = chainId === sepolia.id
  const networkName = isSepolia ? 'Sepolia' : `Chain ${chainId}`

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Network className="h-4 w-4" />
          Network
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current:</span>
          <Badge variant={isSepolia ? "default" : "secondary"}>
            {networkName}
          </Badge>
        </div>

        {isSepolia ? (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Ready for EIP-7702</span>
          </div>
        ) : (
          <div className="space-y-2">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Switch to Sepolia for EIP-7702
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => switchChain({ chainId: sepolia.id })}
              disabled={isPending}
              size="sm"
              className="w-full"
            >
              {isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Switching...
                </>
              ) : (
                <>
                  <Network className="h-4 w-4 mr-2" />
                  Switch to Sepolia
                </>
              )}
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground pt-2 border-t">
          Chain ID: {chainId}
        </div>
      </CardContent>
    </Card>
  )
}