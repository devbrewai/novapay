import { useState, type ReactNode } from "react";
import { Menu } from "react-feather";
import { Button } from "@/components/ui/button";
import { Sidebar, type Page } from "@/components/sidebar";
import { ChatTrigger } from "@/components/chat-trigger";
import { ChatPanel } from "@/components/chat";

interface LayoutProps {
  children: (activePage: Page) => ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [activePage, setActivePage] = useState<Page>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-3 border-b border-border bg-card px-4 md:hidden shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <span className="font-heading text-lg font-bold text-foreground">NovaPay</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
          <div className="mx-auto max-w-5xl">
            {children(activePage)}
          </div>
        </main>
      </div>

      {!chatOpen && <ChatTrigger onOpen={() => setChatOpen(true)} />}
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
