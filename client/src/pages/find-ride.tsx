import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search } from "lucide-react";
import { useLocation } from "wouter";
import RideCard from "@/components/ride-card";

type RideWithDriver = {
  id: string;
  fromLocation: string;
  toLocation: string;
  date: string;
  time: string;
  availableSeats: number;
  pricePerSeat: string;
  buddyMatch: number;
  seatsLeft: number;
  driver: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    college: string | null;
    year: string | null;
    branch: string | null;
  };
};

const LOCATIONS = [
  "VBIT", "Aurora", "Sreenidhi", "Anurag", "ACE", 
  "Ghatkesar", "ECIL", "Uppal", "Secunderabad"
];

export default function FindRide() {
  const [, navigate] = useLocation();
  const [searchParams, setSearchParams] = useState({
    from: "",
    to: "",
    time: "",
  });

  const { data: rides, isLoading, refetch } = useQuery<RideWithDriver[]>({
    queryKey: ["/api/rides/search", searchParams.from, searchParams.to, searchParams.time],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: searchParams.from,
        to: searchParams.to,
      });
      if (searchParams.time) {
        params.append('time', searchParams.time);
      }
      
      const response = await fetch(`/api/rides/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch rides');
      }
      return response.json();
    },
    enabled: false, // Only search when user clicks search
  });

  const handleSearch = () => {
    if (searchParams.from && searchParams.to) {
      refetch();
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
          <h1 className="text-2xl font-bold">Find a Ride</h1>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Select 
              value={searchParams.from} 
              onValueChange={(value) => setSearchParams(prev => ({ ...prev, from: value }))}
            >
              <SelectTrigger className="text-sm" data-testid="select-from">
                <SelectValue placeholder="From" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={searchParams.to} 
              onValueChange={(value) => setSearchParams(prev => ({ ...prev, to: value }))}
            >
              <SelectTrigger className="text-sm" data-testid="select-to">
                <SelectValue placeholder="To" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input 
              type="time" 
              value={searchParams.time}
              onChange={(e) => setSearchParams(prev => ({ ...prev, time: e.target.value }))}
              className="text-sm"
              placeholder="Optional"
              data-testid="input-time"
            />
          </div>
          
          <Button 
            onClick={handleSearch}
            className="w-full py-3 rounded-xl font-medium"
            data-testid="button-search"
          >
            <Search className="w-4 h-4 mr-2" />
            Search Rides
          </Button>
        </div>
      </div>
      
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Available Rides</h3>
          <span className="text-sm text-gray-600" data-testid="text-results-count">
            {rides?.length || 0} found
          </span>
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p>Searching for rides...</p>
            </div>
          ) : rides && rides.length > 0 ? (
            rides.map((ride) => (
              <RideCard key={ride.id} ride={ride} />
            ))
          ) : searchParams.from && searchParams.to ? (
            <div className="text-center py-8 text-gray-500">
              <p>No rides found for this route</p>
              <p className="text-sm">Try searching for a different time or location</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Enter your route to search for rides</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
