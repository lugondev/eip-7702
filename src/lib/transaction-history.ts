import type { Address } from 'viem'

/**
 * Transaction history types and storage utilities
 * Stores batch transaction history in localStorage
 */

export interface BatchTransactionRecord {
  id: string // Batch ID from wallet_sendCalls
  timestamp: number
  status: 'pending' | 'confirmed' | 'failed'
  chainId: number
  from: Address
  calls: Array<{
    to: Address
    value: string
    data: string
    description?: string
  }>
  receipts?: Array<{
    transactionHash: string
    blockNumber: string
    gasUsed: string
    status: string
  }>
  gasEstimate?: {
    total: string
    totalEth: string
    savings: string
  }
  template?: string // Template name if loaded from template
  notes?: string
  error?: string
}

const STORAGE_KEY = 'eip7702-batch-history'
const MAX_RECORDS = 100 // Keep last 100 transactions

/**
 * Get all transaction history
 */
export function getTransactionHistory(): BatchTransactionRecord[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const history = JSON.parse(stored) as BatchTransactionRecord[]
    // Sort by timestamp descending (newest first)
    return history.sort((a, b) => b.timestamp - a.timestamp)
  } catch (error) {
    console.error('Failed to load transaction history:', error)
    return []
  }
}

/**
 * Add new transaction to history
 */
export function addTransactionRecord(record: Omit<BatchTransactionRecord, 'timestamp'>): void {
  if (typeof window === 'undefined') return
  
  try {
    const history = getTransactionHistory()
    
    const newRecord: BatchTransactionRecord = {
      ...record,
      timestamp: Date.now(),
    }
    
    // Add to beginning
    history.unshift(newRecord)
    
    // Keep only last MAX_RECORDS
    const trimmed = history.slice(0, MAX_RECORDS)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch (error) {
    console.error('Failed to save transaction record:', error)
  }
}

/**
 * Update existing transaction record
 */
export function updateTransactionRecord(
  id: string, 
  updates: Partial<BatchTransactionRecord>
): void {
  if (typeof window === 'undefined') return
  
  try {
    const history = getTransactionHistory()
    const index = history.findIndex(r => r.id === id)
    
    if (index !== -1) {
      history[index] = {
        ...history[index],
        ...updates,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    }
  } catch (error) {
    console.error('Failed to update transaction record:', error)
  }
}

/**
 * Get transaction by ID
 */
export function getTransactionById(id: string): BatchTransactionRecord | null {
  const history = getTransactionHistory()
  return history.find(r => r.id === id) || null
}

/**
 * Delete transaction from history
 */
export function deleteTransaction(id: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const history = getTransactionHistory()
    const filtered = history.filter(r => r.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Failed to delete transaction:', error)
  }
}

/**
 * Clear all history
 */
export function clearTransactionHistory(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear history:', error)
  }
}

/**
 * Export history as JSON
 */
export function exportHistory(): string {
  const history = getTransactionHistory()
  return JSON.stringify(history, null, 2)
}

/**
 * Import history from JSON
 */
export function importHistory(json: string): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const imported = JSON.parse(json) as BatchTransactionRecord[]
    
    // Validate structure
    if (!Array.isArray(imported)) {
      throw new Error('Invalid format: not an array')
    }
    
    // Merge with existing history
    const existing = getTransactionHistory()
    const merged = [...imported, ...existing]
    
    // Remove duplicates by ID
    const unique = merged.reduce((acc, record) => {
      if (!acc.find(r => r.id === record.id)) {
        acc.push(record)
      }
      return acc
    }, [] as BatchTransactionRecord[])
    
    // Sort and trim
    const sorted = unique.sort((a, b) => b.timestamp - a.timestamp)
    const trimmed = sorted.slice(0, MAX_RECORDS)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
    return true
  } catch (error) {
    console.error('Failed to import history:', error)
    return false
  }
}

/**
 * Get statistics
 */
export function getHistoryStats() {
  const history = getTransactionHistory()
  
  return {
    total: history.length,
    confirmed: history.filter(r => r.status === 'confirmed').length,
    pending: history.filter(r => r.status === 'pending').length,
    failed: history.filter(r => r.status === 'failed').length,
    totalCalls: history.reduce((sum, r) => sum + r.calls.length, 0),
    oldestTimestamp: history.length > 0 ? history[history.length - 1].timestamp : null,
    newestTimestamp: history.length > 0 ? history[0].timestamp : null,
  }
}
