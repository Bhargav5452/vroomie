import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Gift, Crown, Medal, Award } from "lucide-react";
import { useLocation } from "wouter";

export default function Leaderboard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const { data: leaderboard } = useQuery({
    queryKey: ["/api/leaderboard"],
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="text-accent text-lg" />;
      case 2:
        return <Medal className="text-gray-600 text-lg" />;
      case 3:
        return <Award className="text-orange-600 text-lg" />;
      default:
        return <span className="text-white font-bold">{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-accent to-orange-500";
      case 2:
        return "bg-gray-200";
      case 3:
        return "bg-orange-200";
      default:
        return "bg-primary";
    }
  };

  const getUserRank = () => {
    if (!user || !leaderboard) return 0;
    const userIndex = leaderboard.findIndex((u: any) => u.id === user.id);
    return userIndex >= 0 ? userIndex + 1 : 0;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-white p-6 pb-4">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="mr-4"
            data-testid="button-back"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
        </div>
        
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-accent to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trophy className="text-white text-2xl" />
          </div>
          <p className="text-sm text-gray-600">Weekly Top Ride Sharers</p>
        </div>
      </div>
      
      <div className="px-6 space-y-3">
        {leaderboard?.map((user: any, index: number) => {
          const rank = index + 1;
          const isCurrentUser = user.id === user?.id;
          
          return (
            <Card 
              key={user.id} 
              className={isCurrentUser ? "border-2 border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10" : ""}
            >
              <CardContent className="p-5">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankBadgeColor(rank)}`}>
                    {getRankIcon(rank)}
                  </div>
                  
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                    {user.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt={user.firstName}
                        className="w-full h-full object-cover"
                        data-testid={`img-profile-${rank}`}
                      />
                    ) : (
                      <span className="text-gray-600 font-semibold">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-semibold" data-testid={`text-name-${rank}`}>
                      {isCurrentUser ? `${user.firstName} (You)` : `${user.firstName} ${user.lastName}`}
                    </p>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <span data-testid={`text-college-${rank}`}>{user.college}</span>
                      <span>•</span>
                      <span data-testid={`text-branch-${rank}`}>{user.branch}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-bold text-lg ${rank === 1 ? 'text-accent' : rank === 2 ? 'text-gray-600' : rank === 3 ? 'text-orange-600' : 'text-primary'}`}>
                      <span data-testid={`text-points-${rank}`}>{user.vroomiePoints || 0}</span>
                    </p>
                    <p className="text-xs text-gray-600">points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }) || (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No leaderboard data available</p>
          </div>
        )}
        
        {user && (
          <Card className="bg-secondary/10 border-secondary/20">
            <CardContent className="p-5 text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="text-white text-xl" />
              </div>
              <p className="font-semibold text-secondary mb-1">Weekly Rewards</p>
              <p className="text-sm text-gray-600">
                Top 3 get special badges & campus store vouchers!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
