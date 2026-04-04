import type { ComponentType } from "react";
import { Home, Shuffle, CreditCard, Settings, ChevronLeft, ChevronRight } from "react-feather";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { mockAccount } from "@/data";
import { NovaLogo } from "@/components/nova-logo";

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
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ activePage, onNavigate, open, onClose, collapsed, onToggleCollapse }: SidebarProps) {
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
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-primary/20 bg-primary transition-all duration-300 md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        <div className={cn("flex h-16 items-center shrink-0", collapsed ? "justify-center px-0" : "justify-between px-6")}>
          {collapsed ? (
            <div className="group/logo relative cursor-pointer size-10 flex items-center justify-center rounded-lg hover:bg-primary-foreground/10 transition-all" onClick={onToggleCollapse}>
              <NovaLogo className="text-primary-foreground shrink-0 transition-opacity group-hover/logo:opacity-0" />
              <ChevronRight size={20} className="text-primary-foreground absolute opacity-0 transition-opacity group-hover/logo:opacity-100" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <NovaLogo className="text-primary-foreground shrink-0" />
                <span className="font-heading text-xl font-bold tracking-tight text-primary-foreground">
                  Nova
                </span>
              </div>
              <button
                onClick={onToggleCollapse}
                className="cursor-pointer size-10 flex items-center justify-center rounded-lg text-primary-foreground/60 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-all hidden md:flex"
              >
                <ChevronLeft size={20} />
              </button>
            </>
          )}
        </div>

        <nav className={cn("flex-1 space-y-2.5 py-6", collapsed ? "px-2" : "px-4")}>
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <div key={item.id} className="relative group/nav">
                <button
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg py-2.5 text-sm font-semibold transition-all",
                    collapsed ? "justify-center w-10 mx-auto" : "w-full px-3",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "text-primary-foreground/60 hover:bg-primary-foreground/10 hover:text-primary-foreground",
                  )}
                >
                  <item.icon size={18} className="shrink-0" />
                  {!collapsed && item.label}
                </button>
                {collapsed && (
                  <div className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background opacity-0 transition-opacity duration-200 group-hover/nav:opacity-100 whitespace-nowrap shadow-lg z-50">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className={cn("p-4", collapsed && "p-2")}>
          <div className={cn(
            "flex items-center gap-3 rounded-lg p-3 hover:bg-primary-foreground/10 transition-colors cursor-pointer border border-transparent hover:border-primary-foreground/20",
            collapsed && "justify-center p-2",
          )}>
            <Avatar className="size-9 ring-1 ring-primary-foreground/20 shadow-sm shrink-0">
              <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-primary-foreground">{mockAccount.name}</p>
                <p className="truncate text-xs text-primary-foreground/60">{mockAccount.email}</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
