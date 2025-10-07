'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useBatchCalls, type BatchCall } from '@/hooks/use-batch-calls'
import { useDelegationStatus } from '@/hooks/use-delegation-status'
import { useGasEstimation } from '@/hooks/use-gas-estimation'
import { useTransactionHistory } from '@/hooks/use-transaction-history'
import { GasEstimationDisplay } from '@/components/gas-estimation-display'
import { BatchTemplatePicker } from '@/components/batch-template-picker'
import { ABIEncoderModal } from '@/components/abi-encoder-modal'
import type { BatchTemplate } from '@/lib/batch-templates'
import { parseEther, formatEther } from 'viem'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Plus, Minus, Send, AlertCircle, CheckCircle, Loader2, Info, Shield, Fuel, ArrowLeftRight, Download, Edit } from 'lucide-react'
import type { Address, Hex } from 'viem'

/**
 * Enhanced Batch Transaction Component with:
 * - Template/Manual/API input modes
 * - ETH <-> Wei conversion
 * - Gas estimation
 * - Transaction history
 */

interface CallForm {
  to: string
  value: string
  data: string
  unit: 'eth' | 'wei' // Each call has its own unit
}

type InputMode = 'manual' | 'template'

const STATELESS_DELEGATOR_ADDRESS = (
  process.env.NEXT_PUBLIC_STATELESS_DELEGATOR_ADDRESS || 
  '0x63c0c19a282a1b52b07dd5a65b58948a07dae32b'
) as Address

