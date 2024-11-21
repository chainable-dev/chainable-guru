'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';

export function GoogleLoginButton() {
    const router = useRouter();

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            console.error('Google login error:', error);
            toast.error('Failed to log in with Google');
        } else {
            toast.success('Redirecting to Google for login...');
        }
    };

    return (
        <Button variant="ghost" onClick={handleGoogleLogin} className="bg-blue-500 text-white hover:bg-blue-600">
            Login with Google
        </Button>
    );
}