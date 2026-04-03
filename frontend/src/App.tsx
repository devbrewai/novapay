import { Layout } from "@/components/layout";
import { AccountSummary } from "@/components/account-summary";
import { TransactionList } from "@/components/transaction-list";
import type { Page } from "@/components/sidebar";

function HomePage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Welcome back, Alex
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Here's your financial overview
          </p>
        </div>
      </div>
      <AccountSummary />
      <TransactionList />
    </div>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in duration-500">
      <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-5 shadow-sm">
        <span className="text-2xl">🚧</span>
      </div>
      <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">{title}</h1>
      <p className="mt-2 text-sm font-medium text-muted-foreground max-w-[280px]">
        We are currently building out the {title.toLowerCase()} experience. Check back soon.
      </p>
    </div>
  );
}

function App() {
  return (
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
  );
}

export default App;
