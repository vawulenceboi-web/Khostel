import { sql } from 'drizzle-orm'
import {
  pgTable,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { z } from 'zod'

// Users table
export const users = pgTable('users', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  email: varchar('email').unique().notNull(),
  passwordHash: varchar('password_hash').notNull(),
  firstName: varchar('first_name').notNull(),
  lastName: varchar('last_name'),
  phone: varchar('phone'),
  role: varchar('role', { enum: ['student', 'agent', 'admin'] }).notNull().default('student'),
  schoolId: varchar('school_id'),
  verifiedStatus: boolean('verified_status').default(false),
  businessRegNumber: varchar('business_reg_number'), // CAC number for agents
  profileImage: varchar('profile_image'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Schools table
export const schools = pgTable('schools', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name').notNull(),
  city: varchar('city').notNull(),
  state: varchar('state').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

// Locations/Areas around schools
export const locations = pgTable('locations', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar('school_id').notNull().references(() => schools.id),
  name: varchar('name').notNull(), // e.g., "Westend", "Safari", "Chapel Road"
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  createdAt: timestamp('created_at').defaultNow(),
})

// Hostels table
export const hostels = pgTable('hostels', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar('agent_id').notNull().references(() => users.id),
  locationId: varchar('location_id').notNull().references(() => locations.id),
  title: varchar('title').notNull(),
  description: text('description'),
  price: integer('price').notNull(), // Price in Naira
  priceType: varchar('price_type', { enum: ['semester', 'year'] }).notNull().default('semester'),
  roomType: varchar('room_type', { enum: ['single', 'shared', 'self-contain'] }).notNull(),
  images: jsonb('images').$type<string[]>().default([]), // Array of image URLs
  amenities: jsonb('amenities').$type<string[]>().default([]), // Array of amenities
  availability: boolean('availability').default(true),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Bookings table
export const bookings = pgTable('bookings', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar('student_id').notNull().references(() => users.id),
  hostelId: varchar('hostel_id').notNull().references(() => hostels.id),
  preferredDate: timestamp('preferred_date'),
  preferredTime: varchar('preferred_time'),
  message: text('message'),
  status: varchar('status', { enum: ['pending', 'confirmed', 'viewed', 'cancelled'] }).notNull().default('pending'),
  agentNotes: text('agent_notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  school: one(schools, {
    fields: [users.schoolId],
    references: [schools.id],
  }),
  hostels: many(hostels),
  bookings: many(bookings),
}))

export const schoolsRelations = relations(schools, ({ many }) => ({
  users: many(users),
  locations: many(locations),
}))

export const locationsRelations = relations(locations, ({ one, many }) => ({
  school: one(schools, {
    fields: [locations.schoolId],
    references: [schools.id],
  }),
  hostels: many(hostels),
}))

export const hostelsRelations = relations(hostels, ({ one, many }) => ({
  agent: one(users, {
    fields: [hostels.agentId],
    references: [users.id],
  }),
  location: one(locations, {
    fields: [hostels.locationId],
    references: [locations.id],
  }),
  bookings: many(bookings),
}))

export const bookingsRelations = relations(bookings, ({ one }) => ({
  student: one(users, {
    fields: [bookings.studentId],
    references: [users.id],
  }),
  hostel: one(hostels, {
    fields: [bookings.hostelId],
    references: [hostels.id],
  }),
}))

// Types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type School = typeof schools.$inferSelect
export type NewSchool = typeof schools.$inferInsert

export type Location = typeof locations.$inferSelect
export type NewLocation = typeof locations.$inferInsert

export type Hostel = typeof hostels.$inferSelect
export type NewHostel = typeof hostels.$inferInsert

export type Booking = typeof bookings.$inferSelect
export type NewBooking = typeof bookings.$inferInsert

// Validation schemas
export const registerUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(['student', 'agent']).default('student'),
  schoolId: z.string().optional(),
  businessRegNumber: z.string().optional(),
  address: z.string().optional(),
  profileImageUrl: z.string().url().optional(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  }),
}).refine((data) => {
  // Enhanced validation for agents
  if (data.role === 'agent') {
    return (
      data.businessRegNumber && 
      data.businessRegNumber.match(/^RC\d{6,7}$/) &&
      data.address &&
      data.phone &&
      data.lastName
    )
  }
  return true
}, {
  message: 'Agents must provide valid CAC number (RC format), address, phone, and last name',
  path: ['businessRegNumber']
})

// Admin login schema (hardcoded credentials)
export const adminLoginSchema = z.object({
  email: z.string().email('Valid admin email is required'),
  password: z.string().min(1, 'Password is required'),
})

export const createHostelSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  priceType: z.enum(['semester', 'year']).default('semester'),
  roomType: z.enum(['single', 'shared', 'self-contain']),
  locationId: z.string(),
  images: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  address: z.string().optional(),
})

export const createBookingSchema = z.object({
  hostelId: z.string(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  message: z.string().optional(),
})