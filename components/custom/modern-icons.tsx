"use client";

import { cn } from "@/lib/utils";
import type { LucideProps } from "lucide-react";

// Base icon props interface
interface IconProps extends LucideProps {
	size?: number;
	className?: string;
}

// Modern icon wrapper with consistent styling
const Icon = ({ size = 16, className, ...props }: IconProps) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={cn("shrink-0", className)}
		{...props}
	/>
);

// Chat & Communication Icons
export const ChatIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
	</Icon>
);

export const MessageIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
		<path d="M13 8H7" />
		<path d="M17 12H7" />
	</Icon>
);

export const BotIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<rect width="18" height="10" x="3" y="11" rx="2" />
		<circle cx="12" cy="5" r="2" />
		<path d="M12 7v4" />
		<line x1="8" x2="8" y1="16" y2="16" />
		<line x1="16" x2="16" y1="16" y2="16" />
	</Icon>
);

export const UserIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
		<circle cx="12" cy="7" r="4" />
	</Icon>
);

// Input & Action Icons
export const SendIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<path d="m22 2-7 20-4-9-9-4Z" />
		<path d="M22 2 11 13" />
	</Icon>
);

export const PaperclipIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.49" />
	</Icon>
);

export const ImageIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
		<circle cx="9" cy="9" r="2" />
		<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
	</Icon>
);

export const FileIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
		<polyline points="14,2 14,8 20,8" />
	</Icon>
);

export const PlusIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<path d="M5 12h14" />
		<path d="M12 5v14" />
	</Icon>
);

export const XIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<path d="M18 6 6 18" />
		<path d="M6 6l12 12" />
	</Icon>
);

// Status & Feedback Icons
export const CheckIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<path d="M20 6 9 17l-5-5" />
	</Icon>
);

export const CheckCheckIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<path d="M18 6 7 17l-5-5" />
		<path d="M22 6l-5 5" />
	</Icon>
);

export const ClockIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<circle cx="12" cy="12" r="10" />
		<polyline points="12,6 12,12 16,14" />
	</Icon>
);

export const LoaderIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={cn("animate-spin", className)}>
		<path d="M21 12a9 9 0 1 1-6.219-8.56" />
	</Icon>
);

export const StopIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
	</Icon>
);

// Navigation & UI Icons
export const ArrowUpIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<path d="m18 15-6-6-6 6" />
	</Icon>
);

export const ArrowDownIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<path d="m6 9 6 6 6-6" />
	</Icon>
);

export const ChevronDownIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<path d="m6 9 6 6 6-6" />
	</Icon>
);

export const MoreHorizontalIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<circle cx="12" cy="12" r="1" />
		<circle cx="19" cy="12" r="1" />
		<circle cx="5" cy="12" r="1" />
	</Icon>
);

export const MoreVerticalIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<circle cx="12" cy="12" r="1" />
		<circle cx="12" cy="5" r="1" />
		<circle cx="12" cy="19" r="1" />
	</Icon>
);

// Action & Control Icons
export const CopyIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
		<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
	</Icon>
);

export const TrashIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<path d="M3 6h18" />
		<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
		<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
	</Icon>
);

export const EditIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
		<path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
	</Icon>
);

export const ThumbUpIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<path d="M7 10v12" />
		<path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
	</Icon>
);

export const ThumbDownIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<path d="M17 14V2" />
		<path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
	</Icon>
);

// Specialized Icons
export const SparklesIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
		<path d="M20 3v4" />
		<path d="M22 5h-4" />
		<path d="M4 17v2" />
		<path d="M5 18H3" />
	</Icon>
);

export const MenuIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<line x1="4" x2="20" y1="12" y2="12" />
		<line x1="4" x2="20" y1="6" y2="6" />
		<line x1="4" x2="20" y1="18" y2="18" />
	</Icon>
);

export const HomeIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
		<polyline points="9,22 9,12 15,12 15,22" />
	</Icon>
);

export const SettingsIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
		<circle cx="12" cy="12" r="3" />
	</Icon>
);

// Brand Icons (simplified versions)
export const OpenAIIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<path d="M12 2L2 7l10 5 10-5-10-5z" />
		<path d="M2 17l10 5 10-5" />
		<path d="M2 12l10 5 10-5" />
	</Icon>
);

export const AnthropicIcon = ({ size = 16, className }: IconProps) => (
	<Icon size={size} className={className}>
		<path d="M12 2L2 7l10 5 10-5-10-5z" />
		<path d="M2 17l10 5 10-5" />
		<path d="M2 12l10 5 10-5" />
	</Icon>
);

// Typing indicator component
export const TypingIndicator = ({ size = 16, className }: IconProps) => {
	return (
		<div className={cn("flex items-center gap-1", className)}>
			{[0, 1, 2].map((i) => (
				<div
					key={i}
					className="size-2 bg-current rounded-full animate-pulse"
					style={{
						animationDelay: `${i * 0.2}s`,
						animationDuration: '1.5s',
					}}
				/>
			))}
		</div>
	);
};

// Export all icons as a single object for easy importing
export const ModernIcons = {
	// Chat & Communication
	Chat: ChatIcon,
	Message: MessageIcon,
	Bot: BotIcon,
	User: UserIcon,
	
	// Input & Actions
	Send: SendIcon,
	Paperclip: PaperclipIcon,
	Image: ImageIcon,
	File: FileIcon,
	Plus: PlusIcon,
	X: XIcon,
	
	// Status & Feedback
	Check: CheckIcon,
	CheckCheck: CheckCheckIcon,
	Clock: ClockIcon,
	Loader: LoaderIcon,
	Stop: StopIcon,
	
	// Navigation & UI
	ArrowUp: ArrowUpIcon,
	ArrowDown: ArrowDownIcon,
	ChevronDown: ChevronDownIcon,
	MoreHorizontal: MoreHorizontalIcon,
	MoreVertical: MoreVerticalIcon,
	
	// Actions & Controls
	Copy: CopyIcon,
	Trash: TrashIcon,
	Edit: EditIcon,
	ThumbUp: ThumbUpIcon,
	ThumbDown: ThumbDownIcon,
	
	// Specialized
	Sparkles: SparklesIcon,
	Menu: MenuIcon,
	Home: HomeIcon,
	Settings: SettingsIcon,
	
	// Brand
	OpenAI: OpenAIIcon,
	Anthropic: AnthropicIcon,
	
	// Components
	TypingIndicator,
};
