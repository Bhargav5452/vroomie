import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// Removed Replit auth import - now using session-based auth
import { insertRideSchema, insertBookingSchema } from "@shared/schema";
import { z } from "zod";

const LOCATIONS = [
  "VBIT", "Aurora", "Sreenidhi", "Anurag", "ACE", 
  "Ghatkesar", "ECIL", "Uppal", "Secunderabad"
];

const COLLEGES = ["VBIT", "Aurora", "Sreenidhi", "Anurag", "ACE"];
const YEARS = ["I", "II", "III", "IV"];
const BRANCHES = ["CSE", "ECE", "EEE", "MECH", "CIVIL"];

// Helper function to calculate buddy match percentage
function calculateBuddyMatch(passenger: any, driver: any): number {
  let score = 0;
  let total = 3;
  
  if (passenger.college === driver.college) score += 1;
  if (passenger.branch === driver.branch) score += 1;
  if (passenger.year === driver.year) score += 1;
  
  return Math.round((score / total) * 100);
}

// Helper function to calculate carbon savings (mock calculation)
function calculateCarbonSavings(distance: number, passengers: number): number {
  // Rough calculation: 0.2 kg CO2 per km per passenger saved
  const avgDistance = 15; // Average distance between locations
  return Math.round((avgDistance * 0.2 * passengers) * 100) / 100;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple session-based auth for manual registration
  app.use((req: any, res, next) => {
    if (!req.session) {
      req.session = {};
    }
    next();
  });

  // Manual registration routes
  app.post('/api/auth/register', async (req: any, res) => {
    try {
      const { email, studentId, firstName, lastName, college, year, branch } = req.body;
      
      // Validate required fields
      if (!email || !studentId || !firstName || !lastName || !college || !year || !branch) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Create new user with simple UUID-based ID
      const userId = studentId + '_' + Date.now(); // Simple ID generation
      await storage.upsertUser({
        id: userId,
        email,
        firstName,
        lastName,
        college,
        year,
        branch,
        vroomiePoints: 100, // Welcome bonus
        carbonSaved: "0",
        isVerified: true,
      });

      // Set session
      req.session.userId = userId;
      req.session.user = { 
        id: userId, 
        email, 
        firstName, 
        lastName, 
        college, 
        year, 
        branch 
      };

      res.json({ message: "Registration successful", user: req.session.user });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.get('/api/auth/user', async (req: any, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/auth/logout', (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Simple auth middleware for protected routes
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = { id: req.session.userId };
    next();
  };

  // User profile routes
  app.put('/api/user/profile', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updateData = req.body;
      
      // Validate input
      if (updateData.college && !COLLEGES.includes(updateData.college)) {
        return res.status(400).json({ message: "Invalid college" });
      }
      if (updateData.year && !YEARS.includes(updateData.year)) {
        return res.status(400).json({ message: "Invalid year" });
      }
      if (updateData.branch && !BRANCHES.includes(updateData.branch)) {
        return res.status(400).json({ message: "Invalid branch" });
      }
      
      const user = await storage.updateUserProfile(userId, updateData);
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Ride routes
  app.post('/api/rides', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Convert date string to Date object before validation
      const requestBody = {
        ...req.body,
        date: new Date(req.body.date)
      };
      
      const rideData = insertRideSchema.parse(requestBody);
      
      // Validate locations
      if (!LOCATIONS.includes(rideData.fromLocation) || !LOCATIONS.includes(rideData.toLocation)) {
        return res.status(400).json({ message: "Invalid location" });
      }
      
      // Calculate carbon savings
      const carbonSaved = calculateCarbonSavings(15, rideData.availableSeats);
      
      const ride = await storage.createRide({
        ...rideData,
        driverId: userId,
        carbonSaved: carbonSaved.toString(),
      });
      
      res.json(ride);
    } catch (error) {
      console.error("Error creating ride:", error);
      res.status(500).json({ message: "Failed to create ride" });
    }
  });

  app.get('/api/rides/search', requireAuth, async (req: any, res) => {
    try {
      const { from, to, time } = req.query;
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!from || !to) {
        return res.status(400).json({ message: "From and to locations are required" });
      }
      
      // If time is provided, calculate 1-hour window, otherwise get all rides for today and future
      let rides;
      if (time) {
        rides = await storage.getRidesByLocationAndTime(from as string, to as string, time as string);
      } else {
        rides = await storage.getRidesByLocation(from as string, to as string);
      }
      
      // Calculate buddy match for each ride and filter out user's own rides
      const ridesWithBuddyMatch = rides
        .filter(ride => ride.driverId !== userId)
        .map(ride => {
          const buddyMatch = user ? calculateBuddyMatch(user, ride.driver) : 0;
          const bookedSeats = ride.bookings
            .filter(b => b.status === 'confirmed')
            .reduce((sum, b) => sum + b.seatsBooked, 0);
          
          return {
            ...ride,
            buddyMatch,
            seatsLeft: ride.availableSeats - bookedSeats,
          };
        })
        .filter(ride => ride.seatsLeft > 0);
      
      res.json(ridesWithBuddyMatch);
    } catch (error) {
      console.error("Error searching rides:", error);
      res.status(500).json({ message: "Failed to search rides" });
    }
  });

  app.get('/api/rides/my-rides', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const rides = await storage.getUserRides(userId);
      res.json(rides);
    } catch (error) {
      console.error("Error fetching user rides:", error);
      res.status(500).json({ message: "Failed to fetch rides" });
    }
  });

  // Booking routes
  app.post('/api/bookings', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        passengerId: userId,
      });
      
      // Check if ride exists and has available seats
      const ride = await storage.getRideById(bookingData.rideId);
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }
      
      if (ride.driverId === userId) {
        return res.status(400).json({ message: "Cannot book your own ride" });
      }
      
      const bookedSeats = ride.bookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + b.seatsBooked, 0);
      
      if (bookedSeats + bookingData.seatsBooked > ride.availableSeats) {
        return res.status(400).json({ message: "Not enough seats available" });
      }
      
      const booking = await storage.createBooking(bookingData);
      
      // Create notification for driver
      await storage.createNotification({
        userId: ride.driverId,
        title: "New Ride Request",
        message: `Someone requested ${bookingData.seatsBooked} seat(s) for your ride from ${ride.fromLocation} to ${ride.toLocation}`,
        type: "booking_request",
        relatedRideId: ride.id,
        relatedBookingId: booking.id,
      });
      
      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get('/api/bookings/my-bookings', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bookings = await storage.getUserBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Get booking requests for driver's rides
  app.get('/api/bookings/requests', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userRides = await storage.getUserRides(userId);
      
      // Get all booking requests for user's rides
      const allRequests: any[] = [];
      for (const ride of userRides) {
        const requests = await storage.getBookingsByRide(ride.id);
        allRequests.push(...requests.map(request => ({
          ...request,
          ride: {
            ...ride,
            driver: ride.driver
          }
        })));
      }
      
      res.json(allRequests);
    } catch (error) {
      console.error("Error fetching booking requests:", error);
      res.status(500).json({ message: "Failed to fetch booking requests" });
    }
  });

  app.put('/api/bookings/:id/status', requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.id;
      
      if (!['confirmed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Get booking by ID directly
      const bookings = await storage.getBookingsByRide("");
      const booking = bookings.find(b => b.id === id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Verify user is the driver of the ride
      const ride = await storage.getRideById(booking.rideId);
      if (!ride || ride.driverId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      await storage.updateBookingStatus(id, status);
      
      // Create notification for passenger
      const notificationMessage = status === 'confirmed' 
        ? `Your ride request has been confirmed!`
        : `Your ride request has been cancelled.`;
      
      await storage.createNotification({
        userId: booking.passengerId,
        title: status === 'confirmed' ? "Ride Confirmed" : "Ride Cancelled",
        message: notificationMessage,
        type: status === 'confirmed' ? "booking_confirmed" : "booking_cancelled",
        relatedRideId: booking.rideId,
        relatedBookingId: booking.id,
      });
      
      // Award points for confirmed rides
      if (status === 'confirmed') {
        const user = await storage.getUser(booking.passengerId);
        if (user) {
          await storage.updateUserProfile(booking.passengerId, {
            vroomiePoints: (user.vroomiePoints || 0) + 50,
          });
        }
        
        const driver = await storage.getUser(ride.driverId);
        if (driver) {
          await storage.updateUserProfile(ride.driverId, {
            vroomiePoints: (driver.vroomiePoints || 0) + 30,
          });
        }
      }
      
      res.json({ message: "Booking status updated" });
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  // Leaderboard route
  app.get('/api/leaderboard', requireAuth, async (req: any, res) => {
    try {
      const leaderboard = await storage.getLeaderboard(10);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Notifications routes
  app.get('/api/notifications', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:id/read', requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.markNotificationAsRead(id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.get('/api/notifications/unread-count', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      res.status(500).json({ message: "Failed to fetch unread notification count" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
