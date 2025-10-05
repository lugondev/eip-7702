'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { BATCH_TEMPLATES, prepareTemplate, type BatchTemplate } from '@/lib/batch-templates'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, CheckCircle, Info, Sparkles } from 'lucide-react'

/**
 * Component to browse and load preset batch templates
 * Helps users quickly try common batch transaction patterns
 */

interface BatchTemplatePickerProps {
  onSelectTemplate: (template: BatchTemplate) => void
}

export function BatchTemplatePicker({ onSelectTemplate }: BatchTemplatePickerProps) {
  const { address } = useAccount()
  const [open, setOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const handleSelectTemplate = (template: BatchTemplate) => {
    if (address) {
      const prepared = prepareTemplate(template, address)
      onSelectTemplate(prepared)
      setOpen(false)
    }
  }

  const filteredTemplates = selectedCategory === 'all' 
    ? BATCH_TEMPLATES 
    : BATCH_TEMPLATES.filter(t => t.category === selectedCategory)

  const categories = [
    { id: 'all', name: 'All Templates', icon: '📚' },
    { id: 'transfer', name: 'Transfers', icon: '💸' },
    { id: 'defi', name: 'DeFi', icon: '🔄' },
    { id: 'nft', name: 'NFTs', icon: '🎨' },
    { id: 'social', name: 'Social', icon: '🛡️' },
    { id: 'other', name: 'Other', icon: '🧪' },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Sparkles className="h-4 w-4 mr-2" />
          Load Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Batch Transaction Templates
          </DialogTitle>
          <DialogDescription>
            Select a pre-configured template to quickly try common batch patterns
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-6">
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                <span className="mr-1">{cat.icon}</span>
                <span className="hidden sm:inline">{cat.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-4 space-y-3">
            {filteredTemplates.map((template) => (
              <Card 
                key={template.id}
                className="cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => handleSelectTemplate(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{template.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {template.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <Badge variant="secondary" className="text-xs">
                        {template.calls.length} call{template.calls.length > 1 ? 's' : ''}
                      </Badge>
                      {template.estimatedGas && (
                        <Badge variant="outline" className="text-xs">
                          {template.estimatedGas}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Calls Preview */}
                  <div className="space-y-2 mb-3">
                    {template.calls.slice(0, 3).map((call, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-muted-foreground">{call.description}</span>
                      </div>
                    ))}
                    {template.calls.length > 3 && (
                      <p className="text-xs text-muted-foreground ml-5">
                        + {template.calls.length - 3} more call{template.calls.length - 3 > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Requirements */}
                  {template.requirements && template.requirements.length > 0 && (
                    <Alert className="py-2">
                      <Info className="h-3 w-3" />
                      <AlertDescription className="text-xs">
                        <strong>Requirements:</strong>{' '}
                        {template.requirements.join(', ')}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}

            {filteredTemplates.length === 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No templates found in this category
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Tabs>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>💡 Tip:</strong> Templates are pre-filled with example addresses and values. 
            You can modify them after loading or use them as-is for testing.
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  )
}
