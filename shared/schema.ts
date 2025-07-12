import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  age: integer("age").notNull(),
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(),
  weightGoal: decimal("weight_goal", { precision: 5, scale: 2 }).notNull(),
  bodyFat: decimal("body_fat", { precision: 4, scale: 1 }).notNull(),
  bodyFatGoal: decimal("body_fat_goal", { precision: 4, scale: 1 }).notNull(),
  insulinResistance: boolean("insulin_resistance").notNull().default(false),
  bloodPressure: text("blood_pressure").notNull(),
  lastVisit: text("last_visit").notNull(),
  dietPlan: text("diet_plan"),
  exercisePlan: text("exercise_plan"),
  supplements: text("supplements").array(),
  glp1Prescription: text("glp1_prescription"),
  weightLoss: decimal("weight_loss", { precision: 5, scale: 2 }).notNull().default('0'),
  adherence: integer("adherence").notNull().default(0),
  bloodSugar: text("blood_sugar").notNull().default('Normal'),
  subscriptionStatus: text("subscription_status").notNull().default('inactive'), // 'active', 'inactive', 'cancelled'
  subscriptionPlan: text("subscription_plan"), // 'monthly', 'yearly'
  paypalSubscriptionId: text("paypal_subscription_id"),
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  dexcomAccessToken: text("dexcom_access_token"),
  dexcomRefreshToken: text("dexcom_refresh_token"),
  dexcomTokenExpiry: timestamp("dexcom_token_expiry"),
  dexcomConnected: boolean("dexcom_connected").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const providers = pgTable("providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  specialty: text("specialty"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  providerId: integer("provider_id").notNull().references(() => providers.id),
  content: text("content").notNull(),
  messageType: text("message_type").notNull(), // 'text', 'pdf', 'video_link', 'pdf_link', 'lab_results', 'gut_biome_test'
  fileUrl: text("file_url"), // For uploaded files or external links
  fileName: text("file_name"), // Original filename for uploads
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dexcomData = pgTable("dexcom_data", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  glucoseValue: decimal("glucose_value", { precision: 5, scale: 1 }).notNull(), // mg/dL
  timestamp: timestamp("timestamp").notNull(),
  trend: text("trend"), // 'flat', 'fortyFiveUp', 'singleUp', 'doubleUp', 'fortyFiveDown', 'singleDown', 'doubleDown'
  trendRate: decimal("trend_rate", { precision: 5, scale: 2 }), // mg/dL/min
  displayTime: timestamp("display_time").notNull(),
  systemTime: timestamp("system_time").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  subscriptionStatus: true,
  subscriptionPlan: true,
  paypalSubscriptionId: true,
  subscriptionStartDate: true,
  subscriptionEndDate: true,
}).partial();

export const insertProviderSchema = createInsertSchema(providers).omit({
  id: true,
  createdAt: true,
});

export const insertDexcomDataSchema = createInsertSchema(dexcomData).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type UpdatePatient = z.infer<typeof updatePatientSchema>;
export type Patient = typeof patients.$inferSelect;
export type Provider = typeof providers.$inferSelect;
export type InsertProvider = z.infer<typeof insertProviderSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type DexcomData = typeof dexcomData.$inferSelect;
export type InsertDexcomData = z.infer<typeof insertDexcomDataSchema>;
