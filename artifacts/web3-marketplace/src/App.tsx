import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Web3Provider } from "@/lib/web3";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/home";
import Explore from "@/pages/explore";
import WorkerProfile from "@/pages/worker-profile";
import Register from "@/pages/register";
import Bookings from "@/pages/bookings";
import Messages from "@/pages/messages";
import Dashboard from "@/pages/dashboard";
import EditProfile from "@/pages/edit-profile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/explore" component={Explore} />
      <Route path="/worker/:id" component={WorkerProfile} />
      <Route path="/register" component={Register} />
      <Route path="/bookings" component={Bookings} />
      <Route path="/messages" component={Messages} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/edit-profile" component={EditProfile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Web3Provider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </Web3Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
