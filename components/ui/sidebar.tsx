"use client";

import * as React from "react";

interface SidebarContextType {
	collapsed: boolean;
	setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
	const [collapsed, setCollapsed] = React.useState(false);

	return (
		<SidebarContext.Provider value={{ collapsed, setCollapsed }}>
			{children}
		</SidebarContext.Provider>
	);
}

export function useSidebar() {
	const context = React.useContext(SidebarContext);
	if (!context) {
		throw new Error("useSidebar must be used within a SidebarProvider.");
	}
	return context;
}

export function Sidebar({ defaultCollapsed = false }: { defaultCollapsed?: boolean }) {
	const { collapsed, setCollapsed } = useSidebar();

	React.useEffect(() => {
		setCollapsed(defaultCollapsed);
	}, [defaultCollapsed, setCollapsed]);

	return (
		<div className={`${collapsed ? 'w-0' : 'w-80'} transition-all duration-300`}>
			{/* Sidebar content */}
		</div>
	);
}
