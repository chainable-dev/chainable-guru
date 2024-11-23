import Image from "next/image";
import { useState } from "react";

interface LogoImageProps {
	name: string;
	alt: string;
	width?: number;
	height?: number;
	className?: string;
}

export function LogoImage({
	name,
	alt,
	width = 40,
	height = 40,
	className,
}: LogoImageProps) {
	const [error, setError] = useState(false);

	// Construct path to logo
	const logoPath = `/logos/${name}${name.includes(".") ? "" : ".svg"}`;

	// Fallback to default logo if error
	const src = error ? "/logos/default-logo.svg" : logoPath;

	return (
		<div className="relative inline-block">
			<Image
				src={src}
				alt={alt}
				width={width}
				height={height}
				className={`object-contain ${className || ""}`}
				loading="lazy"
				quality={90}
				onError={() => setError(true)}
			/>
		</div>
	);
}

// Usage example:
// <LogoImage name="ethereum" alt="Ethereum Logo" />
// <LogoImage name="custom-logo.png" alt="Custom Logo" width={60} height={60} />
