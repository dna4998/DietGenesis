import type { Patient } from "@shared/schema";

export interface VoiceCommandResponse {
  success: boolean;
  response: string;
  action?: string;
  data?: any;
}

export function processVoiceCommand(command: string, patient: Patient): VoiceCommandResponse {
  const normalizedCommand = command.toLowerCase().trim();
  
  // Weight-related commands
  if (/how.*weight|current.*weight|what.*weight/.test(normalizedCommand)) {
    return {
      success: true,
      response: `Your current weight is ${patient.weight} pounds. Your goal is ${patient.weightGoal} pounds, so you have ${patient.weight - patient.weightGoal} pounds to go.`,
      action: "weight_check",
      data: { current: patient.weight, goal: patient.weightGoal, remaining: patient.weight - patient.weightGoal }
    };
  }
  
  // Progress commands
  if (/progress|how.*doing|weight.*loss/.test(normalizedCommand)) {
    const encouragement = patient.adherence >= 80 ? "Great job staying on track!" : "Consider reviewing your plan to improve adherence.";
    return {
      success: true,
      response: `You've lost ${patient.weightLoss} pounds so far and your plan adherence is ${patient.adherence}%. ${encouragement}`,
      action: "progress_check",
      data: { weightLoss: patient.weightLoss, adherence: patient.adherence }
    };
  }
  
  // Body fat commands
  if (/body.*fat|fat.*percentage/.test(normalizedCommand)) {
    return {
      success: true,
      response: `Your current body fat is ${patient.bodyFat}% and your goal is ${patient.bodyFatGoal}%. You need to reduce it by ${patient.bodyFat - patient.bodyFatGoal} percentage points.`,
      action: "bodyfat_check",
      data: { current: patient.bodyFat, goal: patient.bodyFatGoal, remaining: patient.bodyFat - patient.bodyFatGoal }
    };
  }
  
  // Diet plan commands
  if (/diet.*plan|what.*eat|meal.*plan/.test(normalizedCommand)) {
    return {
      success: true,
      response: patient.dietPlan ? 
        `Your current diet plan is: ${patient.dietPlan}` :
        "You don't have a diet plan assigned yet. Contact your healthcare provider to get a personalized plan.",
      action: "diet_plan_check",
      data: { hasPlan: !!patient.dietPlan, plan: patient.dietPlan }
    };
  }
  
  // Exercise commands
  if (/exercise|workout|fitness/.test(normalizedCommand)) {
    return {
      success: true,
      response: patient.exercisePlan ?
        `Your exercise plan includes: ${patient.exercisePlan}` :
        "You don't have an exercise plan assigned yet. Contact your healthcare provider for a personalized fitness routine.",
      action: "exercise_plan_check",
      data: { hasPlan: !!patient.exercisePlan, plan: patient.exercisePlan }
    };
  }
  
  // Supplement commands
  if (/supplement|vitamin|pills/.test(normalizedCommand)) {
    if (patient.supplements && patient.supplements.length > 0) {
      return {
        success: true,
        response: `You're taking these supplements: ${patient.supplements.join(', ')}. Remember to take them as directed.`,
        action: "supplement_check",
        data: { supplements: patient.supplements }
      };
    } else {
      return {
        success: true,
        response: "You don't have any supplements assigned yet. Your healthcare provider may recommend some based on your health assessment.",
        action: "supplement_check",
        data: { supplements: [] }
      };
    }
  }
  
  // Blood pressure commands
  if (/blood.*pressure|bp|hypertension/.test(normalizedCommand)) {
    const advice = patient.bloodPressure === 'High' ? 
      'Continue monitoring and follow your healthcare provider recommendations.' :
      'Keep up the good work maintaining healthy blood pressure.';
    return {
      success: true,
      response: `Your blood pressure reading is ${patient.bloodPressure}. ${advice}`,
      action: "bp_check",
      data: { bloodPressure: patient.bloodPressure }
    };
  }
  
  // Blood sugar commands
  if (/blood.*sugar|glucose|diabetes/.test(normalizedCommand)) {
    const advice = patient.bloodSugar === 'High' ?
      'Focus on your diet plan and monitor regularly.' :
      'Great job maintaining healthy blood sugar levels.';
    return {
      success: true,
      response: `Your blood sugar level is ${patient.bloodSugar}. ${advice}`,
      action: "glucose_check",
      data: { bloodSugar: patient.bloodSugar }
    };
  }
  
  // Insulin resistance commands
  if (/insulin.*resistance|insulin|metabolic/.test(normalizedCommand)) {
    return {
      success: true,
      response: patient.insulinResistance ?
        "You have insulin resistance. Focus on low-glycemic foods, regular exercise, and following your meal timing recommendations." :
        "You don't currently show signs of insulin resistance. Keep maintaining your healthy lifestyle.",
      action: "insulin_check",
      data: { insulinResistance: patient.insulinResistance }
    };
  }
  
  // Help commands
  if (/help|what.*can.*do|commands/.test(normalizedCommand)) {
    return {
      success: true,
      response: "I can help you with information about your weight, progress, body fat, diet plan, exercise routine, supplements, blood pressure, blood sugar, and insulin resistance. Just ask me naturally!",
      action: "help",
      data: { availableCommands: ["weight", "progress", "body fat", "diet plan", "exercise", "supplements", "blood pressure", "blood sugar", "insulin resistance"] }
    };
  }

  // Motivational commands
  if (/motivate|encourage|inspiration/.test(normalizedCommand)) {
    const motivationalMessages = [
      `You've already lost ${patient.weightLoss} pounds - that's amazing progress!`,
      `With ${patient.adherence}% adherence, you're showing real commitment to your health journey.`,
      "Every healthy choice you make is an investment in your future self.",
      "Remember, sustainable weight loss is a marathon, not a sprint. You're doing great!",
      "Your dedication to improving your health is inspiring. Keep up the excellent work!"
    ];
    
    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    
    return {
      success: true,
      response: randomMessage,
      action: "motivation",
      data: { type: "encouragement" }
    };
  }

  // Unknown command
  return {
    success: false,
    response: "I'm sorry, I didn't understand that. Try asking about your weight, progress, diet plan, exercise routine, or say 'help' to see what I can do.",
    action: "unknown_command",
    data: { originalCommand: command }
  };
}

export function getVoiceCommandSuggestions(): string[] {
  return [
    "How much do I weigh?",
    "What's my progress?",
    "Tell me about my diet plan",
    "What exercises should I do?",
    "What supplements am I taking?",
    "How's my blood pressure?",
    "Check my blood sugar",
    "Do I have insulin resistance?",
    "Motivate me",
    "Help me"
  ];
}