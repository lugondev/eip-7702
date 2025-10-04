import {
  Delegation,
  MetaMaskSmartAccount,
  createExecution,
  ExecutionMode,
  createDelegation,
} from '@metamask/delegation-toolkit'
import { createCaveatBuilder } from '@metamask/delegation-toolkit/utils'
import { DelegationManager } from '@metamask/delegation-toolkit/contracts'
import { Address, Hex, zeroAddress } from 'viem'

export function prepareRootDelegation(delegator: MetaMaskSmartAccount, delegate: Address): Delegation {
  // Create a caveat builder and add limitedCalls caveat
  // This limits the number of executions the delegate can perform
  const caveats = createCaveatBuilder(delegator.environment).addCaveat('limitedCalls', { limit: 1 })

  return createDelegation({
    environment: delegator.environment,
    scope: {
      type: 'functionCall',
      targets: [zeroAddress], // Allow calling zero address (dummy transaction)
      selectors: [],
    },
    to: delegate as `0x${string}`,
    from: delegator.address as `0x${string}`,
    caveats,
  })
}

export function prepareRedeemDelegationData(delegation: Delegation): Hex {
  // Create a dummy execution (send nothing to zero address)
  const execution = createExecution({ target: zeroAddress })
  
  // Encode the redeem delegation call
  const data = DelegationManager.encode.redeemDelegations({
    delegations: [[delegation]],
    modes: [ExecutionMode.SingleDefault],
    executions: [[execution]],
  })

  return data
}
