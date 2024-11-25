"use client";

import { IoChevronForward, IoAddOutline } from "react-icons/io5";

export function IconSidebar({ className }: { className?: string }) {
  return <IoAddOutline className={className} />;
}

export function IconChevron({ className }: { className?: string }) {
  return <IoChevronForward className={className} />;
} 