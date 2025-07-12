import OpenAI from "openai";
import type { Patient } from "@shared/schema";

const openai = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY 
});

export interface NutritionInsight {
  summary: string;
  recommendations: string[];
  warnings: string[];
  metabolicAnalysis: string;
  supplementSuggestions: string[];
}

export async function generateNutritionInsights(patient: Patient): Promise<NutritionInsight> {
  try {
    const prompt = `As a nutrition expert, analyze the following patient data and provide personalized nutrition insights for metabolic health and weight management:

Patient Profile:
- Name: ${patient.name}
- Age: ${patient.age}
- Current Weight: ${patient.weight} lbs
- Weight Goal: ${patient.weightGoal} lbs
- Body Fat: ${patient.bodyFat}%
- Body Fat Goal: ${patient.bodyFatGoal}%
- Insulin Resistance: ${patient.insulinResistance ? 'Yes' : 'No'}
- Blood Pressure: ${patient.bloodPressure}
- Blood Sugar Status: ${patient.bloodSugar}
- Weight Loss Progress: ${patient.weightLoss} lbs
- Plan Adherence: ${patient.adherence}%
- Current Diet Plan: ${patient.dietPlan || 'None assigned'}
- Current Supplements: ${patient.supplements?.join(', ') || 'None'}
- GLP-1 Prescription: ${patient.glp1Prescription || 'None'}

Please provide a comprehensive nutrition analysis in JSON format with the following structure:
{
  "summary": "Brief overview of patient's nutritional status and metabolic health",
  "recommendations": ["Specific actionable nutrition recommendations"],
  "warnings": ["Important warnings or precautions"],
  "metabolicAnalysis": "Detailed analysis of metabolic factors affecting weight loss",
  "supplementSuggestions": ["Evidence-based supplement recommendations"]
}

Focus on:
1. Metabolic health optimization
2. Weight loss acceleration
3. Blood sugar management
4. Insulin sensitivity improvement
5. Sustainable dietary changes
6. Micronutrient optimization`;

    const response = await openai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content: "You are an expert clinical nutritionist specializing in metabolic health, weight management, and personalized nutrition. Provide evidence-based recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      summary: result.summary || "Analysis complete",
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
      warnings: Array.isArray(result.warnings) ? result.warnings : [],
      metabolicAnalysis: result.metabolicAnalysis || "Metabolic analysis pending",
      supplementSuggestions: Array.isArray(result.supplementSuggestions) ? result.supplementSuggestions : []
    };

  } catch (error) {
    console.error("Error generating nutrition insights:", error);
    throw new Error("Failed to generate nutrition insights");
  }
}

export async function generateMealPlan(patient: Patient, preferences?: string): Promise<{
  mealPlan: string;
  macroBreakdown: string;
  shoppingList: string[];
}> {
  try {
    const prompt = `Create a personalized 7-day meal plan for this patient:

Patient Profile:
- Current Weight: ${patient.weight} lbs
- Weight Goal: ${patient.weightGoal} lbs
- Body Fat: ${patient.bodyFat}%
- Insulin Resistance: ${patient.insulinResistance ? 'Yes' : 'No'}
- Current Diet Plan: ${patient.dietPlan || 'None'}
- Dietary Preferences: ${preferences || 'Standard'}

Provide a detailed meal plan in JSON format:
{
  "mealPlan": "Complete 7-day meal plan with breakfast, lunch, dinner, and snacks",
  "macroBreakdown": "Daily macro targets and ratios",
  "shoppingList": ["Comprehensive shopping list items"]
}`;

    const response = await openai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content: "You are a certified nutritionist creating personalized meal plans for metabolic health and weight management."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      mealPlan: result.mealPlan || "Meal plan generation pending",
      macroBreakdown: result.macroBreakdown || "Macro analysis pending",
      shoppingList: Array.isArray(result.shoppingList) ? result.shoppingList : []
    };

  } catch (error) {
    console.error("Error generating meal plan:", error);
    throw new Error("Failed to generate meal plan");
  }
}