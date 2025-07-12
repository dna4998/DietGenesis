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

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const insertProviderSchema = createInsertSchema(providers).omit({
  id: true,
  createdAt: true,
});

export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type UpdatePatient = z.infer<typeof updatePatientSchema>;
export type Patient = typeof patients.$inferSelect;
export type Provider = typeof providers.$inferSelect;
export type InsertProvider = z.infer<typeof insertProviderSchema>;
