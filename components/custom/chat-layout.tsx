interface ChatLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export function ChatLayout({ children, sidebar }: ChatLayoutProps) {
  return (
    <div className="flex h-screen bg-[#1f1f28]">
      {sidebar}
      <main className="ml-80 flex-1 overflow-hidden">
        <div className="flex h-full flex-col">
          {children}
        </div>
      </main>
    </div>
  );
} 