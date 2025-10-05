'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Search, Loader2, CheckCircle, XCircle, Clock, AlertCircle, ExternalLink, Eye } from 'lucide-react'
import { EnhancedResultViewer } from '@/components/enhanced-result-viewer'
import { useTransactionHistory } from '@/hooks/use-transaction-history'
import type { Address } from 'viem'

/**
 * Component to check batch transaction result by ID
 * Uses wallet_getCallsStatus from EIP-5792
 */

interface BatchCallResult {
  status: 'CONFIRMED' | 'PENDING' | 'FAILED'
  receipts?: Array<{
    logs: any[]
    status: string
    blockHash: string
    blockNumber: string
    gasUsed: string
    transactionHash: string
  }>
}

export function BatchResultChecker() {
  const { address } = useAccount()
  const { history } = useTransactionHistory()
  const [batchId, setBatchId] = useState('')
  const [result, setResult] = useState<BatchCallResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEnhanced, setShowEnhanced] = useState(false)

  const checkBatchStatus = async () => {
    if (!batchId.trim()) {
      setError('Please enter a batch ID')
      return
    }

    if (!window.ethereum) {
      setError('MetaMask not installed')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setResult(null)

      console.log('🔍 Checking batch status for ID:', batchId)

      const response = await window.ethereum.request({
        method: 'wallet_getCallsStatus',
        params: [batchId],
      })

      console.log('✅ Batch status response:', response)
      setResult(response as BatchCallResult)
    } catch (err: any) {
      console.error('❌ Failed to check batch status:', err)
      setError(err.message || 'Failed to check batch status')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getExplorerUrl = (txHash: string) => {
    // Sepolia testnet explorer
    return `https://sepolia.etherscan.io/tx/${txHash}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Check Batch Result</CardTitle>
        <CardDescription>
          Enter a batch ID to check the status and results of your batch transaction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="batchId">Batch ID</Label>
          <div className="flex gap-2">
            <Input
              id="batchId"
              type="text"
              placeholder="0x..."
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="font-mono text-sm"
              disabled={isLoading}
            />
            <Button 
              onClick={checkBatchStatus}
              disabled={isLoading || !batchId.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Check
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (() => {
          const record = history.find(r => r.id === batchId)
          
          // Show enhanced viewer if available and toggled
          if (record && showEnhanced) {
            return (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEnhanced(false)}
                  >
                    Show Basic View
                  </Button>
                </div>
                <EnhancedResultViewer
                  batchId={record.id}
                  status={record.status}
                  chainId={record.chainId}
                  calls={record.calls}
                  receipts={record.receipts}
                  error={record.error}
                  timestamp={record.timestamp}
                />
              </div>
            )
          }
          
          // Show basic view with enhanced toggle button
          return (
            <div className="space-y-4">
              {record && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEnhanced(true)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Show Enhanced View
                  </Button>
                </div>
              )}
              
            {/* Status Summary */}
            <Alert>
              <div className="flex items-center gap-3">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">Batch Status:</span>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {result.status === 'CONFIRMED' && 'All transactions in the batch have been confirmed on-chain'}
                    {result.status === 'PENDING' && 'Batch is pending confirmation on the blockchain'}
                    {result.status === 'FAILED' && 'Batch transaction failed - all calls were reverted'}
                  </p>
                </div>
              </div>
            </Alert>

            {/* Transaction Receipts */}
            {result.receipts && result.receipts.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold">Transaction Receipts ({result.receipts.length})</h4>
                {result.receipts.map((receipt, index) => (
                  <Card key={index} className="bg-gray-50">
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Transaction {index + 1}</span>
                          {receipt.status === '0x1' ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              Success
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Failed</Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground min-w-[100px]">Tx Hash:</span>
                            <div className="flex items-center gap-2 flex-1">
                              <code className="text-xs bg-white px-2 py-1 rounded border break-all">
                                {receipt.transactionHash}
                              </code>
                              <a
                                href={getExplorerUrl(receipt.transactionHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0"
                              >
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </a>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground min-w-[100px]">Block:</span>
                            <code className="text-xs bg-white px-2 py-1 rounded border">
                              {parseInt(receipt.blockNumber, 16)}
                            </code>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground min-w-[100px]">Gas Used:</span>
                            <code className="text-xs bg-white px-2 py-1 rounded border">
                              {parseInt(receipt.gasUsed, 16).toLocaleString()}
                            </code>
                          </div>
                          
                          {receipt.logs.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground min-w-[100px]">Events:</span>
                              <Badge variant="outline">{receipt.logs.length} logs</Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Raw Response (for debugging) */}
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground mb-2">
                View raw response
              </summary>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
          )
        })()}

        {/* Info */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>How to use:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Execute a batch transaction from the Batch tab</li>
              <li>Copy the batch ID from the success message</li>
              <li>Paste it here to check the status and results</li>
              <li>View individual transaction receipts and explorer links</li>
            </ol>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

declare global {
  interface Window {
    ethereum?: any
  }
}
