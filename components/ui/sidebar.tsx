"use client";

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'
import { type Database } from '@/lib/supabase/types'

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

	useEffect(() => {
		if (!userId) return

		const fetchChats = async () => {
			try {
				const { data, error } = await supabase
					.from('chats')
					.select('*')
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

		// Subscribe to changes
		const channel = supabase
			.channel('chats')
			.on('postgres_changes', 
				{ 
					event: '*', 
					schema: 'public', 
					table: 'chats',
					filter: `user_id=eq.${userId}`
				}, 
				(payload) => {
					fetchChats()
				}
			)
			.subscribe()

		return () => {
			supabase.removeChannel(channel)
		}
	}, [userId, supabase])

	return (
		<div className="w-64 h-full bg-background border-r">
			{/* Sidebar content */}
		</div>
	)
}
