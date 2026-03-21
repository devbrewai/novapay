import { Layout } from "@/components/layout";
import { AccountSummary } from "@/components/account-summary";
import type { Page } from "@/components/sidebar";

function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, Alex</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's what's happening with your account.
        </p>
      </div>
      <AccountSummary />
    </div>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Coming soon</p>
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
