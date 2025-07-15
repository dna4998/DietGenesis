import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  hasSubscription: boolean("has_subscription").default(false).notNull(),
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
  // HIPAA compliance fields
  hipaaConsentGiven: boolean("hipaa_consent_given").default(false),
  hipaaConsentDate: timestamp("hipaa_consent_date"),
  hipaaConsentVersion: text("hipaa_consent_version").default("1.0"),
  privacyPolicyAccepted: boolean("privacy_policy_accepted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const providers = pgTable("providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  specialty: text("specialty"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Session storage table for authentication
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  userType: text("user_type").notNull(), // 'patient' or 'provider'
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  providerId: integer("provider_id").notNull().references(() => providers.id),
  content: text("content").notNull(),
  messageType: text("message_type").notNull(), // 'text', 'pdf', 'video_link', 'pdf_link', 'lab_results', 'gut_biome_test', 'genetic_test', 'imaging_results', 'cardiology_report', 'general_report'
  fileUrl: text("file_url"), // For uploaded files or external links
  fileName: text("file_name"), // Original filename for uploads
  filePath: text("file_path"), // Server file path for uploaded files
  fileSize: integer("file_size"), // File size in bytes
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

// HIPAA Consent Records
export const hipaaConsents = pgTable("hipaa_consents", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  consentVersion: text("consent_version").notNull().default("1.0"),
  patientName: text("patient_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  consentToUse: boolean("consent_to_use").notNull(),
  consentToDisclosure: boolean("consent_to_disclosure").notNull(),
  consentToTreatment: boolean("consent_to_treatment").notNull(),
  consentToElectronicRecords: boolean("consent_to_electronic_records").notNull(),
  consentToSecureMessaging: boolean("consent_to_secure_messaging").notNull(),
  rightsAcknowledgment: boolean("rights_acknowledgment").notNull(),
  privacyPolicyRead: boolean("privacy_policy_read").notNull(),
  signature: text("signature").notNull(),
  signatureDate: text("signature_date").notNull(),
  witnessName: text("witness_name"),
  additionalComments: text("additional_comments"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit Log for HIPAA Compliance
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  userType: text("user_type").notNull(), // 'patient' or 'provider'
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: integer("resource_id"),
  details: text("details"), // JSON string
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Supplement recommendations table
export const supplementRecommendations = pgTable("supplement_recommendations", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  providerId: integer("provider_id").notNull().references(() => providers.id),
  thorneProductId: text("thorne_product_id").notNull(),
  productName: text("product_name").notNull(),
  dosage: text("dosage").notNull(),
  instructions: text("instructions").notNull(),
  duration: text("duration").notNull(), // e.g., "3 months", "6 weeks"
  reason: text("reason").notNull(), // Why this supplement was recommended
  priority: text("priority").notNull().default("medium"), // "high", "medium", "low"
  affiliateUrl: text("affiliate_url").notNull(), // Your practice's affiliate link
  productPrice: decimal("product_price", { precision: 8, scale: 2 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Provider affiliate settings table
export const providerAffiliateSettings = pgTable("provider_affiliate_settings", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => providers.id),
  thorneAffiliateId: text("thorne_affiliate_id").notNull(),
  affiliateCode: text("affiliate_code").notNull(),
  practiceUrl: text("practice_url"), // Custom practice URL from Thorne
  trackingEnabled: boolean("tracking_enabled").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertHipaaConsentSchema = createInsertSchema(hipaaConsents).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
});

export const insertSupplementRecommendationSchema = createInsertSchema(supplementRecommendations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProviderAffiliateSettingsSchema = createInsertSchema(providerAffiliateSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type HipaaConsent = typeof hipaaConsents.$inferSelect;
export type InsertHipaaConsent = z.infer<typeof insertHipaaConsentSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type SupplementRecommendation = typeof supplementRecommendations.$inferSelect;
export type InsertSupplementRecommendation = z.infer<typeof insertSupplementRecommendationSchema>;
export type ProviderAffiliateSettings = typeof providerAffiliateSettings.$inferSelect;
export type InsertProviderAffiliateSettings = z.infer<typeof insertProviderAffiliateSettingsSchema>;
