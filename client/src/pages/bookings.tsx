import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Check, User, Users, Calendar, Share2, X } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Bookings() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"passenger" | "driver">("passenger");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookings } = useQuery({
    queryKey: ["/api/bookings/my-bookings"],
  });

  const { data: bookingRequests } = useQuery({
    queryKey: ["/api/bookings/requests"],
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await apiRequest("PUT", `/api/bookings/${bookingId}/status`, {
        status: "cancelled"
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/my-bookings"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel booking",
        variant: "destructive",
      });
    },
  });

  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      const response = await apiRequest("PUT", `/api/bookings/${bookingId}/status`, { status });
      return response.json();
    },
    onSuccess: (_, { status }) => {
      toast({
        title: status === 'confirmed' ? "Request Confirmed" : "Request Declined",
        description: status === 'confirmed' ? "Booking has been confirmed!" : "Booking has been declined.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rides/my-rides"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking",
        variant: "destructive",
      });
    },
  });

  const shareRide = (booking: any) => {
    const shareText = `I'm travelling from ${booking.ride.fromLocation} to ${booking.ride.toLocation} on Vroomie!`;
    if (navigator.share) {
      navigator.share({
        title: "Vroomie Ride",
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to clipboard",
        description: "Ride details copied to clipboard",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-600 border-yellow-200">Pending</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="bg-green-100 text-green-600 border-green-200">Confirmed</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-blue-100 text-blue-600 border-blue-200">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-600 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
          <h1 className="text-2xl font-bold">My Bookings</h1>
        </div>
        
        <div className="flex space-x-4 mb-4">
          <Button
            variant={activeTab === "passenger" ? "default" : "outline"}
            onClick={() => setActiveTab("passenger")}
            className="flex-1"
            data-testid="button-passenger-tab"
          >
            As Passenger
          </Button>
          <Button
            variant={activeTab === "driver" ? "default" : "outline"}
            onClick={() => setActiveTab("driver")}
            className="flex-1"
            data-testid="button-driver-tab"
          >
            Ride Requests
          </Button>
        </div>
      </div>
      
      <div className="px-6 space-y-4">
        {activeTab === "passenger" ? (
          bookings && bookings.length > 0 ? (
            bookings.map((booking: any) => (
              <Card key={booking.id}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        {booking.status === "completed" ? (
                          <Check className="text-green-600 text-xl" />
                        ) : (
                          <Clock className="text-blue-600 text-xl" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold" data-testid={`text-route-${booking.id}`}>
                          {booking.ride.fromLocation} → {booking.ride.toLocation}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(booking.ride.date).toLocaleDateString()}, {booking.ride.time}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {getStatusBadge(booking.status)}
                      <p className="text-sm text-gray-600 mt-1">₹{booking.totalPrice}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{booking.ride.driver.firstName} {booking.ride.driver.lastName}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{booking.seatsBooked} seat(s) booked</span>
                    </div>
                  </div>
                  
                  {booking.status === "pending" || booking.status === "confirmed" ? (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => cancelBookingMutation.mutate(booking.id)}
                        disabled={cancelBookingMutation.isPending}
                        data-testid={`button-cancel-${booking.id}`}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => shareRide(booking)}
                        data-testid={`button-share-${booking.id}`}
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Share Ride
                      </Button>
                    </div>
                  ) : booking.status === "completed" ? (
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>+50 points earned</span>
                      </div>
                      <Button variant="outline" size="sm" data-testid={`button-rate-${booking.id}`}>
                        Rate Ride
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No bookings found</p>
              <p className="text-sm">Start by finding a ride!</p>
            </div>
          )
        ) : (
          bookingRequests && bookingRequests.length > 0 ? (
            bookingRequests.map((request: any) => (
              <Card key={request.id}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <User className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <p className="font-semibold" data-testid={`text-passenger-${request.id}`}>
                          {request.passenger.firstName} {request.passenger.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {request.passenger.college} • {request.passenger.branch} • {request.passenger.year}
                        </p>
                        <p className="text-sm text-gray-600">
                          {request.ride.fromLocation} → {request.ride.toLocation}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {getStatusBadge(request.status)}
                      <p className="text-sm text-gray-600 mt-1">₹{request.totalPrice}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{request.seatsBooked} seat(s) requested</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(request.ride.date).toLocaleDateString()}, {request.ride.time}</span>
                    </div>
                  </div>
                  
                  {request.status === "pending" ? (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => updateBookingStatusMutation.mutate({ 
                          bookingId: request.id, 
                          status: "cancelled" 
                        })}
                        disabled={updateBookingStatusMutation.isPending}
                        data-testid={`button-decline-${request.id}`}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Decline
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => updateBookingStatusMutation.mutate({ 
                          bookingId: request.id, 
                          status: "confirmed" 
                        })}
                        disabled={updateBookingStatusMutation.isPending}
                        data-testid={`button-confirm-${request.id}`}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Confirm
                      </Button>
                    </div>
                  ) : request.status === "confirmed" ? (
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Request confirmed</span>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No booking requests</p>
              <p className="text-sm">Requests will appear when students book your rides!</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
