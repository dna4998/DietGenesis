import { storage } from "./database-storage";
import { hashPassword } from "./auth";

export async function seedDatabase() {
  try {
    // Check if data already exists
    const existingPatients = await storage.getAllPatients();
    const existingProviders = await storage.getAllProviders();
    
    if (existingPatients.length > 0 || existingProviders.length > 0) {
      console.log("Database already has data, skipping seed");
      return;
    }

    // Create sample patients
    console.log("Seeding database with sample data...");
    
    const samplePatients = [
      {
        name: "John Doe",
        email: "john.doe@email.com",
        password: "password123",
        age: 32,
        weight: 185,
        weightGoal: 170,
        bodyFat: 22,
        bodyFatGoal: 15,
        bloodPressure: "125/80",
        lastVisit: new Date().toLocaleDateString(),
        healthStatus: "Metabolically Healthy",
        insulinResistance: false,
        bloodSugar: "Normal",
        weightLoss: 8,
        adherence: 85,
        dexcomConnected: false,
        hasSubscription: true,
        subscriptionStatus: "active",
        dietPlan: "Low-carb Mediterranean approach with intermittent fasting",
        exercisePlan: "3x strength training, 2x cardio per week",
        supplements: ["Omega-3", "Vitamin D3", "Magnesium"],
        glp1Prescription: "Ozempic 0.5mg weekly"
      },
      {
        name: "Sarah Wilson",
        email: "sarah.wilson@email.com", 
        password: "password123",
        age: 28,
        weight: 145,
        weightGoal: 135,
        bodyFat: 25,
        bodyFatGoal: 20,
        bloodPressure: "118/75",
        lastVisit: new Date().toLocaleDateString(),
        healthStatus: "Pre-diabetic",
        insulinResistance: true,
        bloodSugar: "Elevated",
        weightLoss: 5,
        adherence: 92,
        dexcomConnected: false,
        hasSubscription: false,
        subscriptionStatus: "inactive",
        dietPlan: "Ketogenic diet with meal timing",
        exercisePlan: "HIIT workouts 4x per week",
        supplements: ["Berberine", "Chromium", "Alpha-lipoic acid"],
        glp1Prescription: null
      }
    ];

    for (const patientData of samplePatients) {
      await storage.registerPatient(patientData);
    }

    // Create sample provider
    const sampleProviders = [
      {
        name: "Dr. Emily Chen",
        email: "dr.emily@dnadietclub.com",
        password: "provider123",
        specialty: "Functional Medicine & Metabolic Health"
      },
      {
        name: "Dr. Michael Rodriguez",
        email: "dr.michael@dnadietclub.com", 
        password: "provider123",
        specialty: "Endocrinology & Weight Management"
      }
    ];

    for (const providerData of sampleProviders) {
      await storage.registerProvider(providerData);
    }

    console.log("Database seeded successfully!");
    
    // Create some sample messages
    const patients = await storage.getAllPatients();
    const providers = await storage.getAllProviders();
    
    if (patients.length > 0 && providers.length > 0) {
      const sampleMessages = [
        {
          patientId: patients[0].id,
          providerId: providers[0].id,
          content: "Welcome to DNA Diet Club! I've reviewed your initial assessment and created a personalized plan for you.",
          messageType: "text" as const,
          isRead: false,
        },
        {
          patientId: patients[0].id,
          providerId: providers[0].id,
          content: "https://www.youtube.com/watch?v=example123",
          messageType: "video_link" as const,
          isRead: false,
        }
      ];

      for (const messageData of sampleMessages) {
        await storage.createMessage(messageData);
      }
    }

  } catch (error) {
    console.error("Error seeding database:", error);
  }
}