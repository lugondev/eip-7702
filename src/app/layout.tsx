import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EIP-7702 Tool',
  description: 'Account Abstraction Tool for EIP-7702 - Batch transactions, session keys, and paymaster integration',
  keywords: ['EIP-7702', 'Account Abstraction', 'Ethereum', 'Smart Wallet', 'Batch Transactions'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}