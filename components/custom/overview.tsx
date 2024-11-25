"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const QUOTES = [
	"Where innovation meets blockchain technology",
	"Your trusted companion in the blockchain journey",
	"Empowering Web3 development with AI",
	"Building the future of decentralized applications",
	"Seamlessly connecting AI and blockchain",
	"Your gateway to Base ecosystem development",
	"Making blockchain development accessible",
	"Bridging traditional and decentralized finance",
	"Powering the next generation of dApps",
	"Simplifying smart contract interactions",
];

const LINKS = {
	chainable: "https://chainable.co",
	base: "https://base.org",
	supabase: "https://supabase.com",
} as const;

export const Overview = () => {
	const [quote, setQuote] = useState(QUOTES[0]);

	useEffect(() => {
		setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
	}, []);

	return (
		<motion.div
			className="max-w-3xl mx-auto md:mt-20"
			initial={{ opacity: 0, scale: 0.98 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ delay: 0.5 }}
		>
			<div className="rounded-xl p-6 flex flex-col items-center gap-6 text-center max-w-xl mx-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border">
				<div className="flex items-center gap-4">
					<Image
						src="/logos/elron.ico"
						alt="Elron Bot"
						width={48}
						height={48}
						className="rounded-full shadow-lg"
						priority
					/>
					<div className="text-left">
						<h2 className="text-2xl font-bold">Elron</h2>
						<p className="text-sm text-muted-foreground">
							Powered by{" "}
							<Link
								href={LINKS.chainable}
								target="_blank"
								className="hover:underline"
							>
								chainable.co
							</Link>
						</p>
					</div>
				</div>

				<p className="text-sm italic text-muted-foreground">
					&ldquo;{quote}&rdquo;
				</p>

				<div className="space-y-4 text-sm">
					<p>
						Welcome to Chainable Chat Bot - your AI-powered Web3 assistant.
						Built with Next.js and the latest Web3 technologies.
					</p>
					<p>
						Connect your wallet to access personalized features like balance
						checks, transaction history, and smart contract interactions.
					</p>
					<p>
						Powered by{" "}
						<Link
							href={LINKS.base}
							target="_blank"
							className="underline underline-offset-4"
						>
							Base
						</Link>{" "}
						and secured with{" "}
						<Link
							href={LINKS.supabase}
							target="_blank"
							className="underline underline-offset-4"
						>
							Supabase
						</Link>
					</p>
				</div>

				<Link
					href={LINKS.chainable}
					target="_blank"
					className="w-[120px] h-[30px] relative"
				>
					<Image
						src="/logos/favicon-dark.ico"
						alt="Chainable Logo"
						fill
						className="opacity-90 dark:opacity-100 object-contain hover:opacity-100 transition-opacity shadow-md"
					/>
				</Link>
			</div>
		</motion.div>
	);
};
