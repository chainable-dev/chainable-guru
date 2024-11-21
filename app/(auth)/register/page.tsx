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

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Check your email to confirm your account');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Google registration error:', error);
      toast.error('Failed to register with Google');
    } else {
      toast.success('Redirecting to Google for registration...');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center py-10 bg-gradient-to-r from-teal-500 to-blue-500">
      <div className="standard-card w-full max-w-sm space-y-6 p-8 rounded-lg shadow-md">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-white">Register</h1>
          <p className="text-white">
            Enter your information to create an account
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              name="email"
              placeholder="m@example.com"
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
              required
              type="password"
              className="border p-2 rounded"
            />
          </div>
          <Button className="w-full bg-teal-500 text-white hover:bg-teal-600" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Register'}
          </Button>
        </form>
        <Button onClick={handleGoogleRegister} className="w-full bg-blue-500 text-white hover:bg-blue-600">
          {isLoading ? 'Loading...' : 'Register with Google'}
        </Button>
        <div className="text-center text-sm text-white">
          Already have an account?{' '}
          <Link className="underline" href="/login">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
