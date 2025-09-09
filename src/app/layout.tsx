import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import { NetworkProvider } from '@/contexts/NetworkContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Broadstreet Campaign Dashboard',
  description: 'Manage your Broadstreet advertising campaigns',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NetworkProvider>
          <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 p-8">
              {children}
            </main>
          </div>
        </NetworkProvider>
      </body>
    </html>
  )
}
