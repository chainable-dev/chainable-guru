"use client";

import { motion } from "framer-motion";

interface ElronIconProps {
	size?: number;
	className?: string;
	animated?: boolean;
}

export function ElronIcon({
	size = 24,
	className = "",
	animated = true,
}: ElronIconProps) {
	const variants = {
		hidden: { opacity: 0, rotate: -180 },
		visible: {
			opacity: 1,
			rotate: 0,
			transition: {
				duration: 0.5,
				ease: "easeOut",
			},
		},
	};

	return (
		<motion.div
			initial={animated ? "hidden" : "visible"}
			animate="visible"
			variants={variants}
			className={`relative ${className}`}
			style={{ width: size, height: size }}
		>
			<svg
				viewBox="0 0 100 100"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className="w-full h-full"
			>
				{/* Ninja star shape */}
				<path
					d="M50 20L65 35L80 50L65 65L50 80L35 65L20 50L35 35L50 20Z"
					className="fill-primary"
				/>

				{/* Center detail */}
				<circle cx="50" cy="50" r="10" className="fill-accent" />
			</svg>
		</motion.div>
	);
}
