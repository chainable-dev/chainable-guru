import { Suspense } from 'react'
import { WalletStatus } from '@/components/wallet/wallet-status'

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <WalletStatus />
    </Suspense>
  )
} 