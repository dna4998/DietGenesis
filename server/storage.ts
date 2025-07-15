import {
  patients,
  providers,
  messages,
  dexcomData,
  type Patient,
  type Provider,
  type Message,
  type InsertPatient,
  type UpdatePatient,
  type InsertProvider,
  type InsertMessage,
  type DexcomData,
  type InsertDexcomData,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
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

  constructor() {
    this.patients = new Map();
    this.providers = new Map();
    this.messages = new Map();
    this.dexcomData = new Map();
    this.currentPatientId = 1;
    this.currentProviderId = 1;
    this.currentMessageId = 1;
    this.currentDexcomDataId = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const samplePatients: InsertPatient[] = [
      {
        name: "John Doe",
        email: "john.doe@email.com",
        age: 42,
        weight: "200.00",
        weightGoal: "180.00",
        bodyFat: "30.0",
        bodyFatGoal: "20.0",
        insulinResistance: true,
        bloodPressure: "145/92",
        lastVisit: "2024-01-10",
        dietPlan: "Mediterranean-style low-carb with intermittent fasting",
        exercisePlan: "Strength training 3x/week + 30min daily cardio",
        supplements: ["Metabolic Health Complex", "Super EPA", "Vitamin D3"],
        glp1Prescription: "Semaglutide 0.25mg weekly",
        weightLoss: "12.00",
        adherence: 85,
        bloodSugar: "Improved"
      },
      {
        name: "Sarah Johnson",
        email: "sarah.j@email.com",
        age: 35,
        weight: "165.00",
        weightGoal: "145.00",
        bodyFat: "28.0",
        bodyFatGoal: "22.0",
        insulinResistance: false,
        bloodPressure: "120/80",
        lastVisit: "2024-01-08",
        dietPlan: "High-protein ketogenic diet",
        exercisePlan: "HIIT training + yoga",
        supplements: ["Omega-3", "Probiotics"],
        glp1Prescription: null,
        weightLoss: "8.00",
        adherence: 92,
        bloodSugar: "Normal"
      }
    ];

    samplePatients.forEach(patient => {
      this.createPatient(patient);
    });

    // Add sample provider
    this.createProvider({
      name: "Dr. Emily Chen",
      email: "dr.chen@dnadietclub.com",
      specialty: "Metabolic Health"
    });

    // Add sample messages
    const sampleMessages: InsertMessage[] = [
      {
        patientId: 1,
        providerId: 1,
        content: "Welcome to your DNA Diet Club journey! I've uploaded your personalized nutrition guide to help you get started.",
        messageType: "text",
        fileUrl: null,
        fileName: null,
        isRead: false,
      },
      {
        patientId: 1,
        providerId: 1,
        content: "Here's a helpful video about meal prep strategies for your metabolic health plan.",
        messageType: "video_link",
        fileUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        fileName: null,
        isRead: false,
      },
      {
        patientId: 2,
        providerId: 1,
        content: "Great progress on your weight loss! Here's your updated exercise routine focused on strength training.",
        messageType: "text",
        fileUrl: null,
        fileName: null,
        isRead: true,
      },
      {
        patientId: 1,
        providerId: 1,
        content: "Your latest lab results show significant improvement in metabolic markers. Insulin sensitivity has increased and inflammation markers are down.",
        messageType: "lab_results",
        fileUrl: "/uploads/john_doe_lab_results_2024.pdf",
        fileName: "Lab_Results_Jan_2024.pdf",
        isRead: false,
      },
      {
        patientId: 1,
        providerId: 1,
        content: "Gut biome analysis shows excellent diversity improvement since starting the prebiotic protocol. Continue current supplementation.",
        messageType: "gut_biome_test",
        fileUrl: "/uploads/john_doe_gut_biome_2024.pdf", 
        fileName: "Gut_Biome_Analysis_Jan_2024.pdf",
        isRead: false,
      }
    ];

    sampleMessages.forEach(message => {
      this.createMessage(message);
    });
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient;
  }

  async getPatientByEmail(email: string): Promise<Patient | undefined> {
    return Array.from(this.patients.values()).find(
      (patient) => patient.email === email,
    );
  }

  async getAllPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = this.currentPatientId++;
    const patient: Patient = {
      ...insertPatient,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      insulinResistance: insertPatient.insulinResistance ?? false,
      dietPlan: insertPatient.dietPlan ?? null,
      exercisePlan: insertPatient.exercisePlan ?? null,
      supplements: insertPatient.supplements ?? null,
      glp1Prescription: insertPatient.glp1Prescription ?? null,
      weightLoss: insertPatient.weightLoss ?? "0",
      adherence: insertPatient.adherence ?? 0,
      bloodSugar: insertPatient.bloodSugar ?? "Normal",
      // Initialize subscription fields
      subscriptionStatus: "inactive",
      subscriptionPlan: null,
      paypalSubscriptionId: null,
      subscriptionStartDate: null,
      subscriptionEndDate: null,
      // Initialize Dexcom fields
      dexcomAccessToken: null,
      dexcomRefreshToken: null,
      dexcomTokenExpiry: null,
    };
    this.patients.set(id, patient);
    return patient;
  }

  async updatePatient(id: number, updatePatient: UpdatePatient): Promise<Patient | undefined> {
    const existingPatient = this.patients.get(id);
    if (!existingPatient) {
      return undefined;
    }

    const updatedPatient: Patient = {
      ...existingPatient,
      ...updatePatient,
      updatedAt: new Date(),
    };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }

  async deletePatient(id: number): Promise<boolean> {
    return this.patients.delete(id);
  }

  async getProvider(id: number): Promise<Provider | undefined> {
    return this.providers.get(id);
  }

  async getProviderByEmail(email: string): Promise<Provider | undefined> {
    return Array.from(this.providers.values()).find(
      (provider) => provider.email === email,
    );
  }

  async getAllProviders(): Promise<Provider[]> {
    return Array.from(this.providers.values());
  }

  async createProvider(insertProvider: InsertProvider): Promise<Provider> {
    const id = this.currentProviderId++;
    const provider: Provider = {
      ...insertProvider,
      id,
      createdAt: new Date(),
      specialty: insertProvider.specialty ?? null,
    };
    this.providers.set(id, provider);
    return provider;
  }

  // Message operations
  async getMessagesForPatient(patientId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.patientId === patientId
    ).sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async markMessageAsRead(messageId: number): Promise<boolean> {
    const message = this.messages.get(messageId);
    if (!message) {
      return false;
    }
    const updatedMessage: Message = {
      ...message,
      isRead: true,
    };
    this.messages.set(messageId, updatedMessage);
    return true;
  }

  async updatePatientSubscription(id: number, subscriptionData: {
    subscriptionStatus: string;
    subscriptionPlan?: string;
    paypalSubscriptionId?: string;
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
  }): Promise<Patient | undefined> {
    const existingPatient = this.patients.get(id);
    if (!existingPatient) {
      return undefined;
    }

    const updatedPatient: Patient = {
      ...existingPatient,
      ...subscriptionData,
      updatedAt: new Date(),
    };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }

  // Dexcom operations
  async updatePatientDexcomTokens(id: number, tokens: {
    dexcomAccessToken: string;
    dexcomRefreshToken: string;
    dexcomTokenExpiry: Date;
  }): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (!patient) return undefined;

    const updatedPatient: Patient = {
      ...patient,
      dexcomAccessToken: tokens.dexcomAccessToken,
      dexcomRefreshToken: tokens.dexcomRefreshToken,
      dexcomTokenExpiry: tokens.dexcomTokenExpiry,
      dexcomConnected: true,
      updatedAt: new Date(),
    };

    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }

  async getDexcomDataForPatient(patientId: number, hours: number = 24): Promise<DexcomData[]> {
    const allData = Array.from(this.dexcomData.values());
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return allData
      .filter(data => data.patientId === patientId && new Date(data.timestamp) >= cutoffTime)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createDexcomData(insertData: InsertDexcomData): Promise<DexcomData> {
    const data: DexcomData = {
      id: this.currentDexcomDataId++,
      ...insertData,
      createdAt: new Date(),
    };

    this.dexcomData.set(data.id, data);
    return data;
  }

  async createDexcomDataBatch(insertDataArray: InsertDexcomData[]): Promise<DexcomData[]> {
    const createdData: DexcomData[] = [];
    
    for (const insertData of insertDataArray) {
      const data: DexcomData = {
        id: this.currentDexcomDataId++,
        ...insertData,
        createdAt: new Date(),
      };
      
      this.dexcomData.set(data.id, data);
      createdData.push(data);
    }
    
    return createdData;
  }
}

export const storage = new DatabaseStorage();
