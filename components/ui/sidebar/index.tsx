'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'
import { type Database } from '@/lib/supabase/types'
import { useSidebar } from '@/hooks/use-sidebar'
import { cn } from '@/lib/utils'

interface Chat {
  id: string
  title: string
  created_at: string
}

export function Sidebar({ defaultCollapsed = false }) {
  const [chats, setChats] = useState<Chat[]>([])
  const pathname = usePathname()
  const { userId } = useAuth()
  const supabase = createClientComponentClient<Database>()
  const { isOpen, width, isResizing } = useSidebar()

  useEffect(() => {
    if (!userId) {
      setChats([])
      return
    }

    const fetchChats = async () => {
      try {
        const { data, error } = await supabase
          .from('chats')
          .select('id, title, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error
        setChats(data || [])
      } catch (error) {
        console.error('Error fetching chats:', error)
        toast.error('Failed to load chat history')
      }
    }

    fetchChats()

    const channel = supabase
      .channel('chats')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'chats',
          filter: `user_id=eq.${userId}`
        }, 
        () => {
          fetchChats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  return (
    <aside
      className={cn(
        'relative h-full bg-background border-r transition-all duration-300 ease-in-out',
        isResizing && 'select-none',
        !isOpen && 'w-0'
      )}
      style={{ width: isOpen ? width : 0 }}
    >
      <div className="h-full overflow-auto">
        {chats.length > 0 ? (
          <ul className="space-y-2 p-4">
            {chats.map(chat => (
              <li key={chat.id}>
                {chat.title}
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-muted-foreground">
            {userId ? 'No chats yet' : 'Sign in to view chats'}
          </div>
        )}
      </div>
    </aside>
  )
}

export { useSidebar } 