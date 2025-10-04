'use client'

import { useState, useEffect } from 'react'
import { useBatchCalls, type BatchCall } from '@/hooks/use-batch-calls'
import { useDelegationStatus } from '@/hooks/use-delegation-status'
import { encodeFunctionData, parseEther } from 'viem'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Minus, Send, AlertCircle, CheckCircle, Loader2, Info, Shield } from 'lucide-react'
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
  const {
    lastResult,
    isSupported,
    isLoading,
    isSuccess,
    error,
    executeBatchCalls,
    checkSupport,
    isConnected,
    chainId,
  } = useBatchCalls()

  const { isDelegated, isChecking: isCheckingDelegation } = useDelegationStatus(STATELESS_DELEGATOR_ADDRESS)

  const [calls, setCalls] = useState<CallForm[]>([
    { to: '', value: '0', data: '0x' }
  ])

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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Check support first if haven't checked yet
      if (isSupported === null) {
        console.log('🔍 Checking wallet support first...')
        const supported = await checkSupport()
        if (!supported) {
          return // checkSupport will set error state
        }
      }
      
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
      await executeBatchCalls(validCalls)
      
      // Success will be shown via isSuccess state
    } catch (err) {
      console.error('❌ Batch execution failed:', err)
    }
  }

  // Example calls for testing
  const loadExampleCalls = () => {
    // Example: Send 0.0001 ETH to two EOA addresses
    // ⚠️ Make sure these are real EOA wallets, NOT delegated EIP-7702 accounts!
    // ⚠️ data MUST be '0x' (empty) for EOA transfers, not '0x00'!
    setCalls([
      {
        to: '0x32d19F868559AC212555B41C0Eb35FB2EECD7877', // Example EOA #1
        value: '0.0001',
        data: '0x',
      },
      {
        to: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', // Example EOA #2
        value: '0.0001',
        data: '0x',
      },
    ])
  }

  return (
    <div className="space-y-6">
      {/* Support Status - only show after checking */}
      {isConnected && isSupported !== null && (
        <Alert>
          {isSupported === true ? (
            <>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>✅ Wallet supports EIP-7702!</strong>
                <br />
                Batch transactions will be executed via <code>wallet_sendCalls</code>.
              </AlertDescription>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>⚠️ Wallet does not support EIP-7702</strong>
                <br />
                Requires latest MetaMask version with EIP-7702 support.
              </AlertDescription>
            </>
          )}
        </Alert>
      )}

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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Batch Calls</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={loadExampleCalls}
          >
            <Info className="h-4 w-4 mr-2" />
            Load Example
          </Button>
        </div>

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
            type="submit" 
            disabled={isLoading || !isConnected || isSupported === false} 
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

      {/* Success */}
      {isSuccess && lastResult && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold text-green-900">✅ Batch transaction submitted!</p>
              <div className="space-y-1">
                <p className="text-sm text-green-800">
                  <strong>Batch ID:</strong>
                </p>
                <code className="block text-xs bg-white px-3 py-2 rounded border border-green-300 break-all font-mono">
                  {typeof lastResult === 'string' ? lastResult : JSON.stringify(lastResult)}
                </code>
                <p className="text-xs text-green-700 mt-2">
                  💡 Copy this Batch ID to check the transaction status and results
                </p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

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
