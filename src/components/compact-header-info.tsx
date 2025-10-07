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
    <Card className="border">
      <CardContent className="p-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Account */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded">
              <Wallet className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground">Account</p>
              <div className="flex items-center gap-0.5">
                <p className="text-xs font-mono font-semibold">{formatAddress(address)}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4"
                  onClick={() => copyToClipboard(address)}
                >
                  {copiedAddress ? <Check className="h-2.5 w-2.5 text-green-600" /> : <Copy className="h-2.5 w-2.5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 rounded">
              <Fuel className="h-3.5 w-3.5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground">Balance</p>
              <p className="text-xs font-semibold">{formatBalance(balance)} ETH</p>
            </div>
          </div>

          {/* Delegator */}
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded ${isDelegated ? 'bg-purple-100' : 'bg-gray-100'}`}>
              <Shield className={`h-3.5 w-3.5 ${isDelegated ? 'text-purple-600' : 'text-gray-400'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground">Delegator</p>
              <div className="flex items-center gap-0.5">
                <p className="text-xs font-mono font-semibold truncate">{formatAddress(delegatorAddress)}</p>
                {isDelegated && (
                  <CheckCircle2 className="h-2.5 w-2.5 text-green-600 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>

          {/* Network */}
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded ${isSupported ? 'bg-indigo-100' : 'bg-red-100'}`}>
              <Network className={`h-3.5 w-3.5 ${isSupported ? 'text-indigo-600' : 'text-red-600'}`} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground">Network</p>
              <div className="flex items-center gap-0.5">
                <p className="text-xs font-semibold">{networkName}</p>
                {isSupported && (
                  <Badge variant="outline" className="h-3.5 px-1 text-[9px]">
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