export function BatchTransactionEnhanced() {
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
    { to: '', value: '0', data: '0x', unit: 'eth' }
  ])
  const [showEstimate, setShowEstimate] = useState(false)
  const [loadedTemplate, setLoadedTemplate] = useState<string | null>(null)
  const [inputMode, setInputMode] = useState<InputMode>('manual')

  const handleLoadTemplate = (template: BatchTemplate) => {
    setCalls(template.calls.map(call => ({
      to: call.to === 'SELF' && address ? address : call.to,
      value: call.value,
      data: call.data,
      unit: 'eth' as const
    })))
    setLoadedTemplate(template.name)
    setInputMode('template')
    clearEstimate()
    setShowEstimate(false)
  }

  const convertValue = (value: string, fromUnit: 'eth' | 'wei', toUnit: 'eth' | 'wei'): string => {
    if (fromUnit === toUnit || !value) return value
    
    try {
      if (fromUnit === 'eth' && toUnit === 'wei') {
        return parseEther(value).toString()
      } else if (fromUnit === 'wei' && toUnit === 'eth') {
        const wei = BigInt(value)
        return formatEther(wei)
      }
    } catch (err) {
      console.error('Conversion error:', err)
      return value
    }
    return value
  }

  const toggleCallUnit = (index: number) => {
    const call = calls[index]
    const newUnit = call.unit === 'eth' ? 'wei' : 'eth'
    const convertedValue = convertValue(call.value, call.unit, newUnit)
    
    const newCalls = [...calls]
    newCalls[index] = { ...call, value: convertedValue, unit: newUnit }
    setCalls(newCalls)
  }

  const addCall = () => {
    setCalls([...calls, { to: '', value: '0', data: '0x', unit: 'eth' }])
  }

  const removeCall = (index: number) => {
    if (calls.length > 1) {
      setCalls(calls.filter((_, i) => i !== index))
    }
  }

  const updateCall = (index: number, field: 'to' | 'value' | 'data', value: string) => {
    const newCalls = [...calls]
    newCalls[index][field] = value
    setCalls(newCalls)
    // Clear estimate when calls change
    if (estimate) {
      clearEstimate()
      setShowEstimate(false)
    }
  }

  const handleEstimate = async () => {
    const validCalls: BatchCall[] = calls
      .filter(call => call.to && call.to.length > 2)
      .map(call => ({
        to: call.to as Address,
        data: (call.data || '0x') as Hex,
        value: call.unit === 'eth' ? parseEther(call.value || '0') : BigInt(call.value || '0'),
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
          value: call.unit === 'eth' ? parseEther(call.value || '0') : BigInt(call.value || '0'),
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
              blockNumber: '0',
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
    } catch (err) {
      console.error('❌ Batch execution failed:', err)
    }
  }

  return (
    <div className="space-y-3">
      {/* EIP-7702 Info */}
      <Alert className="py-2">
        <Info className="h-3.5 w-3.5" />
        <AlertDescription className="text-xs">
          <strong>EIP-7702 Batch Transactions</strong> - Executed via <code className="text-xs">wallet_sendCalls</code>
        </AlertDescription>
      </Alert>

      {/* Input Mode Selection */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <span>Input Mode</span>
            <Badge variant="outline" className="text-xs">{inputMode}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as InputMode)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">
                <Edit className="h-4 w-4 mr-2" />
                Manual
              </TabsTrigger>
              <TabsTrigger value="template">
                <Download className="h-4 w-4 mr-2" />
                Template
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Manually enter transaction calls
              </p>
            </TabsContent>

            <TabsContent value="template" className="space-y-2">
              <BatchTemplatePicker onSelectTemplate={handleLoadTemplate} />
              {loadedTemplate && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-sm text-green-800">
                    <strong>Loaded:</strong> {loadedTemplate}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        {calls.map((call, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Call {index + 1}</CardTitle>
                {calls.length > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => removeCall(index)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <div>
                <Label htmlFor={`to-${index}`} className="text-xs">To Address</Label>
                <Input
                  id={`to-${index}`}
                  type="text"
                  placeholder="0x..."
                  value={call.to}
                  onChange={(e) => updateCall(index, 'to', e.target.value)}
                  className="font-mono text-xs h-8"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor={`value-${index}`} className="text-xs">
                    Value ({call.unit.toUpperCase()})
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => toggleCallUnit(index)}
                  >
                    <ArrowLeftRight className="h-2.5 w-2.5 mr-1" />
                    <span className="text-[10px]">Switch to {call.unit === 'eth' ? 'Wei' : 'ETH'}</span>
                  </Button>
                </div>
                <Input
                  id={`value-${index}`}
                  type="text"
                  placeholder={call.unit === 'eth' ? '0.0' : '0'}
                  value={call.value}
                  onChange={(e) => updateCall(index, 'value', e.target.value)}
                  className="h-8"
                />
                {call.value && call.value !== '0' && (
                  <div className="mt-1 px-1.5 py-0.5 bg-muted rounded">
                    <p className="text-[10px] text-muted-foreground">
                      {call.unit === 'eth' ? (
                        <>
                          ≈ <span className="font-mono">{(() => {
                            try {
                              return parseEther(call.value).toString()
                            } catch {
                              return 'Invalid value'
                            }
                          })()}</span> Wei
                        </>
                      ) : (
                        <>
                          ≈ <span className="font-mono">{(() => {
                            try {
                              return formatEther(BigInt(call.value))
                            } catch {
                              return 'Invalid value'
                            }
                          })()}</span> ETH
                        </>
                      )}
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor={`data-${index}`} className="text-xs">Call Data (optional)</Label>
                  <ABIEncoderModal onGenerate={(data) => updateCall(index, 'data', data)} />
                </div>
                <Input
                  id={`data-${index}`}
                  type="text"
                  placeholder="0x"
                  value={call.data}
                  onChange={(e) => updateCall(index, 'data', e.target.value)}
                  className="font-mono text-xs h-8"
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex gap-1.5">
          <Button type="button" variant="outline" onClick={addCall} size="sm" className="h-8">
            <Plus className="h-3 w-3 mr-1" />
            <span className="text-xs">Add</span>
          </Button>

          <Button 
            type="button" 
            variant="outline"
            size="sm"
            className="h-8"
            onClick={handleEstimate}
            disabled={isEstimating || !isConnected}
          >
            {isEstimating ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                <span className="text-xs">Estimating...</span>
              </>
            ) : (
              <>
                <Fuel className="h-3 w-3 mr-1" />
                <span className="text-xs">Estimate</span>
              </>
            )}
          </Button>
          
          <Button 
            type="submit" 
            disabled={isLoading || !isConnected} 
            size="sm"
            className="flex-1 h-8"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                <span className="text-xs">Sending...</span>
              </>
            ) : (
              <>
                <Send className="h-3 w-3 mr-1" />
                <span className="text-xs">Execute ({calls.filter(c => c.to).length})</span>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Gas Estimation Display */}
      {estimate && showEstimate && !isEstimating && (
        <GasEstimationDisplay estimate={estimate} callCount={calls.filter(c => c.to).length} />
      )}

      {/* Errors */}
      {estimateError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Gas Estimation Failed:</strong> {estimateError}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error:</strong> {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
