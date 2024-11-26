import { SVGProps } from "react";

export function RedoIcon({
  size = 24,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" />
    </svg>
  );
} 