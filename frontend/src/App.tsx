import { Layout } from "@/components/layout";
import type { Page } from "@/components/sidebar";

function App() {
  return (
    <Layout>
      {(activePage: Page) => (
        <div>
          <h1 className="text-2xl font-bold capitalize">{activePage}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {activePage === "home"
              ? "Welcome back, Alex"
              : `${activePage.charAt(0).toUpperCase() + activePage.slice(1)} page coming soon`}
          </p>
        </div>
      )}
    </Layout>
  );
}

export default App;
