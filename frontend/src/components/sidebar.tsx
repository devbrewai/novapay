import {
  Home,
  ArrowLeftRight,
  CreditCard,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { mockAccount } from "@/data";

export type Page = "home" | "transactions" | "cards" | "settings";

interface NavItem {
  id: Page;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
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
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center gap-2 px-5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">N</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">NovaPay</span>
        </div>

        <Separator />

        <nav className="flex-1 space-y-1 px-3 py-4">
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
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <Separator />

        <div className="flex items-center gap-3 px-5 py-4">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">{mockAccount.name}</p>
            <Badge variant="secondary" className="mt-0.5 text-[10px] px-1.5 py-0">
              {mockAccount.tier}
            </Badge>
          </div>
        </div>
      </aside>
    </>
  );
}
