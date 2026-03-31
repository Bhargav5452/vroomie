import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Car, Search, Trophy, User, Leaf, Check, Clock, MapPin, Star } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: recentBookings } = useQuery({
    queryKey: ["/api/bookings/my-bookings"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const userName = user.firstName || "Student";
  const carbonSaved = user.carbonSaved ? parseFloat(user.carbonSaved) : 0;
  const userRank = 7; // Mock rank for now

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-white p-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-welcome">
              Hi, {userName}! 👋
            </h1>
            <p className="text-gray-600">Ready for your next ride?</p>
          </div>
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-profile">
              <User className="w-6 h-6" />
            </Button>
          </Link>
        </div>
        
        <Card className="bg-secondary/10 border-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center mr-3">
                <Leaf className="text-white w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-secondary">Eco Impact</p>
                <p className="text-sm text-gray-600">
                  You've saved {carbonSaved.toFixed(1)} kg CO₂ this month!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="px-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Link href="/offer-ride">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" data-testid="card-offer-ride">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Car className="text-primary text-xl" />
                </div>
                <p className="font-semibold">Offer a Ride</p>
                <p className="text-sm text-gray-600 mt-1">Drive & earn</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/find-ride">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" data-testid="card-find-ride">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Search className="text-secondary text-xl" />
                </div>
                <p className="font-semibold">Find a Ride</p>
                <p className="text-sm text-gray-600 mt-1">Book & travel</p>
              </CardContent>
            </Card>
          </Link>
        </div>
        
        <Link href="/leaderboard">
          <Card className="bg-gradient-to-r from-accent to-orange-500 text-white cursor-pointer" data-testid="card-leaderboard">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-3">
                <Trophy className="text-2xl" />
                <div>
                  <p className="font-semibold text-lg">Leaderboard</p>
                  <p className="text-sm opacity-90">You're #{userRank} this week!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Recent Activity</h3>
              <Link href="/bookings">
                <Button variant="ghost" size="sm" className="text-primary" data-testid="button-view-all">
                  View all
                </Button>
              </Link>
            </div>
            
            <div className="space-y-3">
              {recentBookings?.slice(0, 2).map((booking: any, index: number) => (
                <div key={booking.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <Check className="text-white text-xs" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm" data-testid={`text-route-${index}`}>
                      {booking.ride.fromLocation} → {booking.ride.toLocation}
                    </p>
                    <p className="text-xs text-gray-600">
                      {booking.status === 'completed' ? 'Completed • +50 points' : 'Upcoming'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {booking.status === 'completed' ? '2h ago' : 'Tomorrow'}
                  </span>
                </div>
              )) || (
                <div className="text-center py-4 text-gray-500">
                  <p>No recent activity</p>
                  <p className="text-sm">Start by offering or finding a ride!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
