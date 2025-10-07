'use client'

import { useBalance, useChainId } from 'wagmi'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wallet, Fuel, Network, Shield, CheckCircle2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import type { Address } from 'viem'
import { getChainName, isSupportedChain } from '@/lib/supported-chains'

interface CompactHeaderInfoProps {
  address: Address
  delegatorAddress: Address
  isDelegated?: boolean
}

export function CompactHeaderInfo({ address, delegatorAddress, isDelegated }: CompactHeaderInfoProps) {
  const { data: balance } = useBalance({ address })
  const chainId = useChainId()
  const networkName = getChainName(chainId)
  const isSupported = isSupportedChain(chainId)
  const [copiedAddress, setCopiedAddress] = useState(false)

  const formatAddress = (addr: Address) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatBalance = (balance: any) => {
    if (!balance) return '0.0000'
    return parseFloat(balance.formatted).toFixed(4)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 2000)
  }

  return (
    <Card className="border-2">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Account */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wallet className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Account</p>
              <div className="flex items-center gap-1">
                <p className="text-sm font-mono font-semibold">{formatAddress(address)}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => copyToClipboard(address)}
                >
                  {copiedAddress ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Fuel className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="text-sm font-semibold">{formatBalance(balance)} ETH</p>
            </div>
          </div>

          {/* Delegator */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDelegated ? 'bg-purple-100' : 'bg-gray-100'}`}>
              <Shield className={`h-4 w-4 ${isDelegated ? 'text-purple-600' : 'text-gray-400'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Delegator</p>
              <div className="flex items-center gap-1">
                <p className="text-sm font-mono font-semibold truncate">{formatAddress(delegatorAddress)}</p>
                {isDelegated && (
                  <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>

          {/* Network */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isSupported ? 'bg-indigo-100' : 'bg-red-100'}`}>
              <Network className={`h-4 w-4 ${isSupported ? 'text-indigo-600' : 'text-red-600'}`} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Network</p>
              <div className="flex items-center gap-1">
                <p className="text-sm font-semibold">{networkName}</p>
                {isSupported && (
                  <Badge variant="outline" className="h-4 px-1 text-[10px]">
                    Ready
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
