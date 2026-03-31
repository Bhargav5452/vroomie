import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MapPin, Clock, Users, Leaf, Star, Shield } from "lucide-react";

interface RideCardProps {
  ride: any;
}

export default function RideCard({ ride }: RideCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const requestSeatMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/bookings", {
        rideId: ride.id,
        seatsBooked: 1,
        totalPrice: ride.pricePerSeat,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your ride request has been sent. You'll get a notification when the driver responds.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/my-bookings"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to request seat",
        variant: "destructive",
      });
    },
  });

  const driverName = `${ride.driver.firstName || ''} ${ride.driver.lastName || ''}`.trim();
  const rating = 4.8; // Mock rating

  return (
    <Card className="shadow-sm border border-gray-100">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
              {ride.driver.profileImageUrl ? (
                <img 
                  src={ride.driver.profileImageUrl} 
                  alt={driverName}
                  className="w-full h-full object-cover"
                  data-testid={`img-driver-${ride.id}`}
                />
              ) : (
                <span className="text-gray-600 font-semibold">
                  {ride.driver.firstName?.[0]}{ride.driver.lastName?.[0]}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold" data-testid={`text-driver-${ride.id}`}>
                {driverName}
              </p>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <span>{ride.driver.branch}</span>
                <span>•</span>
                <span>{ride.driver.year} Year</span>
                <span>•</span>
                <div className="flex items-center">
                  <Star className="w-3 h-3 text-accent fill-current" />
                  <span className="ml-1">{rating}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="font-bold text-lg" data-testid={`text-price-${ride.id}`}>
              ₹{ride.pricePerSeat}
            </p>
            <p className="text-sm text-gray-600" data-testid={`text-seats-${ride.id}`}>
              {ride.seatsLeft} seats left
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-primary" />
            <span data-testid={`text-route-${ride.id}`}>
              {ride.fromLocation} → {ride.toLocation}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-gray-400" />
            <span data-testid={`text-time-${ride.id}`}>{ride.time}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="border-secondary text-secondary">
              <Users className="w-3 h-3 mr-1" />
              {ride.buddyMatch}% Match
            </Badge>
            
            <Badge variant="outline" className="border-secondary text-secondary">
              <Leaf className="w-3 h-3 mr-1" />
              {ride.carbonSaved}kg CO₂
            </Badge>
          </div>
          
          <Button 
            onClick={() => requestSeatMutation.mutate()}
            disabled={requestSeatMutation.isPending || ride.seatsLeft === 0}
            className="px-6 py-2 rounded-lg text-sm font-medium"
            data-testid={`button-request-${ride.id}`}
          >
            {requestSeatMutation.isPending ? "Requesting..." : "Request Seat"}
          </Button>
        </div>
        
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
            <Shield className="w-3 h-3 text-secondary" />
            <span>Verified Student</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
