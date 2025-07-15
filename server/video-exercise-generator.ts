import OpenAI from "openai";
import { Patient } from "@shared/schema";

const openai = new OpenAI({ baseURL: "https://api.x.ai/v1", apiKey: process.env.XAI_API_KEY });

export interface ExercisePreferences {
  goals: string[]; // weight_loss, insulin_resistance, resistance_training, stationary_bike
  intensity: 'beginner' | 'intermediate' | 'advanced';
  timePerSession: number; // minutes
  availableEquipment: string[];
  injuries: string[];
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'flexible';
}

export interface DailyExercise {
  day: string;
  type: string;
  duration: number;
  exercises: ExerciseVideo[];
  warmUp: ExerciseVideo;
  coolDown: ExerciseVideo;
  notes: string;
}

export interface ExerciseVideo {
  name: string;
  description: string;
  duration: string;
  videoUrl: string;
  intensity: string;
  targetMuscles: string[];
  modifications: string[];
}

export interface VideoExercisePlanResponse {
  plan: {
    summary: string;
    weeklyOverview: string;
    totalDuration: number;
    dailyPlans: DailyExercise[];
    progressionTips: string[];
    safetyGuidelines: string[];
    equipmentList: string[];
  };
}

// Curated YouTube video database for reliable links
const EXERCISE_VIDEOS = {
  warmup: [
    {
      name: "5-Minute Dynamic Warm-Up",
      description: "Full body dynamic warm-up to prepare for workout",
      duration: "5 minutes",
      videoUrl: "https://www.youtube.com/watch?v=v_0wONJdYrs",
      intensity: "Low",
      targetMuscles: ["Full Body"],
      modifications: ["Reduce range of motion", "Slower pace"]
    },
    {
      name: "10-Minute Total Body Warm-Up",
      description: "Comprehensive warm-up routine for all fitness levels",
      duration: "10 minutes", 
      videoUrl: "https://www.youtube.com/watch?v=WYaJSc26eQo",
      intensity: "Low",
      targetMuscles: ["Full Body"],
      modifications: ["Skip jumping movements", "Seated options"]
    }
  ],
  cooldown: [
    {
      name: "10-Minute Full Body Stretch",
      description: "Relaxing stretch routine for post-workout recovery",
      duration: "10 minutes",
      videoUrl: "https://www.youtube.com/watch?v=g_tea8ZNk5A",
      intensity: "Low",
      targetMuscles: ["Full Body"],
      modifications: ["Use wall for support", "Reduce stretch depth"]
    },
    {
      name: "15-Minute Deep Stretch",
      description: "Deep stretching routine for flexibility and recovery",
      duration: "15 minutes",
      videoUrl: "https://www.youtube.com/watch?v=qULTwquOuT4",
      intensity: "Low",
      targetMuscles: ["Full Body"],
      modifications: ["Use props for support", "Hold stretches shorter"]
    }
  ],
  cardio: [
    {
      name: "20-Minute HIIT Cardio",
      description: "High-intensity interval training for fat burning",
      duration: "20 minutes",
      videoUrl: "https://www.youtube.com/watch?v=m1ygdsVxhJM",
      intensity: "High",
      targetMuscles: ["Cardiovascular"],
      modifications: ["Lower impact options", "Extended rest periods"]
    },
    {
      name: "30-Minute Low Impact Cardio",
      description: "Joint-friendly cardio workout for all fitness levels",
      duration: "30 minutes",
      videoUrl: "https://www.youtube.com/watch?v=2vJlWgZJYf4",
      intensity: "Moderate",
      targetMuscles: ["Cardiovascular"],
      modifications: ["Seated modifications", "Arm movements only"]
    }
  ],
  strength: [
    {
      name: "30-Minute Full Body Strength",
      description: "Complete strength training workout using bodyweight",
      duration: "30 minutes",
      videoUrl: "https://www.youtube.com/watch?v=UBMk30rjy0o",
      intensity: "Moderate",
      targetMuscles: ["Full Body"],
      modifications: ["Use lighter weights", "Reduce repetitions"]
    },
    {
      name: "20-Minute Resistance Band Workout",
      description: "Full body strength training with resistance bands",
      duration: "20 minutes",
      videoUrl: "https://www.youtube.com/watch?v=9HDGrHIHm_g",
      intensity: "Moderate",
      targetMuscles: ["Full Body"],
      modifications: ["Lighter resistance", "Fewer sets"]
    }
  ],
  bike: [
    {
      name: "25-Minute Stationary Bike HIIT",
      description: "High-intensity interval training on stationary bike",
      duration: "25 minutes",
      videoUrl: "https://www.youtube.com/watch?v=KJhGklFKHyE",
      intensity: "High",
      targetMuscles: ["Legs", "Cardiovascular"],
      modifications: ["Lower resistance", "Longer recovery periods"]
    },
    {
      name: "45-Minute Steady State Cycling",
      description: "Moderate intensity cycling for endurance",
      duration: "45 minutes",
      videoUrl: "https://www.youtube.com/watch?v=FVIIkGz6tus",
      intensity: "Moderate",
      targetMuscles: ["Legs", "Cardiovascular"],
      modifications: ["Shorter duration", "Lower resistance"]
    }
  ],
  flexibility: [
    {
      name: "20-Minute Yoga Flow",
      description: "Gentle yoga flow for flexibility and relaxation",
      duration: "20 minutes",
      videoUrl: "https://www.youtube.com/watch?v=v7AYKMP6rOE",
      intensity: "Low",
      targetMuscles: ["Full Body"],
      modifications: ["Use blocks/straps", "Chair modifications"]
    }
  ]
};

