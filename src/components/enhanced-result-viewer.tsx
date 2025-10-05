'use client'

import { useState } from 'react'
import { usePublicClient } from 'wagmi'
import { formatEther, type Address, type Hex } from 'viem'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Copy, 
  ChevronDown, 
  ChevronUp,
  Zap,
  FileText,
  Activity,
  Share2
} from 'lucide-react'
import { 
  decodeTransaction, 
  getTransactionType, 
  formatDecodedArgs,
  formatGasDisplay,
  type TransactionDetail 
} from '@/lib/transaction-decoder'

/**
 * Enhanced Result Viewer Component
 * Displays detailed transaction information with decoding
 */

interface EnhancedResultViewerProps {
  batchId: string
  status: 'pending' | 'confirmed' | 'failed'
  chainId: number
  calls: Array<{
    to: Address
    value: string
    data: string
  }>
  receipts?: Array<{
    transactionHash: string
    blockNumber: string
    gasUsed: string
    status: string
  }>
  error?: string
  timestamp: number
}

export function EnhancedResultViewer({ 
  batchId,
  status,
  chainId,
  calls,
  receipts,
  error,
  timestamp
}: EnhancedResultViewerProps) {
  const publicClient = usePublicClient()
  const [expandedCalls, setExpandedCalls] = useState<Set<number>>(new Set([0]))
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Decode all calls
  const decodedCalls: TransactionDetail[] = calls.map(call => 
    decodeTransaction({
      to: call.to,
      value: BigInt(call.value || '0'),
      data: call.data as Hex
    })
  )

  // Calculate total value
  const totalValue = calls.reduce((sum, call) => 
    sum + BigInt(call.value || '0'), BigInt(0)
  )

  // Get explorer URL
  const getExplorerUrl = (hash: string, type: 'tx' | 'address' = 'tx') => {
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io',
      11155111: 'https://sepolia.etherscan.io',
      137: 'https://polygonscan.com',
      42161: 'https://arbiscan.io',
    }
    const baseUrl = explorers[chainId] || 'https://etherscan.io'
    return `${baseUrl}/${type}/${hash}`
  }

  // Copy to clipboard
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Share transaction
  const shareTransaction = () => {
    const shareData = {
      title: `Batch Transaction ${batchId}`,
      text: `${calls.length} calls executed on chain ${chainId}`,
      url: receipts?.[0]?.transactionHash 
        ? getExplorerUrl(receipts[0].transactionHash)
        : window.location.href
    }

    if (navigator.share) {
      navigator.share(shareData)
    } else {
      copyToClipboard(JSON.stringify(shareData, null, 2), 'share')
    }
  }

  // Toggle call expansion
  const toggleCall = (index: number) => {
    setExpandedCalls(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  // Expand all
  const expandAll = () => {
    setExpandedCalls(new Set(calls.map((_, i) => i)))
  }

  // Collapse all
  const collapseAll = () => {
    setExpandedCalls(new Set())
  }

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {status === 'confirmed' && (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-600">Transaction Confirmed</span>
                </>
              )}
              {status === 'pending' && (
                <>
                  <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />
                  <span className="text-yellow-600">Transaction Pending</span>
                </>
              )}
              {status === 'failed' && (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-600">Transaction Failed</span>
                </>
              )}
            </CardTitle>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={shareTransaction}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Batch ID</div>
              <div className="font-mono text-sm flex items-center gap-2">
                {batchId.slice(0, 12)}...
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(batchId, 'batchId')}
                >
                  {copiedField === 'batchId' ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground">Total Calls</div>
              <div className="text-lg font-semibold">{calls.length}</div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground">Total Value</div>
              <div className="text-lg font-semibold">
                {formatEther(totalValue)} ETH
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground">Chain ID</div>
              <div className="text-lg font-semibold">{chainId}</div>
            </div>
          </div>

          {/* Transaction Hash */}
          {receipts && receipts.length > 0 && (
            <div className="space-y-2">
              {receipts.map((receipt, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="space-y-1 flex-1">
                    <div className="text-sm text-muted-foreground">Transaction Hash</div>
                    <div className="font-mono text-sm flex items-center gap-2">
                      {receipt.transactionHash.slice(0, 20)}...{receipt.transactionHash.slice(-18)}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(receipt.transactionHash, `hash-${idx}`)}
                      >
                        {copiedField === `hash-${idx}` ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(getExplorerUrl(receipt.transactionHash), '_blank')}
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Gas Information */}
          {receipts && receipts.length > 0 && (
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Zap className="h-4 w-4" />
                Gas Usage
              </div>
              {receipts.map((receipt, idx) => {
                const gasUsed = BigInt(receipt.gasUsed)
                const gasDisplay = formatGasDisplay(gasUsed)
                return (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {receipts.length > 1 ? `Call ${idx + 1}` : 'Total'}
                    </span>
                    <span className={`text-sm font-mono ${
                      gasDisplay.color === 'green' ? 'text-green-600' :
                      gasDisplay.color === 'yellow' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {gasDisplay.formatted} gas
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Timestamp */}
          <div className="text-sm text-muted-foreground">
            {new Date(timestamp).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Calls Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Call Details ({calls.length})
            </CardTitle>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={expandAll}
              >
                Expand All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={collapseAll}
              >
                Collapse All
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {decodedCalls.map((call, index) => {
            const isExpanded = expandedCalls.has(index)
            const txType = getTransactionType(call)
            
            return (
              <div
                key={index}
                className="border rounded-lg overflow-hidden"
              >
                {/* Call Header */}
                <button
                  onClick={() => toggleCall(index)}
                  className="w-full px-4 py-3 bg-muted hover:bg-muted/80 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background font-semibold text-sm">
                      {index + 1}
                    </div>
                    
                    <div className="text-left">
                      <div className="font-medium flex items-center gap-2">
                        {call.decoded?.name || 'Contract Call'}
                        <Badge variant="secondary" className="text-xs">
                          {txType}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {call.to.slice(0, 10)}...{call.to.slice(-8)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {call.value > BigInt(0) && (
                      <span className="text-sm font-semibold text-primary">
                        {formatEther(call.value)} ETH
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </button>

                {/* Call Details */}
                {isExpanded && (
                  <div className="p-4 space-y-3 bg-background">
                    {/* To Address */}
                    <div>
                      <div className="text-sm font-medium mb-1">To Address</div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded flex-1 font-mono">
                          {call.to}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(getExplorerUrl(call.to, 'address'), '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Function Signature */}
                    {call.decoded && (
                      <div>
                        <div className="text-sm font-medium mb-1">Function</div>
                        <code className="text-xs bg-muted px-2 py-1 rounded block font-mono">
                          {call.decoded.signature}
                        </code>
                      </div>
                    )}

                    {/* Arguments */}
                    {call.decoded && Object.keys(call.decoded.args).length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-1">Arguments</div>
                        <pre className="text-xs bg-muted px-3 py-2 rounded overflow-x-auto font-mono">
                          {formatDecodedArgs(call.decoded.args)}
                        </pre>
                      </div>
                    )}

                    {/* Value */}
                    {call.value > BigInt(0) && (
                      <div>
                        <div className="text-sm font-medium mb-1">Value</div>
                        <div className="text-sm">
                          {formatEther(call.value)} ETH
                          <span className="text-muted-foreground ml-2">
                            ({call.value.toString()} wei)
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Raw Data */}
                    <div>
                      <div className="text-sm font-medium mb-1">Raw Data</div>
                      <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto font-mono">
                        {call.data}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Visual Timeline */}
      {receipts && receipts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Execution Timeline
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {/* Transaction Submitted */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <div className="w-0.5 h-full bg-blue-500/20" />
                </div>
                <div className="pb-4">
                  <div className="font-medium">Transaction Submitted</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Transaction Confirmed */}
              {status === 'confirmed' && receipts[0] && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div>
                    <div className="font-medium text-green-600">Transaction Confirmed</div>
                    <div className="text-sm text-muted-foreground">
                      Block #{receipts[0].blockNumber}
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction Failed */}
              {status === 'failed' && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                  </div>
                  <div>
                    <div className="font-medium text-red-600">Transaction Failed</div>
                    <div className="text-sm text-muted-foreground">
                      {error || 'Unknown error'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
