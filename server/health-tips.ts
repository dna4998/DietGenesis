import type { Patient } from "@shared/schema";

export interface HealthTip {
  id: string;
  title: string;
  content: string;
  category: "nutrition" | "exercise" | "mental_health" | "sleep" | "hydration" | "general";
  difficulty: "easy" | "medium" | "advanced";
  estimatedTime: string;
  personalizedFor: string[];
  priority: number;
}

const healthTipsDatabase: HealthTip[] = [
  {
    id: "tip_001",
    title: "Start Your Day with Protein",
    content: "Eating 20-30g of protein within an hour of waking helps stabilize blood sugar and reduce cravings throughout the day. Try eggs, Greek yogurt, or a protein smoothie.",
    category: "nutrition",
    difficulty: "easy",
    estimatedTime: "5 min",
    personalizedFor: ["weight_loss", "muscle_building", "general"],
    priority: 8
  },
  {
    id: "tip_002",
    title: "The 2-Minute Walk Rule",
    content: "After every meal, take a 2-minute walk. This simple habit can reduce blood sugar spikes by up to 30% and improve digestion.",
    category: "exercise",
    difficulty: "easy",
    estimatedTime: "2 min",
    personalizedFor: ["diabetes", "insulin_resistance", "general"],
    priority: 9
  },
  {
    id: "tip_003",
    title: "Hydration Check",
    content: "Your urine should be pale yellow. If it's darker, increase your water intake. Add a pinch of sea salt to your water for better hydration.",
    category: "hydration",
    difficulty: "easy",
    estimatedTime: "1 min",
    personalizedFor: ["general"],
    priority: 7
  },
  {
    id: "tip_004",
    title: "Box Breathing for Stress",
    content: "Practice 4-4-4-4 breathing: inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat 4 times to activate your parasympathetic nervous system.",
    category: "mental_health",
    difficulty: "easy",
    estimatedTime: "2 min",
    personalizedFor: ["stress", "anxiety", "general"],
    priority: 8
  },
  {
    id: "tip_005",
    title: "Sleep Optimization Temperature",
    content: "Keep your bedroom between 65-68°F (18-20°C) for optimal sleep. Your body temperature naturally drops before sleep, and a cool room supports this process.",
    category: "sleep",
    difficulty: "easy",
    estimatedTime: "5 min",
    personalizedFor: ["sleep_issues", "general"],
    priority: 7
  },
  {
    id: "tip_006",
    title: "Omega-3 Boost",
    content: "Add 1 tablespoon of ground flaxseed or chia seeds to your meals today. These provide plant-based omega-3s that support brain and heart health.",
    category: "nutrition",
    difficulty: "easy",
    estimatedTime: "1 min",
    personalizedFor: ["inflammation", "heart_health", "general"],
    priority: 8
  },
  {
    id: "tip_007",
    title: "Posture Reset Timer",
    content: "Set a timer for every 30 minutes. When it goes off, stand up, roll your shoulders back, and do 5 deep breaths. This combats the effects of prolonged sitting.",
    category: "exercise",
    difficulty: "easy",
    estimatedTime: "1 min",
    personalizedFor: ["desk_worker", "back_pain", "general"],
    priority: 6
  },
  {
    id: "tip_008",
    title: "Mindful Eating Practice",
    content: "Chew each bite 20-30 times. This improves digestion, helps you recognize fullness cues, and can reduce overeating by up to 15%.",
    category: "nutrition",
    difficulty: "medium",
    estimatedTime: "During meals",
    personalizedFor: ["weight_loss", "digestion", "general"],
    priority: 7
  },
  {
    id: "tip_009",
    title: "Morning Sunlight Exposure",
    content: "Get 10-15 minutes of direct sunlight within 2 hours of waking. This helps regulate your circadian rhythm and improves sleep quality.",
    category: "sleep",
    difficulty: "easy",
    estimatedTime: "10 min",
    personalizedFor: ["sleep_issues", "mood", "general"],
    priority: 8
  },
  {
    id: "tip_010",
    title: "Gratitude Micro-Practice",
    content: "Before getting out of bed, think of 3 specific things you're grateful for. This simple practice can improve mood and reduce stress hormones.",
    category: "mental_health",
    difficulty: "easy",
    estimatedTime: "2 min",
    personalizedFor: ["stress", "depression", "general"],
    priority: 7
  },
  {
    id: "tip_011",
    title: "High-Fiber Breakfast",
    content: "Include 10g of fiber in your breakfast with berries, oats, or vegetables. Fiber helps stabilize blood sugar and supports gut health.",
    category: "nutrition",
    difficulty: "easy",
    estimatedTime: "5 min",
    personalizedFor: ["diabetes", "weight_loss", "digestion", "general"],
    priority: 8
  },
  {
    id: "tip_012",
    title: "Strength Training Reminder",
    content: "Do 10 bodyweight squats right now. Strength training maintains muscle mass and improves metabolism, even in small doses.",
    category: "exercise",
    difficulty: "easy",
    estimatedTime: "2 min",
    personalizedFor: ["muscle_building", "metabolism", "general"],
    priority: 6
  },
  {
    id: "tip_013",
    title: "Stress Reduction Technique",
    content: "Write down 3 things causing you stress today. For each one, identify one small action you can take. This reduces anxiety by creating actionable plans.",
    category: "mental_health",
    difficulty: "medium",
    estimatedTime: "5 min",
    personalizedFor: ["stress", "anxiety", "general"],
    priority: 7
  },
  {
    id: "tip_014",
    title: "Anti-Inflammatory Spice",
    content: "Add 1/2 teaspoon of turmeric to your food today. Curcumin in turmeric has powerful anti-inflammatory properties that support overall health.",
    category: "nutrition",
    difficulty: "easy",
    estimatedTime: "1 min",
    personalizedFor: ["inflammation", "joint_health", "general"],
    priority: 6
  },
  {
    id: "tip_015",
    title: "Digital Sunset",
    content: "Turn off all screens 1 hour before bedtime. Blue light suppresses melatonin production, making it harder to fall asleep naturally.",
    category: "sleep",
    difficulty: "medium",
    estimatedTime: "1 hour",
    personalizedFor: ["sleep_issues", "general"],
    priority: 8
  }
];

