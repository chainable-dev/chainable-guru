import { 
  IoArrowUpOutline,
  IoAttachOutline,
  IoStopOutline,
  IoCloseOutline,
  IoCopyOutline,
  IoGlobeOutline,
  IoWalletOutline,
  IoSquareOutline,
  IoArrowUndoOutline,
  IoArrowRedoOutline,
  IoTriangleOutline,
} from "react-icons/io5";
import type { IconType } from "react-icons";

// Export icon types
export interface IconProps {
  size?: number;
  className?: string;
  'aria-label'?: string;
}

// Export all icons with consistent naming and types
export const ArrowUpIcon: IconType = IoArrowUpOutline;
export const PaperclipIcon: IconType = IoAttachOutline;
export const StopIcon: IconType = IoStopOutline;
export const CrossIcon: IconType = IoCloseOutline;
export const CopyIcon: IconType = IoCopyOutline;
export const GlobeIcon: IconType = IoGlobeOutline;
export const WalletIcon: IconType = IoWalletOutline;
export const SquareIcon: IconType = IoSquareOutline;
export const UndoIcon: IconType = IoArrowUndoOutline;
export const RedoIcon: IconType = IoArrowRedoOutline;
export const DeltaIcon: IconType = IoTriangleOutline; 