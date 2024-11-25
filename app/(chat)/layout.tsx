import { currentUser } from "@clerk/nextjs/server";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Sidebar } from "@/components/ui/sidebar";
import { Database } from '@/lib/supabase/types';
import { cache } from 'react';

// Create cached Supabase client to avoid type issues
const createClient = cache(() => {
	const cookieStore = cookies();
	return createServerComponentClient<Database>({
		cookies: () => cookieStore,
	});
});

export default async function ChatLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	try {
		// Get Clerk user
		const user = await currentUser();
		if (!user) {
			redirect('/login');
		}

		// Get Supabase client
		const supabase = createClient();

		// Get user settings with fallback
		const { data: settings } = await supabase
			.from('user_settings')
			.select('sidebar_collapsed')
			.single();

		return (
			<div className="relative flex h-[calc(100vh-theme(spacing.16))] overflow-hidden">
				<Sidebar defaultCollapsed={Boolean(settings?.sidebar_collapsed)} />
				<main className="flex-1 overflow-auto">
					{children}
				</main>
			</div>
		);
	} catch (error) {
		console.error('Layout error:', error);
		// Fallback layout without settings
		return (
			<div className="relative flex h-[calc(100vh-theme(spacing.16))] overflow-hidden">
				<Sidebar defaultCollapsed={false} />
				<main className="flex-1 overflow-auto">
					{children}
				</main>
			</div>
		);
	}
}
