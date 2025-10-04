'use client'

import { useConnect, useDisconnect, useAccount, useSwitchChain, useChainId } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Wallet, LogOut, Network, AlertTriangle } from 'lucide-react'

export function WalletConnect() {
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { isConnected, address, chain } = useAccount()
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain()
  const chainId = useChainId()

  const isWrongNetwork = isConnected && chainId !== sepolia.id

  const handleSwitchToSepolia = () => {
    switchChain({ chainId: sepolia.id })
  }

  if (isConnected) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Connected
            </CardTitle>
            <CardDescription>
              {address && `${address.slice(0, 6)}...${address.slice(-4)}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              <span className="text-sm">Network:</span>
              <Badge variant={isWrongNetwork ? "destructive" : "default"}>
                {chain?.name || 'Unknown'}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => disconnect()} 
                variant="destructive"
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect Wallet
              </Button>
              
              {isWrongNetwork && (
                <Button 
                  onClick={handleSwitchToSepolia}
                  disabled={isSwitchingChain}
                  size="sm"
                >
                  <Network className="h-4 w-4 mr-2" />
                  {isSwitchingChain ? 'Switching...' : 'Switch to Sepolia'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        {isWrongNetwork && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please switch to Sepolia testnet to use EIP-7702 features. The contracts are deployed on Sepolia.
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Wallet</CardTitle>
        <CardDescription>
          Connect your wallet to start using EIP-7702 features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {connectors.map((connector) => (
          <Button
            key={connector.uid}
            onClick={() => connect({ connector })}
            disabled={isPending}
            className="w-full"
          >
            <Wallet className="h-4 w-4 mr-2" />
            {connector.name}
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}