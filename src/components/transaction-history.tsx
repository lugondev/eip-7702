'use client'

import { useState } from 'react'
import { useTransactionHistory } from '@/hooks/use-transaction-history'
import { EnhancedResultViewer } from '@/components/enhanced-result-viewer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  History, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  BarChart3,
  AlertCircle,
  Copy,
  Check,
  Eye,
  ArrowLeft
} from 'lucide-react'
import type { BatchTransactionRecord } from '@/lib/transaction-history'

/**
 * Component to view and manage batch transaction history
 * Shows past transactions, allows re-execution, export/import
 */

export function TransactionHistory() {
  const { 
    history, 
    stats, 
    isLoading, 
    deleteRecord, 
    clearAll, 
    exportToJson,
    importFromJson,
    refresh 
  } = useTransactionHistory()

  const [searchQuery, setSearchQuery] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [importJson, setImportJson] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [viewingRecord, setViewingRecord] = useState<BatchTransactionRecord | null>(null)

  // Filter history by search
  const filteredHistory = history.filter(record => 
    record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.template?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.calls.some(call => call.to.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleExport = () => {
    const json = exportToJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `eip7702-history-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    try {
      const success = importFromJson(importJson)
      if (success) {
        alert('✅ History imported successfully!')
        setShowImport(false)
        setImportJson('')
      } else {
        alert('❌ Failed to import. Check JSON format.')
      }
    } catch (error) {
      alert('❌ Invalid JSON format')
    }
  }

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all transaction history?')) {
      clearAll()
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getExplorerUrl = (txHash: string) => {
    return `https://sepolia.etherscan.io/tx/${txHash}`
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading history...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show enhanced view if viewing a record
  if (viewingRecord) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => setViewingRecord(null)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Button>
        <EnhancedResultViewer
          batchId={viewingRecord.id}
          status={viewingRecord.status}
          chainId={viewingRecord.chainId}
          calls={viewingRecord.calls}
          receipts={viewingRecord.receipts}
          error={viewingRecord.error}
          timestamp={viewingRecord.timestamp}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Transaction History
              </CardTitle>
              <CardDescription>
                View and manage your batch transaction history
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={refresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Confirmed</span>
              </div>
              <p className="text-2xl font-bold text-green-700">{stats.confirmed}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Pending</span>
              </div>
              <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-900">Failed</span>
              </div>
              <p className="text-2xl font-bold text-red-700">{stats.failed}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowImport(!showImport)}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            {history.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearAll} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {/* Import Dialog */}
          {showImport && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50 space-y-3">
              <h4 className="font-semibold">Import History</h4>
              <Input
                placeholder="Paste JSON here..."
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                className="font-mono text-xs"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleImport}>
                  Import
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowImport(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search */}
      {history.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by batch ID, template, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {searchQuery ? 'No transactions match your search.' : 'No transaction history yet. Execute a batch transaction to see it here.'}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((record) => (
            <Card key={record.id} className="hover:border-blue-300 transition-colors">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(record.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">
                            {record.template ? `${record.template}` : 'Custom Batch'}
                          </p>
                          {getStatusBadge(record.status)}
                          <Badge variant="outline" className="text-xs">
                            {record.calls.length} call{record.calls.length > 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(record.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingRecord(record)}
                        className="text-blue-600"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRecord(record.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Batch ID */}
                  <div className="bg-gray-50 p-2 rounded border">
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-xs break-all flex-1">{record.id}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(record.id, record.id)}
                        className="h-6 w-6 p-0"
                      >
                        {copiedId === record.id ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Calls Preview */}
                  <div className="space-y-1">
                    {record.calls.slice(0, 2).map((call, index) => (
                      <div key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                        <CheckCircle className="h-3 w-3" />
                        <span className="truncate">
                          {call.description || `${call.to.substring(0, 10)}...`}
                        </span>
                        {call.value !== '0' && (
                          <Badge variant="outline" className="text-xs">
                            {call.value} ETH
                          </Badge>
                        )}
                      </div>
                    ))}
                    {record.calls.length > 2 && (
                      <p className="text-xs text-muted-foreground ml-5">
                        + {record.calls.length - 2} more
                      </p>
                    )}
                  </div>

                  {/* Receipts/Links */}
                  {record.receipts && record.receipts.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {record.receipts.map((receipt, index) => (
                        <a
                          key={index}
                          href={getExplorerUrl(receipt.transactionHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          Tx {index + 1}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Gas Info */}
                  {record.gasEstimate && (
                    <div className="text-xs text-muted-foreground">
                      <span>Gas: {record.gasEstimate.totalEth.substring(0, 8)} ETH</span>
                      {record.gasEstimate.savings && (
                        <span className="ml-2 text-green-600">
                          (Saved {record.gasEstimate.savings})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Error */}
                  {record.error && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-3 w-3" />
                      <AlertDescription className="text-xs">
                        {record.error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Notes */}
                  {record.notes && (
                    <p className="text-xs text-muted-foreground italic">
                      Note: {record.notes}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
