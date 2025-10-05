'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ShieldOff, Loader2, CheckCircle, XCircle, AlertTriangle, ExternalLink, Info, Copy } from 'lucide-react'
import { useRevokeDelegation } from '@/hooks/use-revoke-delegation'
import { useDelegationStatus } from '@/hooks/use-delegation-status'
import type { Address } from 'viem'

interface RevokeDelegationButtonProps {
  implementationAddress?: Address
  variant?: 'default' | 'destructive' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showStatus?: boolean
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function RevokeDelegationButton({
  implementationAddress,
  variant = 'destructive',
  size = 'default',
  showStatus = true,
  onSuccess,
  onError,
}: RevokeDelegationButtonProps) {
  const {
    isRevoking,
    revokeError,
    revokeSuccess,
    txHash,
    revokeDelegation,
    address,
  } = useRevokeDelegation()

  const {
    isDelegated,
    delegatedTo,
    isChecking,
    checkDelegation,
  } = useDelegationStatus(implementationAddress)

  const [showManualGuide, setShowManualGuide] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)

  // Auto-check delegation status on mount
  useEffect(() => {
    if (address) {
      console.log('🔍 Auto-checking delegation status for:', address)
      checkDelegation()
    }
  }, [address, checkDelegation])

  // Auto-open manual guide on error
  useEffect(() => {
    if (revokeError) {
      setShowManualGuide(true)
    }
  }, [revokeError])

