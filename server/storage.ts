import { patients, providers, type Patient, type Provider, type InsertPatient, type UpdatePatient, type InsertProvider } from "@shared/schema";

export interface IStorage {
  // Patient operations
  getPatient(id: number): Promise<Patient | undefined>;
  getPatientByEmail(email: string): Promise<Patient | undefined>;
  getAllPatients(): Promise<Patient[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: UpdatePatient): Promise<Patient | undefined>;
  deletePatient(id: number): Promise<boolean>;

  // Provider operations
  getProvider(id: number): Promise<Provider | undefined>;
  getProviderByEmail(email: string): Promise<Provider | undefined>;
  getAllProviders(): Promise<Provider[]>;
  createProvider(provider: InsertProvider): Promise<Provider>;
}

export class MemStorage implements IStorage {
  private patients: Map<number, Patient>;
  private providers: Map<number, Provider>;
  private currentPatientId: number;
  private currentProviderId: number;

  constructor() {
    this.patients = new Map();
    this.providers = new Map();
    this.currentPatientId = 1;
    this.currentProviderId = 1;

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
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
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
    };
    this.providers.set(id, provider);
    return provider;
  }
}

export const storage = new MemStorage();
