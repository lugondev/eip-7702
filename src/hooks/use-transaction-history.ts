'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  getTransactionHistory, 
  addTransactionRecord,
  updateTransactionRecord,
  deleteTransaction,
  clearTransactionHistory,
  exportHistory,
  importHistory,
  getHistoryStats,
  type BatchTransactionRecord 
} from '@/lib/transaction-history'

/**
 * Hook for managing batch transaction history
 * Provides CRUD operations and statistics
 */

export function useTransactionHistory() {
  const [history, setHistory] = useState<BatchTransactionRecord[]>([])
  const [stats, setStats] = useState(getHistoryStats())
  const [isLoading, setIsLoading] = useState(true)

  // Load history on mount
  const loadHistory = useCallback(() => {
    setIsLoading(true)
    try {
      const records = getTransactionHistory()
      setHistory(records)
      setStats(getHistoryStats())
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  // Add new record
  const addRecord = useCallback((record: Omit<BatchTransactionRecord, 'timestamp'>) => {
    addTransactionRecord(record)
    loadHistory()
  }, [loadHistory])

  // Update record
  const updateRecord = useCallback((id: string, updates: Partial<BatchTransactionRecord>) => {
    updateTransactionRecord(id, updates)
    loadHistory()
  }, [loadHistory])

  // Delete record
  const deleteRecord = useCallback((id: string) => {
    deleteTransaction(id)
    loadHistory()
  }, [loadHistory])

  // Clear all
  const clearAll = useCallback(() => {
    clearTransactionHistory()
    loadHistory()
  }, [loadHistory])

  // Export
  const exportToJson = useCallback(() => {
    return exportHistory()
  }, [])

  // Import
  const importFromJson = useCallback((json: string) => {
    const success = importHistory(json)
    if (success) {
      loadHistory()
    }
    return success
  }, [loadHistory])

  // Refresh (for polling)
  const refresh = useCallback(() => {
    loadHistory()
  }, [loadHistory])

  return {
    // Data
    history,
    stats,
    isLoading,
    
    // Actions
    addRecord,
    updateRecord,
    deleteRecord,
    clearAll,
    exportToJson,
    importFromJson,
    refresh,
  }
}
