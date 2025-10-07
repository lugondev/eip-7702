'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Code, AlertCircle, CheckCircle, ChevronRight } from 'lucide-react'
import { encodeFunctionData } from 'viem'

/**
 * ABI Encoder Modal Component
 * Step 1: Paste ABI JSON
 * Step 2: Select function
 * Step 3: Fill form with inputs
 * Step 4: Generate call data
 */

interface ABIEncoderModalProps {
  onGenerate: (data: string) => void
}

interface ABIFunction {
  name: string
  type: string
  inputs: Array<{
    name: string
    type: string
    components?: any[]
  }>
  outputs?: any[]
  stateMutability?: string
}

export function ABIEncoderModal({ onGenerate }: ABIEncoderModalProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [abiJson, setAbiJson] = useState('')
  const [parsedAbi, setParsedAbi] = useState<ABIFunction[]>([])
  const [selectedFunction, setSelectedFunction] = useState<ABIFunction | null>(null)
  const [functionArgs, setFunctionArgs] = useState<Record<string, string>>({})
  const [generatedData, setGeneratedData] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleParseAbi = () => {
    try {
      setError(null)
      const parsed = JSON.parse(abiJson)
      
      let functions: ABIFunction[] = []
      if (Array.isArray(parsed)) {
        functions = parsed.filter((item: any) => item.type === 'function')
      } else if (parsed.type === 'function') {
        functions = [parsed]
      } else if (parsed.abi && Array.isArray(parsed.abi)) {
        functions = parsed.abi.filter((item: any) => item.type === 'function')
      }

      if (functions.length === 0) {
        throw new Error('No functions found in ABI')
      }

      setParsedAbi(functions)
      setStep(2)
    } catch (err) {
      console.error('Failed to parse ABI:', err)
      setError(err instanceof Error ? err.message : 'Invalid ABI JSON format')
    }
  }

  const handleSelectFunction = (fn: ABIFunction) => {
    setSelectedFunction(fn)
    // Initialize args object
    const initialArgs: Record<string, string> = {}
    fn.inputs.forEach((input) => {
      initialArgs[input.name || `arg${fn.inputs.indexOf(input)}`] = ''
    })
    setFunctionArgs(initialArgs)
    setStep(3)
    setError(null)
  }

  const handleUpdateArg = (name: string, value: string) => {
    setFunctionArgs(prev => ({ ...prev, [name]: value }))
  }

  const handleGenerate = () => {
    try {
      setError(null)
      setGeneratedData(null)

      if (!selectedFunction) {
        throw new Error('No function selected')
      }

      // Convert args object to array based on input order
      const argsArray = selectedFunction.inputs.map((input) => {
        const name = input.name || `arg${selectedFunction.inputs.indexOf(input)}`
        const value = functionArgs[name]
        
        // Type conversion
        if (input.type.startsWith('uint') || input.type.startsWith('int')) {
          return value ? BigInt(value) : BigInt(0)
        } else if (input.type === 'bool') {
          return value === 'true' || value === '1'
        } else if (input.type.startsWith('bytes')) {
          return value || '0x'
        }
        return value || ''
      })

      // Encode function data
      const encoded = encodeFunctionData({
        abi: parsedAbi,
        functionName: selectedFunction.name,
        args: argsArray,
      })

      setGeneratedData(encoded)
    } catch (err) {
      console.error('Failed to encode:', err)
      setError(err instanceof Error ? err.message : 'Failed to encode data')
    }
  }

  const handleReset = () => {
    setStep(1)
    setAbiJson('')
    setParsedAbi([])
    setSelectedFunction(null)
    setFunctionArgs({})
    setGeneratedData(null)
    setError(null)
  }

  const handleApply = () => {
    if (generatedData) {
      onGenerate(generatedData)
      setOpen(false)
      handleReset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" type="button">
          <Code className="h-4 w-4 mr-2" />
          Generate from ABI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            ABI Encoder - Step {step} of 3
          </DialogTitle>
          <DialogDescription>
            {step === 1 && 'Paste your contract ABI JSON'}
            {step === 2 && 'Select a function to encode'}
            {step === 3 && 'Fill in the function parameters'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1: Parse ABI */}
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="abi-json">Contract ABI (JSON)</Label>
                <textarea
                  id="abi-json"
                  className="w-full min-h-[300px] px-3 py-2 text-sm border rounded-md font-mono"
                  placeholder='[
  {
    "name": "transfer",
    "type": "function",
    "inputs": [
      {"name": "to", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "outputs": [{"type": "bool"}],
    "stateMutability": "nonpayable"
  },
  {
    "name": "approve",
    "type": "function",
    "inputs": [
      {"name": "spender", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ]
  }
]'
                  value={abiJson}
                  onChange={(e) => setAbiJson(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Paste the full contract ABI or just the function definitions
                </p>
              </div>

              <Button onClick={handleParseAbi} className="w-full">
                <ChevronRight className="h-4 w-4 mr-2" />
                Parse ABI & Continue
              </Button>
            </>
          )}

          {/* Step 2: Select Function */}
          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>Select Function ({parsedAbi.length} found)</Label>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {parsedAbi.map((fn, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3"
                      onClick={() => handleSelectFunction(fn)}
                    >
                      <div className="flex flex-col items-start gap-1 w-full">
                        <div className="font-mono font-semibold">{fn.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {fn.inputs.length} parameter{fn.inputs.length !== 1 ? 's' : ''}
                          {fn.stateMutability && ` · ${fn.stateMutability}`}
                        </div>
                        {fn.inputs.length > 0 && (
                          <div className="text-xs font-mono text-muted-foreground mt-1">
                            ({fn.inputs.map(i => `${i.type} ${i.name}`).join(', ')})
                          </div>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <Button variant="outline" onClick={() => setStep(1)} className="w-full">
                Back to ABI Input
              </Button>
            </>
          )}

          {/* Step 3: Fill Parameters */}
          {step === 3 && selectedFunction && (
            <>
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded-md">
                  <p className="font-mono font-semibold">{selectedFunction.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedFunction.inputs.length} parameter{selectedFunction.inputs.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {selectedFunction.inputs.length > 0 ? (
                  <>
                    <Label>Function Parameters</Label>
                    {selectedFunction.inputs.map((input, index) => {
                      const paramName = input.name || `arg${index}`
                      return (
                        <div key={index} className="space-y-2">
                          <Label htmlFor={`param-${index}`}>
                            {paramName}
                            <span className="ml-2 text-xs text-muted-foreground font-mono">
                              ({input.type})
                            </span>
                          </Label>
                          <Input
                            id={`param-${index}`}
                            type="text"
                            placeholder={
                              input.type === 'address' 
                                ? '0x...' 
                                : input.type.includes('uint') || input.type.includes('int')
                                ? '0'
                                : input.type === 'bool'
                                ? 'true or false'
                                : input.type.startsWith('bytes')
                                ? '0x...'
                                : 'value'
                            }
                            value={functionArgs[paramName] || ''}
                            onChange={(e) => handleUpdateArg(paramName, e.target.value)}
                            className="font-mono"
                          />
                        </div>
                      )
                    })}
                  </>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      This function has no parameters
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back to Functions
                  </Button>
                  <Button onClick={handleGenerate} className="flex-1">
                    Generate Call Data
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Generated Data Display */}
          {generatedData && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-800">
                    Call Data Generated Successfully
                  </p>
                  <div className="bg-white p-2 rounded border max-h-[100px] overflow-y-auto">
                    <code className="text-xs break-all font-mono">
                      {generatedData}
                    </code>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleReset} className="flex-1">
                      Start Over
                    </Button>
                    <Button onClick={handleApply} className="flex-1">
                      Apply to Call Data
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
