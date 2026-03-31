import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Edit, Calendar, Bell, Settings, LogOut, Shield, Leaf, Award, Users } from "lucide-react";
import { useLocation, Link } from "wouter";

export default function Profile() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const { data: userStats } = useQuery({
    queryKey: ["/api/bookings/my-bookings"],
    select: (bookings: any[]) => {
      const completedRides = bookings?.filter(b => b.status === 'completed').length || 0;
      return {
        ridesCompleted: completedRides,
        carbonSaved: user?.carbonSaved ? parseFloat(user.carbonSaved) : 0,
        points: user?.vroomiePoints || 0,
      };
    },
  });

  const { data: unreadCount } = useQuery({
    queryKey: ["/api/notifications/unread-count"],
  });

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Student';
  const userDetails = `${user.branch || ''} • ${user.year || ''} Year • ${user.college || ''}`;

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
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>
        
        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
            {user.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt={fullName}
                className="w-full h-full object-cover"
                data-testid="img-profile"
              />
            ) : (
              <User className="text-gray-600 text-3xl" />
            )}
          </div>
          <h2 className="text-xl font-bold" data-testid="text-name">{fullName}</h2>
          <p className="text-gray-600" data-testid="text-details">{userDetails}</p>
          
          {user.isVerified && (
            <Badge variant="outline" className="mt-2 border-secondary text-secondary">
              <Shield className="w-4 h-4 mr-1" />
              Verified Student
            </Badge>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary" data-testid="text-rides-completed">
              {userStats?.ridesCompleted || 0}
            </p>
            <p className="text-sm text-gray-600">Rides</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary" data-testid="text-carbon-saved">
              {userStats?.carbonSaved.toFixed(1) || '0.0'}
            </p>
            <p className="text-sm text-gray-600">kg CO₂ Saved</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent" data-testid="text-points">
              {userStats?.points || 0}
            </p>
            <p className="text-sm text-gray-600">Points</p>
          </div>
        </div>
      </div>
      
      <div className="px-6 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 space-y-1">
          <Link href="/edit-profile">
            <Button 
              variant="ghost" 
              className="w-full p-5 h-auto justify-start hover:bg-gray-50"
              data-testid="button-edit-profile"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <Edit className="text-blue-600 text-xl" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">Edit Profile</p>
                <p className="text-sm text-gray-600">Update your information</p>
              </div>
              <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
            </Button>
          </Link>
          
          <Link href="/bookings">
            <Button 
              variant="ghost" 
              className="w-full p-5 h-auto justify-start hover:bg-gray-50 border-t border-gray-50"
              data-testid="button-my-bookings"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <Calendar className="text-green-600 text-xl" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">My Bookings</p>
                <p className="text-sm text-gray-600">View rides & requests</p>
              </div>
              <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            className="w-full p-5 h-auto justify-start hover:bg-gray-50 border-t border-gray-50"
            data-testid="button-notifications"
          >
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mr-4 relative">
              <Bell className="text-yellow-600 text-xl" />
              {unreadCount?.count > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-semibold">{unreadCount.count}</span>
                </div>
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold">Notifications</p>
              <p className="text-sm text-gray-600">Messages & updates</p>
            </div>
            <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full p-5 h-auto justify-start hover:bg-gray-50 border-t border-gray-50"
            data-testid="button-share-referral"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
              <Users className="text-purple-600 text-xl" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold">Invite Friends</p>
              <p className="text-sm text-gray-600">Earn 100 points per friend</p>
            </div>
            <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
          </Button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 space-y-1">
          <Button 
            variant="ghost" 
            className="w-full p-5 h-auto justify-start hover:bg-gray-50"
            data-testid="button-settings"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
              <Settings className="text-gray-600 text-xl" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold">Settings</p>
              <p className="text-sm text-gray-600">Privacy & preferences</p>
            </div>
            <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full p-5 h-auto justify-start hover:bg-red-50 border-t border-gray-50"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
              <LogOut className="text-red-600 text-xl" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-red-600">Logout</p>
              <p className="text-sm text-gray-600">Sign out of account</p>
            </div>
            <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
          </Button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <Link href="/bookings">
            <Button 
              variant="ghost" 
              className="w-full p-5 h-auto justify-start hover:bg-gray-50"
              data-testid="button-bookings"
            >
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mr-4">
                <Calendar className="text-accent text-xl" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">My Bookings</p>
                <p className="text-sm text-gray-600">View ride history</p>
              </div>
              <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
            </Button>
          </Link>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <Button 
            variant="ghost" 
            className="w-full p-5 h-auto justify-start hover:bg-gray-50"
            data-testid="button-notifications"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
              <Bell className="text-blue-600 text-xl" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold">Notifications</p>
              <p className="text-sm text-gray-600">Ride updates & messages</p>
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount?.count > 0 && (
                <Badge variant="destructive" className="rounded-full">
                  {unreadCount.count}
                </Badge>
              )}
              <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
            </div>
          </Button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <Button 
            variant="ghost" 
            className="w-full p-5 h-auto justify-start hover:bg-gray-50"
            data-testid="button-settings"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
              <Settings className="text-gray-600 text-xl" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold">Settings</p>
              <p className="text-sm text-gray-600">Privacy & preferences</p>
            </div>
            <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
          </Button>
        </div>
        
        <Button 
          onClick={handleLogout}
          variant="outline"
          className="w-full py-4 rounded-xl font-semibold text-red-600 border-red-200 hover:bg-red-50"
          data-testid="button-logout"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
