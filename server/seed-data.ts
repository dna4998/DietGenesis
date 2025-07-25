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
        weight: "185.00",
        weightGoal: "170.00",
        bodyFat: "22.0",
        bodyFatGoal: "15.0",
        bloodPressure: "125/80",
        insulinResistance: true,
        lastVisit: "2024-01-15",
        dietPlan: "Mediterranean diet with intermittent fasting",
        exercisePlan: "3x strength training, 2x cardio per week",
        supplements: ["Omega-3", "Vitamin D3", "Magnesium"],
        adherence: 85,
        weightLoss: "8.5",
        bloodSugar: "Borderline"
      },
      {
        name: "Sarah Wilson",
        email: "sarah.wilson@email.com", 
        password: "password123",
        age: 28,
        weight: "145.00",
        weightGoal: "135.00",
        bodyFat: "25.0",
        bodyFatGoal: "20.0",
        bloodPressure: "118/75",
        insulinResistance: false,
        lastVisit: "2024-01-10",
        dietPlan: "Low-carb ketogenic diet",
        exercisePlan: "HIIT workouts 4x per week",
        supplements: ["Berberine", "Chromium", "Alpha-lipoic acid"],
        adherence: 92,
        weightLoss: "3.2",
        bloodSugar: "Normal"
      },
      {
        name: "Mikaiah Ferrell",
        email: "mikaiah.ferrell@email.com",
        password: "password123",
        age: 35,
        weight: "170.00",
        weightGoal: "160.00",
        bodyFat: "18.0",
        bodyFatGoal: "15.0",
        bloodPressure: "122/78",
        insulinResistance: false,
        lastVisit: "2024-01-20",
        dietPlan: "Balanced nutrition with portion control",
        exercisePlan: "Mixed cardio and resistance training 5x per week",
        supplements: ["Multivitamin", "Protein powder", "Fish oil"],
        adherence: 88,
        weightLoss: "5.1",
        bloodSugar: "Normal"
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
        password: "password123",
        specialty: "Functional Medicine & Metabolic Health"
      },
      {
        name: "Dr. Michael Rodriguez",
        email: "dr.michael@dnadietclub.com", 
        password: "password123",
        specialty: "Endocrinology & Weight Management"
      },
      {
        name: "Ashok Mehta",
        email: "amehta@mimclinic.com",
        password: "password123",
        specialty: "Internal Medicine & Diabetes Care"
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