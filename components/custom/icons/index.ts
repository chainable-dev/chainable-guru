import { 
  IoArrowUpOutline,
  IoPaperclipOutline,
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

// Export icon types
export interface IconProps {
  size?: number;
  className?: string;
  'aria-label'?: string;
}

// Export all icons with consistent naming
export const ArrowUpIcon = IoArrowUpOutline;
export const PaperclipIcon = IoPaperclipOutline;
export const StopIcon = IoStopOutline;
export const CrossIcon = IoCloseOutline;
export const CopyIcon = IoCopyOutline;
export const GlobeIcon = IoGlobeOutline;
export const WalletIcon = IoWalletOutline;
export const SquareIcon = IoSquareOutline;
export const UndoIcon = IoArrowUndoOutline;
export const RedoIcon = IoArrowRedoOutline;
export const DeltaIcon = IoTriangleOutline; 