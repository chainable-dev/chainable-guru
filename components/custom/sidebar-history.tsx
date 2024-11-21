'use client';

import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/types';

type Chat = Database['public']['Tables']['chats']['Row'];

const fetcher = async (): Promise<Chat[]> => {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        console.error('Auth error:', userError);
        return [];
    }

    const { data: chats, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (chatsError) {
        console.error('Chats fetch error:', chatsError);
        return [];
    }

    return chats || [];
};

export function SidebarHistory({ user }: { user: User | undefined }) {
    const { data: history, isLoading } = useSWR<Chat[]>(user ? ['chats', user.id] : null, fetcher, {
        fallbackData: [],
        refreshInterval: 5000,
    });

    if (!user) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-300">
                <p>Login to save and revisit previous chats!</p>
            </div>
        );
    }

    if (isLoading) {
        return <div className="text-center">Loading...</div>;
    }

    if (history?.length === 0) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-300">
                <p>Your conversations will appear here once you start chatting!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {history.map((chat) => (
                <div key={chat.id} className="p-4 border rounded-lg shadow dark:bg-gray-800">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">{chat.title || 'New Chat'}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{new Date(chat.created_at).toLocaleString()}</p>
                </div>
            ))}
        </div>
    );
}
