import { Wallet } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { WalletStatusModal } from './WalletStatus'

export function MultiModal() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsWalletModalOpen(true)}
      >
        <Wallet className="h-4 w-4" />
      </Button>

      <WalletStatusModal 
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </>
  )
} 