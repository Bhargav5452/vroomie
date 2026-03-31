import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import OfferRide from "@/pages/offer-ride";
import FindRide from "@/pages/find-ride";
import Bookings from "@/pages/bookings";
import Leaderboard from "@/pages/leaderboard";
import Profile from "@/pages/profile";
import EditProfile from "@/pages/edit-profile";
import Register from "@/pages/register";
import NotFound from "@/pages/not-found";
import BottomNav from "@/components/bottom-nav";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      <Switch>
        {isLoading || !isAuthenticated ? (
          <>
            <Route path="/" component={Landing} />
            <Route path="/register" component={Register} />
          </>
        ) : (
          <>
            <Route path="/" component={Dashboard} />
            <Route path="/offer-ride" component={OfferRide} />
            <Route path="/find-ride" component={FindRide} />
            <Route path="/bookings" component={Bookings} />
            <Route path="/leaderboard" component={Leaderboard} />
            <Route path="/profile" component={Profile} />
            <Route path="/edit-profile" component={EditProfile} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
      
      {isAuthenticated && !isLoading && <BottomNav />}
    </div>
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
