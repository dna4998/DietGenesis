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
  },
  {
    id: "tip_016",
    title: "5-Minute Morning Flow",
    content: "Start your day with 5 minutes of stretching: neck rolls, shoulder shrugs, arm circles, and gentle spinal twists. This improves circulation and reduces morning stiffness.",
    category: "exercise",
    difficulty: "easy",
    estimatedTime: "5 min",
    personalizedFor: ["general", "joint_health", "back_pain"],
    priority: 8
  },
  {
    id: "tip_017",
    title: "Desk Break Squats",
    content: "Every hour, do 10 bodyweight squats at your desk. This activates your glutes, improves circulation, and counteracts prolonged sitting effects.",
    category: "exercise",
    difficulty: "easy",
    estimatedTime: "1 min",
    personalizedFor: ["desk_worker", "weight_loss", "general"],
    priority: 7
  },
  {
    id: "tip_018",
    title: "Wall Push-Up Power",
    content: "Do 10 wall push-ups right now. Stand arm's length from a wall, place palms flat against it, and push. Perfect for building upper body strength anywhere.",
    category: "exercise",
    difficulty: "easy",
    estimatedTime: "2 min",
    personalizedFor: ["muscle_building", "upper_body", "general"],
    priority: 6
  },
  {
    id: "tip_019",
    title: "Plank Challenge",
    content: "Hold a plank for 30 seconds. Start on your knees if needed. Planks strengthen your core, improve posture, and support lower back health.",
    category: "exercise",
    difficulty: "medium",
    estimatedTime: "1 min",
    personalizedFor: ["core_strength", "back_pain", "general"],
    priority: 7
  },
  {
    id: "tip_020",
    title: "Stair Climbing Boost",
    content: "Take the stairs instead of the elevator today. If you don't have stairs, do 20 step-ups on a sturdy chair or platform. Great cardio in small doses.",
    category: "exercise",
    difficulty: "easy",
    estimatedTime: "2-5 min",
    personalizedFor: ["cardio", "weight_loss", "general"],
    priority: 7
  },
  {
    id: "tip_021",
    title: "Resistance Band Magic",
    content: "If you have a resistance band, do 10 bicep curls and 10 tricep extensions. No band? Use a towel with tension for similar resistance training benefits.",
    category: "exercise",
    difficulty: "easy",
    estimatedTime: "3 min",
    personalizedFor: ["muscle_building", "upper_body", "general"],
    priority: 6
  },
  {
    id: "tip_022",
    title: "Walking Meditation",
    content: "Take a 10-minute mindful walk. Focus on each step, your breathing, and surroundings. This combines gentle exercise with stress reduction.",
    category: "exercise",
    difficulty: "easy",
    estimatedTime: "10 min",
    personalizedFor: ["stress", "mental_health", "general"],
    priority: 8
  },
  {
    id: "tip_023",
    title: "High-Intensity Interval (HIIT)",
    content: "Do 30 seconds of jumping jacks, rest 30 seconds, repeat 4 times. This 4-minute HIIT session boosts metabolism and improves cardiovascular health.",
    category: "exercise",
    difficulty: "advanced",
    estimatedTime: "4 min",
    personalizedFor: ["weight_loss", "cardio", "advanced_fitness"],
    priority: 8
  },
  {
    id: "tip_024",
    title: "Glute Activation",
    content: "Do 15 glute bridges while lying on your back. Squeeze your glutes at the top for 2 seconds. This strengthens your posterior chain and supports lower back health.",
    category: "exercise",
    difficulty: "easy",
    estimatedTime: "3 min",
    personalizedFor: ["back_pain", "glute_strength", "general"],
    priority: 7
  },
  {
    id: "tip_025",
    title: "Calf Raise Energy",
    content: "While brushing your teeth or waiting for coffee, do 20 calf raises. This improves lower leg circulation and strengthens your calves.",
    category: "exercise",
    difficulty: "easy",
    estimatedTime: "2 min",
    personalizedFor: ["circulation", "lower_body", "general"],
    priority: 6
  },
  {
    id: "tip_026",
    title: "Flexibility Flow",
    content: "Do a 5-minute stretching routine: touch your toes, reach overhead, twist your spine gently left and right, and stretch your hip flexors.",
    category: "exercise",
    difficulty: "easy",
    estimatedTime: "5 min",
    personalizedFor: ["flexibility", "joint_health", "general"],
    priority: 7
  },
  {
    id: "tip_027",
    title: "Cardio Burst",
    content: "Do 2 minutes of marching in place with high knees, followed by 1 minute of arm circles. This gets your heart rate up and energizes your body.",
    category: "exercise",
    difficulty: "easy",
    estimatedTime: "3 min",
    personalizedFor: ["cardio", "energy", "general"],
    priority: 6
  },
  {
    id: "tip_028",
    title: "Balance Challenge",
    content: "Stand on one foot for 30 seconds, then switch. Close your eyes to make it harder. Balance exercises improve stability and prevent falls.",
    category: "exercise",
    difficulty: "medium",
    estimatedTime: "2 min",
    personalizedFor: ["balance", "fall_prevention", "general"],
    priority: 6
  },
  {
    id: "tip_029",
    title: "Functional Movement",
    content: "Practice the 'sit-to-stand' exercise: sit in a chair and stand up without using your hands 10 times. This builds functional leg strength for daily activities.",
    category: "exercise",
    difficulty: "medium",
    estimatedTime: "2 min",
    personalizedFor: ["functional_fitness", "leg_strength", "general"],
    priority: 7
  },
  {
    id: "tip_030",
    title: "Active Recovery",
    content: "Do gentle arm swings and leg swings for 2 minutes. This active recovery improves blood flow and helps your muscles recover between workouts.",
    category: "exercise",
    difficulty: "easy",
    estimatedTime: "2 min",
    personalizedFor: ["recovery", "circulation", "general"],
    priority: 6
  }
];

export function getPatientHealthConditions(patient: Patient): string[] {
  const conditions: string[] = ["general"];
  
  // Weight-related conditions
  if (patient.weight && patient.weight > 200) {
    conditions.push("weight_loss", "cardio");
  }
  
  // Body fat related
  if (patient.bodyFat && patient.bodyFat > 25) {
    conditions.push("weight_loss", "muscle_building");
  }
  
  // Insulin resistance
  if (patient.insulinResistance === "Yes") {
    conditions.push("diabetes", "insulin_resistance", "cardio");
  }
  
  // Blood pressure related
  if (patient.bloodPressure && (patient.bloodPressure.includes("140") || patient.bloodPressure.includes("High"))) {
    conditions.push("heart_health", "stress", "cardio");
  }
  
  // Age-related conditions
  if (patient.age && patient.age > 50) {
    conditions.push("joint_health", "heart_health", "balance", "flexibility", "functional_fitness");
  }
  
  // Age-related for younger adults
  if (patient.age && patient.age < 40) {
    conditions.push("muscle_building", "advanced_fitness");
  }
  
  // Adherence related
  if (patient.adherence && patient.adherence < 70) {
    conditions.push("motivation", "stress");
  }
  
  // Exercise-specific conditions based on health metrics
  if (patient.weight && patient.bodyFat) {
    conditions.push("core_strength", "glute_strength");
  }
  
  // Add general fitness categories
  conditions.push("upper_body", "lower_body", "circulation", "energy", "flexibility");
  
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