  const handleRevoke = async () => {
    try {
      const hash = await revokeDelegation()
      console.log('✅ Revoke successful:', hash)
      
      // Recheck delegation status after revoke
      setTimeout(() => {
        checkDelegation()
      }, 2000)
      
      onSuccess?.()
    } catch (error: any) {
      console.error('❌ Revoke failed:', error)
      onError?.(error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 2000)
  }

  // Show loading state
  if (isChecking) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Checking Status...
      </Button>
    )
  }

  // Only show the button if delegated
  if (!isDelegated) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Current Delegation Status Display */}
      {showStatus && isDelegated && delegatedTo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Current Delegation Status
            </CardTitle>
            <CardDescription>
              Your account is delegated to a smart contract
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Delegated Address:
              </div>
              <div className="p-2 bg-muted rounded font-mono text-xs break-all flex items-center justify-between gap-2">
                <span>{delegatedTo}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(delegatedTo)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {implementationAddress && delegatedTo.toLowerCase() === implementationAddress.toLowerCase() && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Correct Implementation
              </Badge>
            )}
          </CardContent>
        </Card>
      )}

      {/* Revoke Actions */}
      <div className="space-y-2">
        <Button
          variant={variant}
          size={size}
          onClick={handleRevoke}
          disabled={isRevoking}
          className="w-full"
        >
          {isRevoking ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Revoking Delegation...
            </>
          ) : (
            <>
              <ShieldOff className="h-4 w-4 mr-2" />
              Revoke Delegation
            </>
          )}
        </Button>

        {/* Manual Guide Dialog - Only show when delegation is active */}
        <Dialog open={showManualGuide} onOpenChange={setShowManualGuide}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Info className="h-4 w-4 mr-2" />
              Manual Revoke Instructions
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>EIP-7702 Delegation Revoke Guide</DialogTitle>
              <DialogDescription>
                Alternative methods to revoke delegation when automatic revoke fails
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 text-sm">
              {/* Error Context */}
              {revokeError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    <div className="font-semibold mb-1">Automatic revoke failed</div>
                    <div className="whitespace-pre-wrap opacity-90">{revokeError}</div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Current Account Info */}
              {address && (
                <div className="border rounded-lg p-4 space-y-2 bg-muted/50">
                  <h3 className="font-semibold">Current Account Information</h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-medium">Your Address:</span>
                      <div className="font-mono mt-1 break-all flex items-center justify-between gap-2">
                        <span>{address}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(address)}
                        >
                          {copiedAddress ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                    {delegatedTo && (
                      <div>
                        <span className="font-medium">Delegated To:</span>
                        <div className="font-mono mt-1 break-all">{delegatedTo}</div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-2">
                      <Badge variant={isDelegated ? "default" : "secondary"}>
                        {isDelegated ? '🔐 Delegated' : '🔓 Not Delegated'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Method 1: MetaMask UI - Recommended */}
              <div className="border-2 border-primary/50 rounded-lg p-4 space-y-3 bg-primary/5">
                <div className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">1</span>
                  <div className="space-y-2 flex-1">
                    <h3 className="font-semibold text-base">
                      MetaMask UI (Recommended)
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      The easiest and most reliable method. No coding required.
                    </p>
                  </div>
                </div>
                <ol className="list-decimal list-inside space-y-2 ml-9 text-muted-foreground">
                  <li>Open your MetaMask extension</li>
                  <li>Click on your account avatar or the three dots menu</li>
                  <li>Select "Account details"</li>
                  <li>Look for "Delegation" or "Smart Account" section</li>
                  <li>Click "Switch to EOA" or "Revert to EOA" button</li>
                  <li>Confirm the transaction (requires small gas fee)</li>
                </ol>
                <Alert className="mt-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-xs">
                    After successful revoke, the delegated address will show as "0x0000...0000" (Null) on block explorers.
                  </AlertDescription>
                </Alert>
              </div>

              {/* Method 2: Send Any Transaction */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-secondary text-secondary-foreground text-sm font-bold flex-shrink-0">2</span>
                  <div className="space-y-2 flex-1">
                    <h3 className="font-semibold text-base">
                      Send Empty Transaction
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Alternative fallback method using standard transaction.
                    </p>
                  </div>
                </div>
                <div className="ml-9 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Send a transaction to yourself with empty authorization list:
                  </p>
                  <div className="bg-muted p-3 rounded space-y-2 text-xs">
                    <div>
                      <div className="font-medium">To:</div>
                      <code className="break-all">{address || 'Your own address'}</code>
                    </div>
                    <div>
                      <div className="font-medium">Value:</div>
                      <code>0 ETH</code>
                    </div>
                    <div>
                      <div className="font-medium">Data:</div>
                      <code>0x (empty)</code>
                    </div>
                    <div>
                      <div className="font-medium">Authorization List:</div>
                      <code>[] (empty array)</code>
                    </div>
                  </div>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      This sends a standard transaction which clears the delegation automatically.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              {/* Method 3: Code Integration */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-secondary text-secondary-foreground text-sm font-bold flex-shrink-0">3</span>
                  <div className="space-y-2 flex-1">
                    <h3 className="font-semibold text-base">
                      Use Hook in Your Code
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      For developers: integrate the revoke hook in your application.
                    </p>
                  </div>
                </div>
                <div className="ml-9 space-y-2">
                  <div className="bg-muted p-3 rounded font-mono text-xs overflow-x-auto">
                    <pre>{`import { useRevokeDelegation } from '@/hooks/use-revoke-delegation'

function RevokeComponent() {
  const { 
    revokeDelegation, 
    isRevoking,
    revokeSuccess,
    revokeError 
  } = useRevokeDelegation()
  
  const handleRevoke = async () => {
    try {
      const txHash = await revokeDelegation()
      console.log('Revoked:', txHash)
    } catch (error) {
      console.error('Failed:', error)
    }
  }
  
  return (
    <button 
      onClick={handleRevoke} 
      disabled={isRevoking}
    >
      {isRevoking ? 'Revoking...' : 'Revoke'}
    </button>
  )
}`}</pre>
                  </div>
                </div>
              </div>

              {/* Method 4: Advanced - Manual EIP-7702 Transaction */}
              <div className="border rounded-lg p-4 space-y-3 opacity-75">
                <div className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-secondary text-secondary-foreground text-sm font-bold flex-shrink-0">4</span>
                  <div className="space-y-2 flex-1">
                    <h3 className="font-semibold text-base">
                      Manual EIP-7702 Transaction (Advanced)
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      For advanced users: manually construct EIP-7702 transaction.
                    </p>
                  </div>
                </div>
                <div className="ml-9 space-y-2">
                  <div className="bg-muted p-3 rounded space-y-2 text-xs">
                    <div>
                      <div className="font-medium">Transaction Type:</div>
                      <code>0x04 (EIP-7702 SET_CODE_TX)</code>
                    </div>
                    <div>
                      <div className="font-medium">Authorization List:</div>
                      <code className="break-all block mt-1">
                        {`[{
  chainId: 11155111, // Sepolia
  address: "0x0000000000000000000000000000000000000000",
  nonce: 0 // or your current nonce
}]`}
                      </code>
                    </div>
                    <div>
                      <div className="font-medium">To:</div>
                      <code>{address || 'YOUR_ADDRESS'}</code>
                    </div>
                    <div>
                      <div className="font-medium">Value:</div>
                      <code>0</code>
                    </div>
                  </div>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Requires custom tooling or scripts to construct type 0x04 transactions. Not recommended unless you know what you're doing.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              {/* Help Links */}
              <div className="border-t pt-4 space-y-2">
                <h3 className="font-semibold text-sm">Additional Resources</h3>
                <div className="space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => window.open('https://eips.ethereum.org/EIPS/eip-7702', '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    EIP-7702 Specification
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => window.open(`https://sepolia.etherscan.io/address/${address}`, '_blank')}
                    disabled={!address}
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    View Your Account on Etherscan
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Success Message */}
      {revokeSuccess && txHash && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="space-y-2">
              <div className="font-semibold">✅ Delegation Successfully Revoked!</div>
              <div className="text-xs">Your account has been reverted to EOA (Externally Owned Account)</div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Etherscan
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => checkDelegation()}
                >
                  Verify Status
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message with Fallback Options */}
      {revokeError && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3">
              <div>
                <div className="font-semibold mb-1">Failed to Revoke Delegation</div>
                <div className="text-xs whitespace-pre-wrap opacity-90">{revokeError}</div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowManualGuide(true)}
                  className="flex-1"
                >
                  <Info className="h-4 w-4 mr-2" />
                  View Manual Instructions
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRevoke}
                  disabled={isRevoking}
                  className="flex-1"
                >
                  {isRevoking ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    'Try Again'
                  )}
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
