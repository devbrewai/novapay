import { useState, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Layout } from "@/components/layout";
import { AccountSummary } from "@/components/account-summary";
import { TransactionList } from "@/components/transaction-list";
import type { Page } from "@/components/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { mockAccount } from "@/data";
import { Gift, Target } from "react-feather";

// --- Loading Skeletons ---

function AccountSummarySkeleton() {
  return (
    <Card className="border-none shadow-sm ring-1 ring-border/50">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4 w-full">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-12 w-64 rounded-lg" />
            <Skeleton className="h-5 w-48 rounded-md" />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TransactionListSkeleton() {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4 px-1">
        <Skeleton className="h-6 w-40 rounded-md" />
        <Skeleton className="h-4 w-12 rounded-md" />
      </div>
      <div className="rounded-xl bg-card border-none shadow-sm ring-1 ring-border/50 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i}>
            {i > 0 && <Separator className="ml-14" />}
            <div className="flex items-center gap-4 px-5 py-4">
              <Skeleton className="size-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[40%] rounded-md" />
                <Skeleton className="h-3 w-[25%] rounded-md" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Main App ---

function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1.5 text-sm font-medium text-muted-foreground">
            Welcome back, {mockAccount.name.split(" ")[0]}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <AccountSummarySkeleton />
            <TransactionListSkeleton />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <Skeleton className="w-full h-24 rounded-2xl" />
            <Skeleton className="w-full h-24 rounded-2xl" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
          {/* Left Column: Account & Transactions */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <AccountSummary />
            <TransactionList />
          </div>

          {/* Right Column: Bento Widgets */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Savings Goals */}
            <Card className="border-none shadow-sm ring-1 ring-border/50 rounded-2xl bg-card">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="size-12 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                  <Target size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    Tax Vault
                  </h4>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    On track &bull; $4,200 saved
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Referrals */}
            <Card className="group border-none shadow-sm ring-1 ring-border/50 rounded-2xl bg-card cursor-pointer hover:bg-[#FCFCFD] transition-colors">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="size-12 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                  <Gift size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                    Invite friends
                  </h4>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    Earn $25 per referral
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in duration-500">
      <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-5 shadow-sm">
        <span className="text-2xl">🚧</span>
      </div>
      <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-2 text-sm font-medium text-muted-foreground max-w-[280px]">
        We are currently building out the {title.toLowerCase()} experience.
        Check back soon.
      </p>
    </div>
  );
}

function App() {
  return (
    <>
      <Layout>
        {(activePage: Page) => {
          switch (activePage) {
            case "home":
              return <HomePage />;
            case "transactions":
              return <PlaceholderPage title="Transactions" />;
            case "cards":
              return <PlaceholderPage title="Cards" />;
            case "settings":
              return <PlaceholderPage title="Settings" />;
          }
        }}
      </Layout>
      <Analytics />
    </>
  );
}

export default App;
