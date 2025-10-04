import { Card } from '@/components/ui/card'

interface AddressCardProps {
  address: string | undefined
  title: string
  description: string
  fallbackText: string
}

export function AddressCard({ address, title, description, fallbackText }: AddressCardProps) {
  return (
    <Card className="p-6 flex flex-col space-y-4">
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <div className="text-sm text-muted-foreground">{description}</div>
      <div className="flex-1"></div>
      {address ? (
        <div className="bg-secondary rounded-lg p-3">
          <div className="font-mono text-xs break-all">{address}</div>
        </div>
      ) : (
        <div className="bg-secondary rounded-lg p-3 text-muted-foreground text-sm italic">{fallbackText}</div>
      )}
    </Card>
  )
}
