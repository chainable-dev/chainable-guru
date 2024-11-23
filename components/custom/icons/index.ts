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

// Re-export with consistent naming and accessibility props
export const ArrowUp = (props: IconProps) => (
  <IoArrowUp {...props} aria-hidden="true" role="img" />
);
export const Paperclip = (props: IconProps) => (
  <IoPaperclip {...props} aria-hidden="true" role="img" />
);
export const Stop = (props: IconProps) => (
  <IoStop {...props} aria-hidden="true" role="img" />
);
export const Cross = (props: IconProps) => (
  <IoClose {...props} aria-hidden="true" role="img" />
);
export const Copy = (props: IconProps) => (
  <IoCopy {...props} aria-hidden="true" role="img" />
);
export const Globe = (props: IconProps) => (
  <IoGlobe {...props} aria-hidden="true" role="img" />
);
export const Wallet = (props: IconProps) => (
  <IoWallet {...props} aria-hidden="true" role="img" />
);
export const Square = (props: IconProps) => (
  <IoSquare {...props} aria-hidden="true" role="img" />
);

// Export custom icons with accessibility props
export { DeltaIcon, RedoIcon, UndoIcon };

// Export icon types
export interface IconProps {
  size?: number;
  className?: string;
  'aria-label'?: string;
} 