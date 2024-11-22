'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { GoogleLoginButton } from '@/components/custom/login-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase/client';

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
            router.push('/dashboard');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-teal-500 to-blue-500">
            <div className="standard-card p-8 rounded-lg shadow-md w-full max-w-sm">
                <h1 className="text-3xl font-bold text-center mb-6 text-white">Login</h1>
                <form onSubmit={handleLogin} className="flex flex-col space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            placeholder="m@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            type="email"
                            className="border p-2 rounded"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-white">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            type="password"
                            className="border p-2 rounded"
                        />
                    </div>
                    <Button type="submit" className="w-full bg-teal-500 text-white hover:bg-teal-600">
                        Login
                    </Button>
                </form>
                <div className="mt-4 text-center">
                    <span className="text-white">or</span>
                </div>
                <GoogleLoginButton />
                <div className="text-center text-sm">
                    Already have an account?{' '}
                    <Link className="underline" href="/register">
                        Register        
                    </Link>

                </div>  
            </div>
        </div>
    );
}
