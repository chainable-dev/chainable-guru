import { currentUser } from "@clerk/nextjs/server";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Sidebar } from "@/components/ui/sidebar";

export default async function ChatLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Get Clerk user
	const user = await currentUser();
	if (!user) {
		redirect('/login');
	}

	// Get Supabase client with proper cookie handling
	const cookieStore = cookies();
	const supabase = createServerComponentClient({ cookies: () => cookieStore });

	try {
		const { data: settings } = await supabase
			.from('user_settings')
			.select('*')
			.single();

		return (
			<div className="relative flex h-[calc(100vh-theme(spacing.16))] overflow-hidden">
				<Sidebar defaultCollapsed={settings?.sidebar_collapsed ?? false} />
				<main className="flex-1 overflow-auto">
					{children}
				</main>
			</div>
		);
	} catch (error) {
		console.error('Layout error:', error);
		return (
			<main className="flex-1 overflow-auto">
				{children}
			</main>
		);
	}
}
