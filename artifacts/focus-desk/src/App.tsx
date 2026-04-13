import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { Sidebar } from "@/components/ui/Sidebar";
import { QuickCapture } from "@/components/ui/QuickCapture";
import { useThemeStore } from "@/store/themeStore";
import { useReminders } from "@/hooks/useReminders";
import { useTabTitle } from "@/hooks/useTabTitle";
import Dashboard from "@/pages/Dashboard";
import Tasks from "@/pages/Tasks";
import Notes from "@/pages/Notes";
import Settings from "@/pages/Settings";

const queryClient = new QueryClient();

function AppLayout({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore(s => s.theme);
  useReminders();
  useTabTitle();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 sm:px-6 py-2.5 lg:top-0">
          <QuickCapture />
        </div>
        <main className="flex-1 overflow-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/notes" component={Notes} />
        <Route path="/settings" component={Settings} />
        <Route>
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Page not found
          </div>
        </Route>
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
