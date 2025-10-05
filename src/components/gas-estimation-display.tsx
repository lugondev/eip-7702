'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Fuel, TrendingDown, Info, AlertCircle } from 'lucide-react'
import type { GasEstimate } from '@/hooks/use-gas-estimation'

/**
 * Component to display gas estimation results
 * Shows per-call estimates, total cost, and savings vs sequential execution
 */

interface GasEstimationDisplayProps {
  estimate: GasEstimate
  callCount: number
}

export function GasEstimationDisplay({ estimate, callCount }: GasEstimationDisplayProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Fuel className="h-5 w-5" />
          Gas Estimation
          <Badge variant="secondary" className="ml-auto">
            {callCount} call{callCount > 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cost Summary */}
        <div className="grid grid-cols-2 gap-4">
          {/* Batch Cost */}
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-muted-foreground mb-1">Batch Transaction</p>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-blue-600">
                {estimate.totalEth.substring(0, 8)} ETH
              </p>
              <p className="text-xs text-muted-foreground">
                {estimate.total.toLocaleString()} gas
              </p>
            </div>
          </div>

          {/* Sequential Cost */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-muted-foreground mb-1">Sequential (if separate)</p>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-600">
                {estimate.sequentialEth.substring(0, 8)} ETH
              </p>
              <p className="text-xs text-muted-foreground">
                {estimate.sequential.toLocaleString()} gas
              </p>
            </div>
          </div>
        </div>

        {/* Savings Highlight */}
        {estimate.savings > BigInt(0) && (
          <Alert className="bg-green-50 border-green-200">
            <TrendingDown className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-900">
                    💰 Save {estimate.savingsPercent}% with batch!
                  </p>
                  <p className="text-sm text-green-700">
                    You save {estimate.savingsEth.substring(0, 8)} ETH compared to sequential transactions
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  -{estimate.savingsPercent}%
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Per-Call Breakdown */}
        {estimate.perCall.length > 1 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">Per-Call Gas Estimates:</p>
            <div className="grid gap-2">
              {estimate.perCall.map((gas, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between bg-white p-3 rounded border text-sm"
                >
                  <span className="text-muted-foreground">Call {index + 1}</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {gas.toLocaleString()} gas
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>About Gas Savings:</strong>
            <ul className="mt-1 space-y-0.5 ml-4 list-disc">
              <li>Batch saves ~25% gas vs sequential transactions</li>
              <li>Single transaction overhead instead of multiple</li>
              <li>Shared authorization cost across calls</li>
              <li>Actual gas may vary slightly on execution</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Warning for High Gas */}
        {estimate.total > BigInt(1000000) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>⚠️ High Gas Warning:</strong> This batch will use a lot of gas. 
              Consider splitting into smaller batches or optimizing calls.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
