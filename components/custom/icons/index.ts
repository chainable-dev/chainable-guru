// React Icons imports
import { 
  IoArrowUp,
  IoPaperclip,
  IoStop,
  IoClose,
  IoCopy,
  IoGlobe,
  IoWallet,
  IoSquare,
} from "react-icons/io5";

// Import custom icons
import { DeltaIcon } from "./DeltaIcon";
import { RedoIcon } from "./RedoIcon";
import { UndoIcon } from "./UndoIcon";

// Re-export with consistent naming
export const ArrowUp = IoArrowUp;
export const Paperclip = IoPaperclip;
export const Stop = IoStop;
export const Cross = IoClose;
export const Copy = IoCopy;
export const Globe = IoGlobe;
export const Wallet = IoWallet;
export const Square = IoSquare;

// Export custom icons
export { DeltaIcon, RedoIcon, UndoIcon };

// Export icon types
export type IconProps = {
  size?: number;
  className?: string;
}; 