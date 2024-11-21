'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';

export function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Logout error:', error);
            toast.error('Failed to log out');
        } else {
            document.cookie = 'sb:token=; Max-Age=0; path=/;';
            document.cookie = 'sb:refresh_token=; Max-Age=0; path=/;';
            toast.success('Logged out successfully');
            router.push('/login');
        }
    };

    return (
        <Button variant="ghost" onClick={handleLogout} className="bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500">
            Logout
        </Button>
    );
}
