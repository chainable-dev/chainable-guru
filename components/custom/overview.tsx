import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const quotes = [
	"Your intelligent AI assistant, ready to help with any task",
	"Powered by advanced AI to provide accurate and helpful responses",
	"Ask me anything - I'm here to assist and provide insights",
	"Experience the future of conversational AI technology",
	"Your trusted companion for productivity and knowledge",
];

export const Overview = () => {
	const [currentQuote, setCurrentQuote] = useState("");

	useEffect(() => {
		const updateQuote = () => {
			const randomIndex = Math.floor(Math.random() * quotes.length);
			setCurrentQuote(quotes[randomIndex]);
		};

		updateQuote();
		const interval = setInterval(updateQuote, 5 * 60 * 60 * 1000);

		return () => clearInterval(interval);
	}, []);

	return (
		<motion.div
			key="overview"
			className="max-w-3xl mx-auto md:mt-20"
			initial={{ opacity: 0, scale: 0.98 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.98 }}
			transition={{ delay: 0.5 }}
		>
			<div className="rounded-xl p-6 flex flex-col items-center gap-8 leading-relaxed text-center max-w-xl mx-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border">
				<div className="flex items-center space-x-4">
					<div className="relative w-12 h-12">
						<Image
							src="/logos/elron.ico"
							alt="Elron Bot"
							fill
							className="rounded-full object-cover"
							priority
						/>
					</div>
					<div className="flex flex-col text-left">
						<h2 className="text-2xl font-bold tracking-tight">AI Assistant</h2>
						<p className="text-sm text-muted-foreground">
							Powered by{" "}
							<Link
								href="https://chainable.co"
								target="_blank"
								rel="noopener noreferrer"
								className="font-medium hover:underline"
							>
								Chainable
							</Link>
						</p>
					</div>
				</div>

				<p className="text-sm italic text-muted-foreground">
					&ldquo;{currentQuote}&rdquo;
				</p>

				<div className="space-y-4">
					<p>
						Welcome to your AI-powered assistant! I&apos;m here to help you with a wide range of tasks,
						from answering questions to providing insights and assistance with your projects.
					</p>
					<p>
						I can help with document creation, weather information, research, coding assistance,
						and much more. Simply start typing to begin our conversation!
					</p>
					<p className="text-sm text-muted-foreground">
						Built with modern web technologies and powered by advanced AI models
						for the best possible experience.
					</p>
				</div>

				<Link
					href="https://chainable.co"
					target="_blank"
					rel="noopener noreferrer"
					className="relative w-[120px] h-[30px]"
				>
					<Image
						src="/logos/favicon-dark.ico"
						alt="Chainable Logo"
						fill
						className="opacity-80 dark:opacity-100 object-contain hover:opacity-100 transition-opacity"
					/>
				</Link>
			</div>
		</motion.div>
	);
};
