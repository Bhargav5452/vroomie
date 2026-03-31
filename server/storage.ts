import {
  users,
  rides,
  bookings,
  notifications,
  type User,
  type UpsertUser,
  type InsertRide,
  type Ride,
  type RideWithDriver,
  type InsertBooking,
  type Booking,
  type BookingWithRideAndDriver,
  type InsertNotification,
  type Notification,
  type NotificationWithRelations,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc, sql, or } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, data: Partial<User>): Promise<User>;
  getLeaderboard(limit?: number): Promise<User[]>;
  
  // Ride operations
  createRide(ride: InsertRide & { driverId: string }): Promise<Ride>;
  getRidesByLocation(from: string, to: string): Promise<RideWithDriver[]>;
  getRidesByLocationAndTime(from: string, to: string, time: string): Promise<RideWithDriver[]>;
  getRideById(id: string): Promise<RideWithDriver | undefined>;
  getUserRides(userId: string): Promise<RideWithDriver[]>;
  updateRideStatus(id: string, status: string): Promise<void>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getUserBookings(userId: string): Promise<BookingWithRideAndDriver[]>;
  getBookingsByRide(rideId: string): Promise<BookingWithRideAndDriver[]>;
  updateBookingStatus(id: string, status: string): Promise<void>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<NotificationWithRelations[]>;
  markNotificationAsRead(id: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUserProfile(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getLeaderboard(limit = 10): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.vroomiePoints))
      .limit(limit);
  }

  // Ride operations
  async createRide(rideData: InsertRide & { driverId: string }): Promise<Ride> {
    const [ride] = await db
      .insert(rides)
      .values(rideData)
      .returning();
    return ride;
  }

  async getRidesByLocation(from: string, to: string): Promise<RideWithDriver[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const query = db
      .select()
      .from(rides)
      .innerJoin(users, eq(rides.driverId, users.id))
      .leftJoin(bookings, eq(rides.id, bookings.rideId))
      .where(
        and(
          eq(rides.fromLocation, from),
          eq(rides.toLocation, to),
          eq(rides.status, "active"),
          gte(rides.date, today)
        )
      )
      .orderBy(asc(rides.date), asc(rides.time));

    const results = await query;
    
    // Group by ride and aggregate bookings
    const rideMap = new Map<string, RideWithDriver>();
    
    for (const result of results) {
      const rideId = result.rides.id;
      
      if (!rideMap.has(rideId)) {
        rideMap.set(rideId, {
          ...result.rides,
          driver: result.users,
          bookings: [],
        });
      }
      
      if (result.bookings) {
        rideMap.get(rideId)!.bookings.push(result.bookings);
      }
    }
    
    return Array.from(rideMap.values());
  }

  async getRidesByLocationAndTime(from: string, to: string, time: string): Promise<RideWithDriver[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Parse the time input (HH:MM format)
    const [hours, minutes] = time.split(':').map(Number);
    
    // Calculate 1-hour window (±1 hour from the specified time)
    const startTime = `${String(Math.max(0, hours - 1)).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    const endTime = `${String(Math.min(23, hours + 1)).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    
    const query = db
      .select()
      .from(rides)
      .innerJoin(users, eq(rides.driverId, users.id))
      .leftJoin(bookings, eq(rides.id, bookings.rideId))
      .where(
        and(
          eq(rides.fromLocation, from),
          eq(rides.toLocation, to),
          eq(rides.status, "active"),
          gte(rides.date, today),
          gte(rides.time, startTime),
          lte(rides.time, endTime)
        )
      )
      .orderBy(asc(rides.date), asc(rides.time));

    const results = await query;
    
    // Group by ride and aggregate bookings
    const rideMap = new Map<string, RideWithDriver>();
    
    for (const result of results) {
      const rideId = result.rides.id;
      
      if (!rideMap.has(rideId)) {
        rideMap.set(rideId, {
          ...result.rides,
          driver: result.users,
          bookings: [],
        });
      }
      
      if (result.bookings) {
        rideMap.get(rideId)!.bookings.push(result.bookings);
      }
    }
    
    return Array.from(rideMap.values());
  }

  async getRideById(id: string): Promise<RideWithDriver | undefined> {
    const results = await db
      .select()
      .from(rides)
      .innerJoin(users, eq(rides.driverId, users.id))
      .leftJoin(bookings, eq(rides.id, bookings.rideId))
      .where(eq(rides.id, id));

    if (results.length === 0) return undefined;

    const ride = results[0].rides;
    const driver = results[0].users;
    const allBookings = results
      .map(r => r.bookings)
      .filter((b): b is Booking => b !== null);

    return {
      ...ride,
      driver,
      bookings: allBookings,
    };
  }

  async getUserRides(userId: string): Promise<RideWithDriver[]> {
    const results = await db
      .select()
      .from(rides)
      .innerJoin(users, eq(rides.driverId, users.id))
      .leftJoin(bookings, eq(rides.id, bookings.rideId))
      .where(eq(rides.driverId, userId))
      .orderBy(desc(rides.createdAt));

    // Group by ride and aggregate bookings
    const rideMap = new Map<string, RideWithDriver>();
    
    for (const result of results) {
      const rideId = result.rides.id;
      
      if (!rideMap.has(rideId)) {
        rideMap.set(rideId, {
          ...result.rides,
          driver: result.users,
          bookings: [],
        });
      }
      
      if (result.bookings) {
        rideMap.get(rideId)!.bookings.push(result.bookings);
      }
    }
    
    return Array.from(rideMap.values());
  }

  async updateRideStatus(id: string, status: string): Promise<void> {
    await db
      .update(rides)
      .set({ status, updatedAt: new Date() })
      .where(eq(rides.id, id));
  }

  // Booking operations
  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values(bookingData)
      .returning();
    return booking;
  }

  async getUserBookings(userId: string): Promise<BookingWithRideAndDriver[]> {
    const results = await db
      .select()
      .from(bookings)
      .innerJoin(rides, eq(bookings.rideId, rides.id))
      .innerJoin(users, eq(rides.driverId, users.id))
      .where(eq(bookings.passengerId, userId))
      .orderBy(desc(bookings.createdAt));

    return results.map(result => ({
      ...result.bookings,
      ride: {
        ...result.rides,
        driver: result.users,
      },
      passenger: {} as User, // Will be filled by the caller if needed
    }));
  }

  async getBookingsByRide(rideId: string): Promise<BookingWithRideAndDriver[]> {
    let query = db
      .select()
      .from(bookings)
      .innerJoin(rides, eq(bookings.rideId, rides.id))
      .innerJoin(users, eq(bookings.passengerId, users.id))
      .orderBy(desc(bookings.createdAt));

    if (rideId) {
      query = query.where(eq(bookings.rideId, rideId)) as any;
    }

    const results = await query;

    return results.map(result => ({
      ...result.bookings,
      ride: {
        ...result.rides,
        driver: {} as User, // Will be filled by the caller if needed
      },
      passenger: result.users,
    }));
  }

  async updateBookingStatus(id: string, status: string): Promise<void> {
    await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, id));
  }

  // Notification operations
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(notificationData)
      .returning();
    return notification;
  }

  async getUserNotifications(userId: string): Promise<NotificationWithRelations[]> {
    const results = await db
      .select()
      .from(notifications)
      .leftJoin(rides, eq(notifications.relatedRideId, rides.id))
      .leftJoin(bookings, eq(notifications.relatedBookingId, bookings.id))
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));

    return results.map(result => ({
      ...result.notifications,
      ride: result.rides || undefined,
      booking: result.bookings || undefined,
    }));
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    
    return result.count;
  }
}

export const storage = new DatabaseStorage();
