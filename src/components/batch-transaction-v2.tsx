'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useBatchCalls, type BatchCall } from '@/hooks/use-batch-calls'
import { useDelegationStatus } from '@/hooks/use-delegation-status'
import { useGasEstimation } from '@/hooks/use-gas-estimation'
import { useTransactionHistory } from '@/hooks/use-transaction-history'
import { GasEstimationDisplay } from '@/components/gas-estimation-display'
import { BatchTemplatePicker } from '@/components/batch-template-picker'
import type { BatchTemplate } from '@/lib/batch-templates'
import { parseEther } from 'viem'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Minus, Send, AlertCircle, CheckCircle, Loader2, Info, Shield, Fuel } from 'lucide-react'
import type { Address, Hex } from 'viem'

/**
 * Modern Batch Transaction Component
 * Uses wagmi/experimental useSendCalls (ERC-5792)
 * MetaMask will automatically prompt to upgrade EOA to smart account
 */

interface CallForm {
  to: string
  value: string
  data: string
}

const STATELESS_DELEGATOR_ADDRESS = (
  process.env.NEXT_PUBLIC_STATELESS_DELEGATOR_ADDRESS || 
  '0x63c0c19a282a1b52b07dd5a65b58948a07dae32b'
) as Address

export function BatchTransactionV2() {
  const { address } = useAccount()
  const {
    isLoading,
    error,
    executeBatchCalls,
    isConnected,
    chainId,
  } = useBatchCalls()

  const { isDelegated, isChecking: isCheckingDelegation } = useDelegationStatus(STATELESS_DELEGATOR_ADDRESS)
  
  const { 
    isEstimating, 
    estimate, 
    error: estimateError,
    estimateGas,
    clearEstimate 
  } = useGasEstimation()

  const { addRecord, updateRecord } = useTransactionHistory()

  const [calls, setCalls] = useState<CallForm[]>([
    { to: '', value: '0', data: '0x' }
  ])
  const [showEstimate, setShowEstimate] = useState(false)
  const [loadedTemplate, setLoadedTemplate] = useState<string | null>(null)

  const handleLoadTemplate = (template: BatchTemplate) => {
    setCalls(template.calls.map(call => ({
      to: call.to,
      value: call.value,
      data: call.data
    })))
    setLoadedTemplate(template.name)
    clearEstimate()
    setShowEstimate(false)
  }

  const addCall = () => {
    setCalls([...calls, { to: '', value: '0', data: '0x' }])
  }

  const removeCall = (index: number) => {
    if (calls.length > 1) {
      setCalls(calls.filter((_, i) => i !== index))
    }
  }

  const updateCall = (index: number, field: keyof CallForm, value: string) => {
    const newCalls = [...calls]
    newCalls[index][field] = value
    setCalls(newCalls)
    // Clear estimate when calls change
    if (estimate) {
      clearEstimate()
      setShowEstimate(false)
    }
  }

  // Auto-estimate when calls are ready
  useEffect(() => {
    const autoEstimate = async () => {
      if (!showEstimate || !isConnected) return
      
      const validCalls: BatchCall[] = calls
        .filter(call => call.to && call.to.length > 2)
        .map(call => ({
          to: call.to as Address,
          data: (call.data || '0x') as Hex,
          value: call.value ? parseEther(call.value) : BigInt(0),
        }))

      if (validCalls.length > 0) {
        try {
          await estimateGas(validCalls)
        } catch (err) {
          console.error('Auto estimate failed:', err)
        }
      }
    }

    autoEstimate()
  }, [showEstimate, isConnected])

  const handleEstimate = async () => {
    const validCalls: BatchCall[] = calls
      .filter(call => call.to && call.to.length > 2)
      .map(call => ({
        to: call.to as Address,
        data: (call.data || '0x') as Hex,
        value: call.value ? parseEther(call.value) : BigInt(0),
      }))

    if (validCalls.length === 0) {
      alert('Please add at least one valid call')
      return
    }

    try {
      await estimateGas(validCalls)
      setShowEstimate(true)
    } catch (err) {
      console.error('Estimation failed:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Validate and convert calls
      const validCalls: BatchCall[] = calls
        .filter(call => call.to && call.to.length > 2)
        .map(call => ({
          to: call.to as Address,
          data: (call.data || '0x') as Hex,
          value: call.value ? parseEther(call.value) : BigInt(0),
        }))

      if (validCalls.length === 0) {
        alert('Please add at least one valid call')
        return
      }

      console.log('🚀 Submitting batch calls:', validCalls)
      
      // Create transaction record
      const txId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      if (!address) {
        alert('Wallet not connected')
        return
      }
      
      addRecord({
        id: txId,
        chainId: chainId || 1,
        from: address,
        calls: validCalls.map(call => ({
          to: call.to,
          value: call.value?.toString() || '0',
          data: call.data || '0x'
        })),
        status: 'pending',
        gasEstimate: estimate ? {
          total: estimate.total.toString(),
          totalEth: estimate.totalEth,
          savings: estimate.savingsEth
        } : undefined,
        template: loadedTemplate || undefined
      })
      
      try {
        const result = await executeBatchCalls(validCalls)
        
        // Update status on success
        if (result) {
          updateRecord(txId, {
            status: 'confirmed',
            receipts: [{
              transactionHash: typeof result === 'string' ? result : JSON.stringify(result),
              blockNumber: '0', // Will be updated when confirmed
              gasUsed: '0',
              status: '1'
            }]
          })
        }
      } catch (execError) {
        // Update status on failure
        updateRecord(txId, {
          status: 'failed',
          error: execError instanceof Error ? execError.message : 'Transaction failed'
        })
        throw execError
      }
      
      // Success will be shown via isSuccess state
    } catch (err) {
      console.error('❌ Batch execution failed:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* EIP-7702 Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>EIP-7702 Batch Transactions</strong>
          <br />
          Batch transactions will be executed via <code>wallet_sendCalls</code>. Requires MetaMask with EIP-7702 support.
        </AlertDescription>
      </Alert>

      {/* Delegation Required Warning */}
      {isConnected && !isCheckingDelegation && isDelegated === false && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <Shield className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>⚠️ Account not delegated</strong>
            <br />
            When you execute a batch transaction for the first time, MetaMask will prompt to delegate your EOA to a smart account. 
            The batch transaction will then be executed.
          </AlertDescription>
        </Alert>
      )}

      {/* Template Picker */}
      <div className="flex items-center gap-2">
        <BatchTemplatePicker onSelectTemplate={handleLoadTemplate} />
        {loadedTemplate && (
          <Alert className="flex-1 py-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm">
              <strong>Loaded:</strong> {loadedTemplate}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {calls.map((call, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Call {index + 1}</CardTitle>
                {calls.length > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeCall(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor={`to-${index}`}>To Address</Label>
                <Input
                  id={`to-${index}`}
                  type="text"
                  placeholder="0x..."
                  value={call.to}
                  onChange={(e) => updateCall(index, 'to', e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor={`value-${index}`}>Value (ETH)</Label>
                <Input
                  id={`value-${index}`}
                  type="text"
                  placeholder="0.0"
                  value={call.value}
                  onChange={(e) => updateCall(index, 'value', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor={`data-${index}`}>Call Data (optional)</Label>
                <Input
                  id={`data-${index}`}
                  type="text"
                  placeholder="0x"
                  value={call.data}
                  onChange={(e) => updateCall(index, 'data', e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={addCall}>
            <Plus className="h-4 w-4 mr-2" />
            Add Call
          </Button>

          <Button 
            type="button" 
            variant="outline"
            onClick={handleEstimate}
            disabled={isEstimating || !isConnected}
          >
            {isEstimating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Estimating...
              </>
            ) : (
              <>
                <Fuel className="h-4 w-4 mr-2" />
                Estimate Gas
              </>
            )}
          </Button>
          
          <Button 
            type="submit" 
            disabled={isLoading || !isConnected} 
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending Batch...
              </>
            ) : isDelegated === false ? (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Delegate & Execute Batch ({calls.length} calls)
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Execute Batch ({calls.length} calls)
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Gas Estimation Display */}
      {estimate && showEstimate && !isEstimating && (
        <GasEstimationDisplay estimate={estimate} callCount={calls.filter(c => c.to).length} />
      )}

      {/* Estimation Error */}
      {estimateError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Gas Estimation Failed:</strong> {estimateError}
          </AlertDescription>
        </Alert>
      )}

      {/* Success message will be shown in transaction history */}

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>How it works:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
            <li>MetaMask detects batch transaction request</li>
            <li>Prompts user to upgrade EOA to smart account (one-time)</li>
            <li>Executes all calls atomically (all succeed or all fail)</li>
            <li>Returns batch ID for tracking</li>
          </ol>
          <p className="mt-2 text-sm text-muted-foreground">
            📚 Using <code>useSendCalls</code> from wagmi/experimental (ERC-5792)
          </p>
        </AlertDescription>
      </Alert>

      {/* Security Warning */}
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>⚠️ Security Warning:</strong>
          <br />
          Upgrading to smart account delegates your EOA to MetaMask's contract. 
          Only approve if you trust MetaMask. Your private key retains ultimate control 
          and can revoke delegation anytime.
        </AlertDescription>
      </Alert>
    </div>
  )
}
