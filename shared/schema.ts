import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  college: varchar("college"),
  year: varchar("year"), // I, II, III, IV
  branch: varchar("branch"), // CSE, ECE, etc.
  vroomiePoints: integer("vroomie_points").default(0),
  carbonSaved: decimal("carbon_saved", { precision: 10, scale: 2 }).default("0"),
  isVerified: boolean("is_verified").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Rides table
export const rides = pgTable("rides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  driverId: varchar("driver_id").notNull().references(() => users.id),
  fromLocation: varchar("from_location").notNull(),
  toLocation: varchar("to_location").notNull(),
  date: timestamp("date").notNull(),
  time: varchar("time").notNull(),
  availableSeats: integer("available_seats").notNull(),
  pricePerSeat: decimal("price_per_seat", { precision: 8, scale: 2 }).notNull(),
  isRecurring: boolean("is_recurring").default(false),
  recurringDays: text("recurring_days"), // JSON array of days
  carbonSaved: decimal("carbon_saved", { precision: 8, scale: 2 }).default("0"),
  status: varchar("status").default("active"), // active, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rideId: varchar("ride_id").notNull().references(() => rides.id),
  passengerId: varchar("passenger_id").notNull().references(() => users.id),
  seatsBooked: integer("seats_booked").notNull(),
  status: varchar("status").default("pending"), // pending, confirmed, cancelled, completed
  totalPrice: decimal("total_price", { precision: 8, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(), // booking_request, booking_confirmed, ride_update, etc.
  isRead: boolean("is_read").default(false),
  relatedRideId: varchar("related_ride_id").references(() => rides.id),
  relatedBookingId: varchar("related_booking_id").references(() => bookings.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ridesOffered: many(rides),
  bookings: many(bookings),
  notifications: many(notifications),
}));

export const ridesRelations = relations(rides, ({ one, many }) => ({
  driver: one(users, {
    fields: [rides.driverId],
    references: [users.id],
  }),
  bookings: many(bookings),
  notifications: many(notifications),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  ride: one(rides, {
    fields: [bookings.rideId],
    references: [rides.id],
  }),
  passenger: one(users, {
    fields: [bookings.passengerId],
    references: [users.id],
  }),
  notifications: many(notifications),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  ride: one(rides, {
    fields: [notifications.relatedRideId],
    references: [rides.id],
  }),
  booking: one(bookings, {
    fields: [notifications.relatedBookingId],
    references: [bookings.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  college: true,
  year: true,
  branch: true,
});

export const insertRideSchema = createInsertSchema(rides).omit({
  id: true,
  driverId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema> & {
  id: string;
};
export type User = typeof users.$inferSelect;
export type InsertRide = z.infer<typeof insertRideSchema>;
export type Ride = typeof rides.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Extended types for API responses
export type RideWithDriver = Ride & {
  driver: User;
  bookings: Booking[];
};

export type BookingWithRideAndDriver = Booking & {
  ride: Ride & {
    driver: User;
  };
  passenger: User;
};

export type NotificationWithRelations = Notification & {
  ride?: Ride;
  booking?: Booking;
};
