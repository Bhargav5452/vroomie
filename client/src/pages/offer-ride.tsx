import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Leaf } from "lucide-react";
import CarbonBadge from "@/components/carbon-badge";

const LOCATIONS = [
  "VBIT", "Aurora", "Sreenidhi", "Anurag", "ACE", 
  "Ghatkesar", "ECIL", "Uppal", "Secunderabad"
];

const rideSchema = z.object({
  fromLocation: z.string().min(1, "Please select pickup location"),
  toLocation: z.string().min(1, "Please select destination"),
  date: z.string().min(1, "Please select date"),
  time: z.string().min(1, "Please select time"),
  availableSeats: z.string().min(1, "Please select number of seats"),
  pricePerSeat: z.string().min(1, "Please enter price"),
  isRecurring: z.boolean().default(false),
});

type RideFormData = z.infer<typeof rideSchema>;

export default function OfferRide() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<RideFormData>({
    resolver: zodResolver(rideSchema),
    defaultValues: {
      fromLocation: "",
      toLocation: "",
      date: "",
      time: "",
      availableSeats: "",
      pricePerSeat: "",
      isRecurring: false,
    },
  });

  const publishRideMutation = useMutation({
    mutationFn: async (data: RideFormData) => {
      const rideData = {
        fromLocation: data.fromLocation,
        toLocation: data.toLocation,
        date: `${data.date}T${data.time}:00.000Z`,
        time: data.time,
        availableSeats: parseInt(data.availableSeats),
        pricePerSeat: data.pricePerSeat,
        isRecurring: data.isRecurring,
        recurringDays: data.isRecurring ? JSON.stringify(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]) : null,
      };
      
      const response = await apiRequest("POST", "/api/rides", rideData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your ride has been published successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rides/my-rides"] });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to publish ride",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RideFormData) => {
    publishRideMutation.mutate(data);
  };

  const selectedSeats = form.watch("availableSeats");
  const carbonSaved = selectedSeats ? (parseInt(selectedSeats) * 3.2).toFixed(1) : "0";

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
          <h1 className="text-2xl font-bold">Offer a Ride</h1>
        </div>
      </div>
      
      <div className="px-6 space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Route Details</h3>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fromLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger data-testid="select-from">
                              <SelectValue placeholder="Select pickup location" />
                            </SelectTrigger>
                            <SelectContent>
                              {LOCATIONS.map((location) => (
                                <SelectItem key={location} value={location}>
                                  {location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="toLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>To</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger data-testid="select-to">
                              <SelectValue placeholder="Select destination" />
                            </SelectTrigger>
                            <SelectContent>
                              {LOCATIONS.map((location) => (
                                <SelectItem key={location} value={location}>
                                  {location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-date" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} data-testid="input-time" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Ride Details</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <FormField
                    control={form.control}
                    name="availableSeats"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Seats</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger data-testid="select-seats">
                              <SelectValue placeholder="Select seats" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="4">4</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="pricePerSeat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per seat</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                            <Input 
                              type="number" 
                              placeholder="50" 
                              className="pl-8"
                              {...field}
                              data-testid="input-price"
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-recurring"
                            />
                          </FormControl>
                          <FormLabel className="text-sm cursor-pointer">
                            Make this a recurring ride (Mon-Fri)
                          </FormLabel>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            <CarbonBadge carbonSaved={parseFloat(carbonSaved)} />
            
            <Button 
              type="submit" 
              className="w-full py-4 rounded-xl font-semibold"
              disabled={publishRideMutation.isPending}
              data-testid="button-publish"
            >
              {publishRideMutation.isPending ? "Publishing..." : "Publish Ride"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
