"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bug } from "lucide-react";
import { useWindowSize } from "usehooks-ts";

interface DebugInfo {
	buildNumber: string;
	version: string;
	environment: string;
	lastDeployTime: string;
	nodeVersion: string;
	systemInfo: {
		screen: string;
		userAgent: string;
		memory?: string;
		cpu?: string;
	};
}

export function DebugInfo() {
	const [show, setShow] = useState(false);
	const { width, height } = useWindowSize();

	const debugInfo: DebugInfo = {
		buildNumber: process.env.NEXT_PUBLIC_BUILD_NUMBER || "dev",
		version: process.env.NEXT_PUBLIC_VERSION || "0.0.1",
		environment: process.env.NEXT_PUBLIC_VERCEL_ENV || "development",
		lastDeployTime:
			process.env.NEXT_PUBLIC_VERCEL_DEPLOYED_AT || new Date().toISOString(),
		nodeVersion: process.version,
		systemInfo: {
			screen: `${width}x${height}`,
			userAgent:
				typeof window !== "undefined" ? window.navigator.userAgent : "",
			memory:
				typeof window !== "undefined"
					? `${((performance as any)?.memory?.usedJSHeapSize || 0) / 1024 / 1024}MB`
					: "",
			cpu:
				typeof window !== "undefined"
					? navigator?.hardwareConcurrency?.toString() || ""
					: "",
		},
	};

	return (
		<div className="fixed bottom-4 left-4 z-50">
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="relative"
			>
				<button
					onClick={() => setShow(!show)}
					className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
				>
					<Bug className="size-4" />
				</button>

				{show && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="absolute bottom-full mb-2 left-0 bg-background border rounded-lg p-4 shadow-lg min-w-64"
					>
						<div className="space-y-2 text-xs">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Build:</span>
								<span>{debugInfo.buildNumber}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Version:</span>
								<span>{debugInfo.version}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Env:</span>
								<span>{debugInfo.environment}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Deployed:</span>
								<span>
									{new Date(debugInfo.lastDeployTime).toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Screen:</span>
								<span>{debugInfo.systemInfo.screen}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Memory:</span>
								<span>{debugInfo.systemInfo.memory}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">CPU Cores:</span>
								<span>{debugInfo.systemInfo.cpu}</span>
							</div>
						</div>
					</motion.div>
				)}
			</motion.div>
		</div>
	);
}