function selectVideosForGoals(goals: string[], intensity: string): ExerciseVideo[] {
  const selectedVideos: ExerciseVideo[] = [];
  
  if (goals.includes('weight_loss')) {
    selectedVideos.push(...EXERCISE_VIDEOS.cardio);
  }
  
  if (goals.includes('resistance_training')) {
    selectedVideos.push(...EXERCISE_VIDEOS.strength);
  }
  
  if (goals.includes('stationary_bike')) {
    selectedVideos.push(...EXERCISE_VIDEOS.bike);
  }
  
  if (goals.includes('insulin_resistance')) {
    // Add both cardio and strength for insulin sensitivity
    selectedVideos.push(...EXERCISE_VIDEOS.cardio);
    selectedVideos.push(...EXERCISE_VIDEOS.strength);
  }
  
  // Filter by intensity if needed
  return selectedVideos.filter(video => {
    if (intensity === 'beginner') return video.intensity !== 'High';
    if (intensity === 'advanced') return video.intensity !== 'Low';
    return true;
  });
}

export async function generateVideoExercisePlan(
  patient: Patient,
  preferences: ExercisePreferences
): Promise<VideoExercisePlanResponse> {
  try {
    console.log("Generating 7-day exercise plan with videos...");
    
    // Use XAI (Grok) to generate personalized exercise plan
    const prompt = `Create a personalized 7-day exercise plan for this patient:

Patient Profile:
- Weight: ${patient.weight} lbs
- Weight Goal: ${patient.weightGoal} lbs  
- Body Fat: ${patient.bodyFat}%
- Body Fat Goal: ${patient.bodyFatGoal}%
- Blood Pressure: ${patient.bloodPressure}
- Insulin Resistance: ${patient.insulinResistance ? 'Yes' : 'No'}

Exercise Preferences:
- Goals: ${preferences.goals.join(', ')}
- Intensity Level: ${preferences.intensity}
- Time Per Session: ${preferences.timePerSession} minutes
- Available Equipment: ${preferences.availableEquipment.join(', ')}
- Injuries/Limitations: ${preferences.injuries.join(', ') || 'None'}
- Preferred Time: ${preferences.preferredTime}

Create a comprehensive 7-day exercise plan in JSON format:
{
  "summary": "Brief overview of the weekly plan and its benefits",
  "weeklyOverview": "Description of how the week is structured",
  "totalDuration": "Total weekly exercise time in minutes",
  "progressionTips": ["tip1", "tip2", "tip3"],
  "safetyGuidelines": ["guideline1", "guideline2", "guideline3"],
  "equipmentList": ["equipment1", "equipment2"],
  "dailyStructure": [
    {
      "day": "Monday",
      "type": "Strength Training",
      "duration": 30,
      "description": "Full body strength workout focusing on major muscle groups",
      "notes": "Start with lighter weights and focus on form"
    }
  ]
}

Focus on:
1. Weight loss and metabolic health
2. Insulin sensitivity improvement
3. Muscle preservation and strength
4. Cardiovascular fitness
5. Sustainable progression
6. Safety considerations for the patient's profile`;

    const response = await openai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content: "You are an expert exercise physiologist creating personalized workout plans. Focus on evidence-based recommendations for metabolic health, weight management, and insulin sensitivity."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const aiResult = JSON.parse(response.choices[0].message.content || '{}');
    
    // Get appropriate videos based on goals
    const availableVideos = selectVideosForGoals(preferences.goals, preferences.intensity);
    
    // Create daily plans with video assignments
    const dailyPlans: DailyExercise[] = [];
    
    for (let i = 0; i < 7; i++) {
      const dayStructure = aiResult.dailyStructure?.[i] || {
        day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i],
        type: 'Rest Day',
        duration: 0,
        description: 'Active recovery day',
        notes: 'Light stretching or walking'
      };
      
      let exercises: ExerciseVideo[] = [];
      let warmUp = EXERCISE_VIDEOS.warmup[0];
      let coolDown = EXERCISE_VIDEOS.cooldown[0];
      
      if (dayStructure.type !== 'Rest Day' && availableVideos.length > 0) {
        // Select appropriate videos for the day
        if (dayStructure.type.toLowerCase().includes('strength') || dayStructure.type.toLowerCase().includes('resistance')) {
          exercises = EXERCISE_VIDEOS.strength.slice(0, 1);
        } else if (dayStructure.type.toLowerCase().includes('cardio') || dayStructure.type.toLowerCase().includes('hiit')) {
          exercises = EXERCISE_VIDEOS.cardio.slice(0, 1);
        } else if (dayStructure.type.toLowerCase().includes('bike') || dayStructure.type.toLowerCase().includes('cycling')) {
          exercises = EXERCISE_VIDEOS.bike.slice(0, 1);
        } else if (dayStructure.type.toLowerCase().includes('flexibility') || dayStructure.type.toLowerCase().includes('yoga')) {
          exercises = EXERCISE_VIDEOS.flexibility.slice(0, 1);
        } else {
          // Default to cardio
          exercises = EXERCISE_VIDEOS.cardio.slice(0, 1);
        }
        
        // Add rest day with flexibility
        if (i === 6) { // Sunday
          exercises = EXERCISE_VIDEOS.flexibility.slice(0, 1);
          warmUp = EXERCISE_VIDEOS.warmup[1];
          coolDown = EXERCISE_VIDEOS.cooldown[1];
        }
      }
      
      dailyPlans.push({
        day: dayStructure.day,
        type: dayStructure.type,
        duration: dayStructure.duration || 0,
        exercises: exercises,
        warmUp: warmUp,
        coolDown: coolDown,
        notes: dayStructure.notes || dayStructure.description || "Follow the video instructions carefully"
      });
    }
    
    return {
      plan: {
        summary: aiResult.summary || "Comprehensive 7-day exercise plan designed for your fitness goals",
        weeklyOverview: aiResult.weeklyOverview || "Balanced mix of strength training, cardio, and recovery",
        totalDuration: aiResult.totalDuration || preferences.timePerSession * 5,
        dailyPlans: dailyPlans,
        progressionTips: Array.isArray(aiResult.progressionTips) ? aiResult.progressionTips : [
          "Start with the beginner modifications if you're new to exercise",
          "Gradually increase intensity and duration over 2-3 weeks",
          "Listen to your body and take extra rest days if needed",
          "Track your progress and celebrate small improvements"
        ],
        safetyGuidelines: Array.isArray(aiResult.safetyGuidelines) ? aiResult.safetyGuidelines : [
          "Always warm up before exercising and cool down afterward",
          "Stop if you experience chest pain, dizziness, or difficulty breathing",
          "Stay hydrated throughout your workout",
          "Consult your healthcare provider before starting any new exercise program"
        ],
        equipmentList: Array.isArray(aiResult.equipmentList) ? aiResult.equipmentList : [
          "Exercise mat",
          "Water bottle", 
          "Comfortable workout clothes",
          "Supportive athletic shoes"
        ]
      }
    };

  } catch (error: any) {
    console.error("Error generating video exercise plan:", error);
    
    if (error?.status === 403 && error?.error?.includes('credits')) {
      throw new Error("AI_CREDITS_NEEDED");
    }
    
    throw new Error("Failed to generate exercise plan");
  }
}