export function getPatientHealthConditions(patient: Patient): string[] {
  const conditions: string[] = ["general"];
  
  // Weight-related conditions
  if (patient.weight && patient.weight > 200) {
    conditions.push("weight_loss");
  }
  
  // Body fat related
  if (patient.bodyFat && patient.bodyFat > 25) {
    conditions.push("weight_loss");
  }
  
  // Insulin resistance
  if (patient.insulinResistance === "Yes") {
    conditions.push("diabetes", "insulin_resistance");
  }
  
  // Blood pressure related
  if (patient.bloodPressure && (patient.bloodPressure.includes("140") || patient.bloodPressure.includes("High"))) {
    conditions.push("heart_health", "stress");
  }
  
  // Age-related conditions
  if (patient.age && patient.age > 50) {
    conditions.push("joint_health", "heart_health");
  }
  
  // Adherence related
  if (patient.adherence && patient.adherence < 70) {
    conditions.push("motivation", "stress");
  }
  
  return [...new Set(conditions)]; // Remove duplicates
}

export function getDailyHealthTip(patient: Patient): HealthTip {
  const patientConditions = getPatientHealthConditions(patient);
  
  // Filter tips that are relevant to the patient
  const relevantTips = healthTipsDatabase.filter(tip => 
    tip.personalizedFor.some(condition => patientConditions.includes(condition))
  );
  
  // If no relevant tips found, use general tips
  const tipsToChooseFrom = relevantTips.length > 0 ? relevantTips : healthTipsDatabase;
  
  // Sort by priority and relevance, then pick based on current date
  const sortedTips = tipsToChooseFrom.sort((a, b) => {
    const aRelevance = a.personalizedFor.filter(condition => 
      patientConditions.includes(condition) && condition !== "general"
    ).length;
    const bRelevance = b.personalizedFor.filter(condition => 
      patientConditions.includes(condition) && condition !== "general"
    ).length;
    
    if (aRelevance !== bRelevance) {
      return bRelevance - aRelevance; // Higher relevance first
    }
    
    return b.priority - a.priority; // Higher priority first
  });
  
  // Use current date to pick a consistent tip for the day
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const tipIndex = (dayOfYear + patient.id) % sortedTips.length;
  
  return sortedTips[tipIndex];
}

export function generatePersonalizedHealthTips(patient: Patient, count: number = 5): HealthTip[] {
  const patientConditions = getPatientHealthConditions(patient);
  
  // Filter and score tips based on relevance
  const scoredTips = healthTipsDatabase.map(tip => {
    const relevanceScore = tip.personalizedFor.filter(condition => 
      patientConditions.includes(condition) && condition !== "general"
    ).length;
    
    return {
      ...tip,
      score: relevanceScore * 2 + tip.priority
    };
  });
  
  // Sort by score and return top tips
  return scoredTips
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}