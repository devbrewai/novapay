import type { ComponentType } from "react";
import { Home, Shuffle, CreditCard, Settings } from "react-feather";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { mockAccount } from "@/data";

export type Page = "home" | "transactions" | "cards" | "settings";

interface NavItem {
  id: Page;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "transactions", label: "Transactions", icon: Shuffle },
  { id: "cards", label: "Cards", icon: CreditCard },
  { id: "settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ activePage, onNavigate, open, onClose }: SidebarProps) {
  const initials = mockAccount.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/50 bg-sidebar transition-transform duration-200 md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-3 px-6">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <span className="font-heading text-sm font-bold">N</span>
          </div>
          <span className="font-heading text-xl font-bold tracking-tight text-foreground">Nova</span>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                  isActive
                    ? "bg-accent/50 text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon size={18} className={isActive ? "text-primary" : ""} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4">
          <div className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted transition-colors cursor-pointer border border-transparent hover:border-border/50">
            <Avatar className="size-9 ring-1 ring-border/50 shadow-sm">
              <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{mockAccount.name}</p>
              <p className="truncate text-xs text-muted-foreground">{mockAccount.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
