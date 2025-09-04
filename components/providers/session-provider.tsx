"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface SessionContextType {
	user: User | null;
	loading: boolean;
}

const SessionContext = createContext<SessionContextType>({
	user: null,
	loading: true,
});

export const useSession = () => {
	const context = useContext(SessionContext);
	if (!context) {
		throw new Error("useSession must be used within a SessionProvider");
	}
	return context;
};

interface SessionProviderProps {
	children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const supabase = createClient();

		// Get initial session
		const getInitialSession = async () => {
			const { data: { session }, error } = await supabase.auth.getSession();
			
			if (error) {
				console.error("Error getting session:", error);
			} else {
				setUser(session?.user ?? null);
			}
			
			setLoading(false);
		};

		getInitialSession();

		// Listen for auth changes
		const { data: { subscription } } = supabase.auth.onAuthStateChange(
			async (event, session) => {
				console.log("Auth state changed:", event, session?.user?.email);
				setUser(session?.user ?? null);
				setLoading(false);
			}
		);

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	return (
		<SessionContext.Provider value={{ user, loading }}>
			{children}
		</SessionContext.Provider>
	);
}
