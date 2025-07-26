import type { Patient, Provider, Message } from "@shared/schema";
import { hashPassword, verifyPassword } from "./auth";

// Simple in-memory storage for quick login access
class SimpleStorage {
  private patients: Map<number, Patient> = new Map();
  private providers: Map<number, Provider> = new Map();
  private messages: Map<number, Message> = new Map();
  private currentPatientId = 1;
  private currentProviderId = 1;
  private currentMessageId = 1;

  constructor() {
    // Initialize with test data
    this.initializeTestData();
  }

  private async initializeTestData() {
    try {
      // Create test patient
      const testPatient: Patient = {
        id: 10,
        name: "Test Patient",
        email: "patient@test.com",
        password: await hashPassword("password123"),
        age: 30,
        weight: 160,
        weightGoal: 150,
        bodyFat: 25,
        bodyFatGoal: 20,
        bodyFatGoalDate: new Date(),
        bloodPressure: "120/80",
        bloodSugar: "Normal",
        insulinResistance: false,
        weightLoss: 5,
        dietPlan: "Mediterranean Diet",
        exercisePlan: "3x per week strength training",
        adherence: 85,
        healthStatus: "Good",
        hasSubscription: true,
        subscriptionStatus: "active",
        subscriptionPlan: "monthly",
        stripeCustomerId: null,
        paypalSubscriptionId: null,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null,
        profileImageUrl: null,
        glucoseTarget: "80-120",
        hipaaConsentGiven: true,
        hipaaConsentDate: new Date(),
        hipaaConsentVersion: "1.0",
        privacyPolicyAccepted: true,
        privacyPolicyDate: new Date(),
        privacyPolicyVersion: "1.0",
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Create test provider  
      const testProvider: Provider = {
        id: 3,
        name: "Dr. Ashok Mehta",
        email: "provider@test.com",
        password: await hashPassword("password123"),
        specialty: "Functional Medicine",
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null,
        createdAt: new Date()
      };

      this.patients.set(10, testPatient);
      this.providers.set(3, testProvider);
      this.currentPatientId = 11;
      this.currentProviderId = 4;

      console.log("Test data initialized successfully");
    } catch (error) {
      console.error("Error initializing test data:", error);
    }
  }

  // Patient operations
  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async getPatientByEmail(email: string): Promise<Patient | undefined> {
    for (const patient of this.patients.values()) {
      if (patient.email === email) {
        return patient;
      }
    }
    return undefined;
  }

  async getAllPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async loginPatient(email: string, password: string): Promise<Patient | null> {
    const patient = await this.getPatientByEmail(email);
    if (!patient) {
      return null;
    }

    const isValid = await verifyPassword(password, patient.password);
    if (!isValid) {
      return null;
    }

    return patient;
  }

  async registerPatient(data: {
    name: string;
    email: string;
    password: string;
    age: number;
    weight: number;
    weightGoal: number;
    bodyFat: number;
    bodyFatGoal: number;
    bloodPressure: string;
  }): Promise<Patient> {
    const hashedPassword = await hashPassword(data.password);
    const patient: Patient = {
      id: this.currentPatientId++,
      name: data.name,
      email: data.email,
      password: hashedPassword,
      age: data.age,
      weight: data.weight,
      weightGoal: data.weightGoal,
      bodyFat: data.bodyFat,
      bodyFatGoal: data.bodyFatGoal,
      bodyFatGoalDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      bloodPressure: data.bloodPressure,
      bloodSugar: "Normal",
      insulinResistance: false,
      weightLoss: 0,
      dietPlan: "To be assigned",
      exercisePlan: "To be assigned",
      adherence: 0,
      healthStatus: "Good",
      hasSubscription: false,
      subscriptionStatus: "inactive",
      subscriptionPlan: null,
      stripeCustomerId: null,
      paypalSubscriptionId: null,
      subscriptionStartDate: null,
      subscriptionEndDate: null,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: null,
      profileImageUrl: null,
      glucoseTarget: "80-120",
      hipaaConsentGiven: false,
      hipaaConsentDate: null,
      hipaaConsentVersion: null,
      privacyPolicyAccepted: false,
      privacyPolicyDate: null,
      privacyPolicyVersion: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.patients.set(patient.id, patient);
    return patient;
  }

  // Provider operations
  async getProvider(id: number): Promise<Provider | undefined> {
    return this.providers.get(id);
  }

  async getProviderByEmail(email: string): Promise<Provider | undefined> {
    for (const provider of this.providers.values()) {
      if (provider.email === email) {
        return provider;
      }
    }
    return undefined;
  }

  async loginProvider(email: string, password: string): Promise<Provider | null> {
    const provider = await this.getProviderByEmail(email);
    if (!provider) {
      return null;
    }

    const isValid = await verifyPassword(password, provider.password);
    if (!isValid) {
      return null;
    }

    return provider;
  }

  async registerProvider(data: {
    name: string;
    email: string;
    password: string;
    specialty?: string;
  }): Promise<Provider> {
    const hashedPassword = await hashPassword(data.password);
    const provider: Provider = {
      id: this.currentProviderId++,
      name: data.name,
      email: data.email,
      password: hashedPassword,
      specialty: data.specialty || null,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: null,
      createdAt: new Date()
    };

    this.providers.set(provider.id, provider);
    return provider;
  }

  // Message operations
  async getMessagesForPatient(patientId: number): Promise<Message[]> {
    const patientMessages = Array.from(this.messages.values())
      .filter(message => message.patientId === patientId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return patientMessages;
  }

  async createMessage(messageData: {
    content: string;
    patientId: number;
    providerId: number;
    messageType: string;
    direction: string;
    fileUrl?: string;
    fileName?: string;
    filePath?: string;
    fileSize?: number;
  }): Promise<Message> {
    const message: Message = {
      id: this.currentMessageId++,
      content: messageData.content,
      patientId: messageData.patientId,
      providerId: messageData.providerId,
      messageType: messageData.messageType,
      direction: messageData.direction,
      fileUrl: messageData.fileUrl || null,
      fileName: messageData.fileName || null,
      filePath: messageData.filePath || null,
      fileSize: messageData.fileSize || null,
      isRead: false,
      createdAt: new Date()
    };

    this.messages.set(message.id, message);
    return message;
  }

  async markMessageAsRead(messageId: number): Promise<boolean> {
    const message = this.messages.get(messageId);
    if (message) {
      message.isRead = true;
      return true;
    }
    return false;
  }

  // Subscription operations (simplified)
  async updatePatientSubscription(id: number, subscriptionData: {
    subscriptionStatus: string;
    subscriptionPlan?: string;
    paypalSubscriptionId?: string;
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
    stripeCustomerId?: string;
  }): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (patient) {
      patient.subscriptionStatus = subscriptionData.subscriptionStatus;
      patient.hasSubscription = subscriptionData.subscriptionStatus === 'active';
      if (subscriptionData.subscriptionPlan) patient.subscriptionPlan = subscriptionData.subscriptionPlan;
      if (subscriptionData.paypalSubscriptionId) patient.paypalSubscriptionId = subscriptionData.paypalSubscriptionId;
      if (subscriptionData.subscriptionStartDate) patient.subscriptionStartDate = subscriptionData.subscriptionStartDate;
      if (subscriptionData.subscriptionEndDate) patient.subscriptionEndDate = subscriptionData.subscriptionEndDate;
      if (subscriptionData.stripeCustomerId) patient.stripeCustomerId = subscriptionData.stripeCustomerId;
      patient.updatedAt = new Date();
      return patient;
    }
    return undefined;
  }

  // Additional operations with simple implementations
  async updatePatient(id: number, data: Partial<Patient>): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (patient) {
      Object.assign(patient, data);
      patient.updatedAt = new Date();
      return patient;
    }
    return undefined;
  }

  async createPatient(data: any): Promise<Patient> {
    return this.registerPatient(data);
  }

  async deletePatient(id: number): Promise<boolean> {
    return this.patients.delete(id);
  }

  async getAllProviders(): Promise<Provider[]> {
    return Array.from(this.providers.values());
  }

  async createProvider(data: any): Promise<Provider> {
    return this.registerProvider(data);
  }

  // Stub methods for compatibility
  async updateBackupCodes(id: number, type: string, codes: string[]): Promise<void> {
    if (type === 'patient') {
      const patient = this.patients.get(id);
      if (patient) {
        patient.twoFactorBackupCodes = codes;
      }
    } else {
      const provider = this.providers.get(id);
      if (provider) {
        provider.twoFactorBackupCodes = codes;
      }
    }
  }

  // Additional stub methods for API compatibility
  async getDexcomData(): Promise<any[]> { return []; }
  async createDexcomData(): Promise<any> { return null; }
  async getLatestGlucoseReading(): Promise<any> { return null; }
  async storePasswordResetToken(): Promise<any> { return null; }
  async getPasswordResetToken(): Promise<any> { return null; }
  async deletePasswordResetToken(): Promise<boolean> { return false; }
}

export const storage = new SimpleStorage();