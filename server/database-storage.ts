import {
  patients,
  providers,
  messages,
  dexcomData,
  hipaaConsents,
  auditLogs,
  supplementRecommendations,
  providerAffiliateSettings,
  type Patient,
  type Provider,
  type Message,
  type InsertPatient,
  type UpdatePatient,
  type InsertProvider,
  type InsertMessage,
  type DexcomData,
  type InsertDexcomData,
  type HipaaConsent,
  type InsertHipaaConsent,
  type AuditLog,
  type InsertAuditLog,
  type SupplementRecommendation,
  type InsertSupplementRecommendation,
  type ProviderAffiliateSettings,
  type InsertProviderAffiliateSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { hashPassword, verifyPassword } from "./auth";

export interface IStorage {
  // Patient operations
  getPatient(id: number): Promise<Patient | undefined>;
  getPatientByEmail(email: string): Promise<Patient | undefined>;
  getAllPatients(): Promise<Patient[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: UpdatePatient): Promise<Patient | undefined>;
  deletePatient(id: number): Promise<boolean>;
  
  // Authentication operations
  registerPatient(data: { name: string; email: string; password: string; age: number; weight: number; weightGoal: number; bodyFat: number; bodyFatGoal: number; bloodPressure: string }): Promise<Patient>;
  loginPatient(email: string, password: string): Promise<Patient | null>;
  registerProvider(data: { name: string; email: string; password: string; specialty?: string }): Promise<Provider>;
  loginProvider(email: string, password: string): Promise<Provider | null>;

  // Provider operations
  getProvider(id: number): Promise<Provider | undefined>;
  getProviderByEmail(email: string): Promise<Provider | undefined>;
  getAllProviders(): Promise<Provider[]>;
  createProvider(provider: InsertProvider): Promise<Provider>;

  // Message operations
  getMessagesForPatient(patientId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(messageId: number): Promise<boolean>;

  // Subscription operations
  updatePatientSubscription(id: number, subscriptionData: {
    subscriptionStatus: string;
    subscriptionPlan?: string;
    paypalSubscriptionId?: string;
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
  }): Promise<Patient | undefined>;

  // Dexcom operations
  updatePatientDexcomTokens(id: number, tokens: {
    dexcomAccessToken: string;
    dexcomRefreshToken: string;
    dexcomTokenExpiry: Date;
  }): Promise<Patient | undefined>;
  getDexcomDataForPatient(patientId: number, hours?: number): Promise<DexcomData[]>;
  createDexcomData(data: InsertDexcomData): Promise<DexcomData>;
  createDexcomDataBatch(data: InsertDexcomData[]): Promise<DexcomData[]>;

  // HIPAA Consent operations
  createHipaaConsent(consentData: InsertHipaaConsent): Promise<HipaaConsent>;
  getHipaaConsentForPatient(patientId: number): Promise<HipaaConsent | undefined>;

  // Audit Log operations
  createAuditLog(logData: InsertAuditLog): Promise<AuditLog>;
  getAuditLogsForUser(userId: number, userType: string): Promise<AuditLog[]>;

  // Supplement Recommendation operations
  createSupplementRecommendation(recommendation: InsertSupplementRecommendation): Promise<SupplementRecommendation>;
  getSupplementRecommendationsForPatient(patientId: number): Promise<SupplementRecommendation[]>;
  updateSupplementRecommendation(id: number, updates: Partial<InsertSupplementRecommendation>): Promise<SupplementRecommendation | undefined>;
  deactivateSupplementRecommendation(id: number): Promise<boolean>;

  // Provider Affiliate Settings operations
  createProviderAffiliateSettings(settings: InsertProviderAffiliateSettings): Promise<ProviderAffiliateSettings>;
  getProviderAffiliateSettings(providerId: number): Promise<ProviderAffiliateSettings | undefined>;
  updateProviderAffiliateSettings(providerId: number, updates: Partial<InsertProviderAffiliateSettings>): Promise<ProviderAffiliateSettings | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Authentication operations
  async registerPatient(data: { name: string; email: string; password: string; age: number; weight: number; weightGoal: number; bodyFat: number; bodyFatGoal: number; bloodPressure: string }): Promise<Patient> {
    const hashedPassword = await hashPassword(data.password);
    
    const [patient] = await db
      .insert(patients)
      .values({
        ...data,
        password: hashedPassword,
        lastVisit: new Date().toLocaleDateString(),
      })
      .returning();
    
    return patient;
  }

  async loginPatient(email: string, password: string): Promise<Patient | null> {
    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.email, email));
    
    if (!patient) return null;
    
    const isValid = await verifyPassword(password, patient.password);
    return isValid ? patient : null;
  }

  async registerProvider(data: { name: string; email: string; password: string; specialty?: string }): Promise<Provider> {
    const hashedPassword = await hashPassword(data.password);
    
    const [provider] = await db
      .insert(providers)
      .values({
        ...data,
        password: hashedPassword,
      })
      .returning();
    
    return provider;
  }

  async loginProvider(email: string, password: string): Promise<Provider | null> {
    const [provider] = await db
      .select()
      .from(providers)
      .where(eq(providers.email, email));
    
    if (!provider) return null;
    
    const isValid = await verifyPassword(password, provider.password);
    return isValid ? provider : null;
  }

  // Patient operations
  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient;
  }

  async getPatientByEmail(email: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.email, email));
    return patient;
  }

  async getAllPatients(): Promise<Patient[]> {
    return await db.select().from(patients);
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const [patient] = await db.insert(patients).values(insertPatient).returning();
    return patient;
  }

  async updatePatient(id: number, updatePatient: UpdatePatient): Promise<Patient | undefined> {
    const [patient] = await db
      .update(patients)
      .set(updatePatient)
      .where(eq(patients.id, id))
      .returning();
    return patient;
  }

  async deletePatient(id: number): Promise<boolean> {
    const result = await db.delete(patients).where(eq(patients.id, id));
    return result.rowCount > 0;
  }

  // Provider operations
  async getProvider(id: number): Promise<Provider | undefined> {
    const [provider] = await db.select().from(providers).where(eq(providers.id, id));
    return provider;
  }

  async getProviderByEmail(email: string): Promise<Provider | undefined> {
    const [provider] = await db.select().from(providers).where(eq(providers.email, email));
    return provider;
  }

  async getAllProviders(): Promise<Provider[]> {
    return await db.select().from(providers);
  }

  async createProvider(insertProvider: InsertProvider): Promise<Provider> {
    const [provider] = await db.insert(providers).values(insertProvider).returning();
    return provider;
  }

  // Message operations
  async getMessagesForPatient(patientId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.patientId, patientId))
      .orderBy(desc(messages.createdAt));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async markMessageAsRead(messageId: number): Promise<boolean> {
    const result = await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, messageId));
    return result.rowCount > 0;
  }

  // Subscription operations
  async updatePatientSubscription(id: number, subscriptionData: {
    subscriptionStatus: string;
    subscriptionPlan?: string;
    paypalSubscriptionId?: string;
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
  }): Promise<Patient | undefined> {
    const hasSubscription = subscriptionData.subscriptionStatus === 'active';
    
    const [patient] = await db
      .update(patients)
      .set({
        ...subscriptionData,
        hasSubscription,
      })
      .where(eq(patients.id, id))
      .returning();
    
    return patient;
  }

  // Dexcom operations
  async updatePatientDexcomTokens(id: number, tokens: {
    dexcomAccessToken: string;
    dexcomRefreshToken: string;
    dexcomTokenExpiry: Date;
  }): Promise<Patient | undefined> {
    const [patient] = await db
      .update(patients)
      .set({
        ...tokens,
        dexcomConnected: true,
      })
      .where(eq(patients.id, id))
      .returning();
    
    return patient;
  }

  async getDexcomDataForPatient(patientId: number, hours: number = 24): Promise<DexcomData[]> {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return await db
      .select()
      .from(dexcomData)
      .where(eq(dexcomData.patientId, patientId))
      .orderBy(desc(dexcomData.timestamp));
  }

  async createDexcomData(insertData: InsertDexcomData): Promise<DexcomData> {
    const [data] = await db.insert(dexcomData).values(insertData).returning();
    return data;
  }

  async createDexcomDataBatch(insertDataArray: InsertDexcomData[]): Promise<DexcomData[]> {
    return await db.insert(dexcomData).values(insertDataArray).returning();
  }

  // HIPAA Consent operations
  async createHipaaConsent(consentData: InsertHipaaConsent): Promise<HipaaConsent> {
    const [consent] = await db.insert(hipaaConsents).values(consentData).returning();
    return consent;
  }

  async getHipaaConsentForPatient(patientId: number): Promise<HipaaConsent | undefined> {
    const [consent] = await db
      .select()
      .from(hipaaConsents)
      .where(eq(hipaaConsents.patientId, patientId))
      .orderBy(desc(hipaaConsents.createdAt))
      .limit(1);
    return consent;
  }

  // Audit Log operations
  async createAuditLog(logData: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db.insert(auditLogs).values(logData).returning();
    return log;
  }

  async getAuditLogsForUser(userId: number, userType: string): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(and(
        eq(auditLogs.userId, userId),
        eq(auditLogs.userType, userType)
      ))
      .orderBy(desc(auditLogs.timestamp))
      .limit(100);
  }

  // Supplement Recommendation operations
  async createSupplementRecommendation(recommendation: InsertSupplementRecommendation): Promise<SupplementRecommendation> {
    const [created] = await db
      .insert(supplementRecommendations)
      .values(recommendation)
      .returning();
    return created;
  }

  async getSupplementRecommendationsForPatient(patientId: number): Promise<SupplementRecommendation[]> {
    const recommendations = await db.select().from(supplementRecommendations)
      .where(and(eq(supplementRecommendations.patientId, patientId), eq(supplementRecommendations.isActive, true)))
      .orderBy(desc(supplementRecommendations.createdAt));
    return recommendations;
  }

  async updateSupplementRecommendation(id: number, updates: Partial<InsertSupplementRecommendation>): Promise<SupplementRecommendation | undefined> {
    const [updated] = await db
      .update(supplementRecommendations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(supplementRecommendations.id, id))
      .returning();
    return updated;
  }

  async deactivateSupplementRecommendation(id: number): Promise<boolean> {
    const result = await db
      .update(supplementRecommendations)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(supplementRecommendations.id, id));
    return result.rowCount > 0;
  }

  // Provider Affiliate Settings operations
  async createProviderAffiliateSettings(settings: InsertProviderAffiliateSettings): Promise<ProviderAffiliateSettings> {
    const [created] = await db
      .insert(providerAffiliateSettings)
      .values(settings)
      .returning();
    return created;
  }

  async getProviderAffiliateSettings(providerId: number): Promise<ProviderAffiliateSettings | undefined> {
    const [settings] = await db.select().from(providerAffiliateSettings)
      .where(eq(providerAffiliateSettings.providerId, providerId));
    return settings;
  }

  async updateProviderAffiliateSettings(providerId: number, updates: Partial<InsertProviderAffiliateSettings>): Promise<ProviderAffiliateSettings | undefined> {
    const [updated] = await db
      .update(providerAffiliateSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(providerAffiliateSettings.providerId, providerId))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();