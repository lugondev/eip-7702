'use client'

import { useState } from 'react'
import { useDelegationStatus } from '@/hooks/use-delegation-status'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Loader2, Shield, ShieldOff, RefreshCw } from 'lucide-react'
import type { Address } from 'viem'

interface DelegationStatusProps {
  implementationAddress: Address
}

export function DelegationStatus({ implementationAddress }: DelegationStatusProps) {
  const {
    isDelegated,
    delegatedTo,
    isChecking,
    isDelegatedToTarget,
    checkDelegation,
    revokeDelegation,
  } = useDelegationStatus(implementationAddress)

  const [isRevoking, setIsRevoking] = useState(false)
  const [revokeError, setRevokeError] = useState<string | null>(null)
  const [revokeSuccess, setRevokeSuccess] = useState(false)

  const handleRevoke = async () => {
    try {
      setIsRevoking(true)
      setRevokeError(null)
      setRevokeSuccess(false)
      
      await revokeDelegation()
      
      setRevokeSuccess(true)
      
      // Recheck after a delay
      setTimeout(() => {
        checkDelegation()
        setRevokeSuccess(false)
      }, 3000)
    } catch (error: any) {
      setRevokeError(error.message || 'Failed to revoke delegation')
    } finally {
      setIsRevoking(false)
    }
  }

  const handleRefresh = () => {
    setRevokeError(null)
    setRevokeSuccess(false)
    checkDelegation()
  }

  // Show initial state if haven't checked yet
  if (isDelegated === null && !isChecking) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-400" />
            Delegation Status
          </CardTitle>
          <CardDescription>
            Check if account has been delegated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRefresh} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Delegation Status
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isChecking) {
    return (
      <Alert>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription>
          Checking delegation status...
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isDelegated ? (
                <>
                  <Shield className="h-5 w-5 text-green-600" />
                  Delegation Active
                </>
              ) : (
                <>
                  <ShieldOff className="h-5 w-5 text-gray-400" />
                  No Delegation
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isDelegated 
                ? 'Account has been delegated to smart contract'
                : 'Account is in normal EOA state'
              }
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isChecking}
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          {isDelegated ? (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Delegated
            </Badge>
          ) : (
            <Badge variant="secondary">
              <XCircle className="h-3 w-3 mr-1" />
              Not Delegated
            </Badge>
          )}
        </div>

        {/* Delegated To Address */}
        {isDelegated && delegatedTo && (
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Delegated to:</span>
              <div className="mt-1 p-2 bg-gray-50 rounded font-mono text-xs break-all">
                {delegatedTo}
              </div>
            </div>
            
            {/* Check if delegated to expected implementation */}
            {isDelegatedToTarget ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  ✅ Delegated to correct implementation contract
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  ⚠️ Delegation does not match expected implementation
                  <div className="mt-2 text-xs">
                    Expected: {implementationAddress}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2">
          {isDelegated ? (
            <div className="space-y-2">
              <Alert variant="destructive">
                <ShieldOff className="h-4 w-4" />
                <AlertDescription>
                  <strong>⚠️ Revoke not yet supported</strong>
                  <br />
                  MetaMask does not currently support revoking delegation directly. This feature will be available in a future version.
                  <div className="mt-2 text-xs">
                    <strong>Workaround:</strong> You can create a new account or wait for MetaMask update.
                  </div>
                </AlertDescription>
              </Alert>
              <Button
                variant="outline"
                onClick={handleRevoke}
                disabled={true}
                className="w-full opacity-50 cursor-not-allowed"
              >
                <ShieldOff className="h-4 w-4 mr-2" />
                Revoke Delegation (Coming Soon)
              </Button>
            </div>
          ) : (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Not delegated</strong>
                <br />
                When you execute a batch transaction, MetaMask will automatically prompt to delegate your account.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Success Message */}
        {revokeSuccess && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✅ Delegation revoked successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {revokeError && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {revokeError}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
