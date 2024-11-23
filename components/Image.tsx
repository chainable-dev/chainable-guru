import Image from "next/image";

interface CustomImageProps {
	src: string;
	alt: string;
	width?: number;
	height?: number;
	className?: string;
}

export function CustomImage({
	src,
	alt,
	width = 400,
	height = 300,
	className,
}: CustomImageProps) {
	// Handle avatar URLs specifically
	const isAvatarUrl = src.includes("avatar.vercel.sh");

	return (
		<div className="relative">
			<Image
				src={src}
				alt={alt}
				width={isAvatarUrl ? 40 : width} // Use smaller size for avatars
				height={isAvatarUrl ? 40 : height}
				className={`object-cover ${isAvatarUrl ? "rounded-full" : ""} ${className || ""}`}
				loading="lazy"
				quality={90}
				onError={(e) => {
					// Fallback handling for failed images
					const target = e.target as HTMLImageElement;
					if (isAvatarUrl) {
						target.src = "/default-avatar.png"; // Make sure to add a default avatar image
					} else {
						target.src = "/fallback-image.png";
					}
				}}
			/>
		</div>
	);
}
