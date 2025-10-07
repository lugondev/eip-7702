"use client"

import { useAccount, useChainId, useSwitchChain } from "wagmi"
import { Alert, AlertTitle, AlertDescription } from "./alert"
import { Button } from "./button"
import { Badge } from "./badge"
import { AlertTriangle, Network, RefreshCw } from "lucide-react"
import { supportedChains, getChainName } from '@/lib/supported-chains'

export function UnsupportedNetworkAlert() {
  const chainId = useChainId()
  const { isConnected } = useAccount()
  const { switchChain, isPending } = useSwitchChain()
  
  const supportedIds = supportedChains.map(c => c.id)
  const isSupported = supportedIds.includes(chainId)
  const currentChainName = getChainName(chainId)

  if (!isConnected) return null
  if (isSupported) return null

  const handleSwitchNetwork = (targetChainId: number) => {
    switchChain({ chainId: targetChainId })
  }

  return (
    <Alert variant="destructive" className="border-2 border-red-500 bg-red-50 dark:bg-red-950">
      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
      <AlertTitle className="text-red-800 dark:text-red-200 font-semibold text-lg">
        ⚠️ Unsupported Network
      </AlertTitle>
      <AlertDescription className="space-y-4 text-red-700 dark:text-red-300">
        <div className="space-y-2">
          <p className="text-sm">
            You are currently connected to:{' '}
            <Badge variant="destructive" className="ml-1">
              {currentChainName}
            </Badge>
          </p>
          <p className="text-sm font-medium">
            Please switch to one of the supported networks:
          </p>
        </div>

        {/* List of supported networks with switch buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-3 bg-white dark:bg-gray-900 rounded-md border border-red-200 dark:border-red-800">
          {supportedChains.map((chain) => (
            <Button
              key={chain.id}
              onClick={() => handleSwitchNetwork(chain.id)}
              disabled={isPending}
              variant="outline"
              size="sm"
              className="justify-start text-left h-auto py-2 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950"
            >
              <Network className="h-4 w-4 mr-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{chain.name}</div>
                <div className="text-xs text-muted-foreground">
                  Chain ID: {chain.id}
                </div>
              </div>
            </Button>
          ))}
        </div>

        {isPending && (
          <div className="flex items-center gap-2 text-sm font-medium">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Switching network...</span>
          </div>
        )}

        <p className="text-xs mt-2 flex items-center gap-1">
          💡 <span className="font-medium">Tip:</span> You can switch networks in your MetaMask wallet or click the buttons above.
        </p>
      </AlertDescription>
    </Alert>
  )
}
