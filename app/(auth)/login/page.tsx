"use client";

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function LoginPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const router = useRouter()
	const supabase = createClient()

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)

		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			})

			if (error) {
				throw error
			}

			if (data?.user) {
				toast.success('Logged in successfully')
				router.push('/')
				router.refresh()
			}
		} catch (error) {
			toast.error('Login failed. Please check your credentials.')
			console.error('Login error:', error)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center py-2">
			<div className="w-full max-w-md space-y-8 rounded-lg border p-8 shadow-lg">
				<div className="space-y-2 text-center">
					<h1 className="text-3xl font-bold">Login</h1>
					<p className="text-gray-500 dark:text-gray-400">
						Enter your credentials to access your account
					</p>
				</div>
				<form onSubmit={handleLogin} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="you@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>
					<Button
						className="w-full"
						type="submit"
						disabled={loading}
					>
						{loading ? 'Logging in...' : 'Login'}
					</Button>
				</form>
			</div>
		</div>
	)
}
