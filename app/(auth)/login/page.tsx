'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase/client';
import { GoogleLoginButton } from '@/components/custom/login-button';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Login error:', error.message);
            toast.error('Failed to log in');
        } else {
            toast.success('Logged in successfully');
            router.push('/dashboard'); // Redirect to the dashboard or home page
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md w-full max-w-sm">
                <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">Login</h1>
                <form onSubmit={handleLogin} className="flex flex-col space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            placeholder="m@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            type="email"
                            className="border p-2 rounded dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            type="password"
                            className="border p-2 rounded dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                        />
                    </div>
                    <Button type="submit" className="w-full bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-600">
                        Login
                    </Button>
                </form>
                <div className="mt-4 text-center">
                    <span className="text-gray-600 dark:text-gray-400">or</span>
                </div>
                <GoogleLoginButton />
            </div>
        </div>
    );
}
