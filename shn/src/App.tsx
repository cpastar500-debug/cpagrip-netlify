import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Rewards from "@/pages/Rewards";
import Watch from "@/pages/Watch";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/rewards" component={Rewards} />
      <Route path="/rewards/index.html" component={Rewards} />
      <Route path="/watch" component={Watch} />
      <Route path="/watch/index.html" component={Watch} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
