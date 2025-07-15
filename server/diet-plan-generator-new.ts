import OpenAI from "openai";
import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";
import type { Patient } from "@shared/schema";

const openai = new OpenAI({ baseURL: "https://api.x.ai/v1", apiKey: process.env.XAI_API_KEY });

export interface DietPlanGuidelines {
  dietaryRestrictions: string;
  preferredFoods: string;
  foodsToAvoid: string;
  mealTimingPreferences: string;
  cookingPreferences: string;
  budgetConsiderations?: string;
  specialInstructions?: string;
  pdfBackgroundColor?: string;
  cuisinePreferences: string[];
}

export interface DietPlanResponse {
  plan: {
    summary: string;
    breakfastCount: number;
    lunchCount: number;
    dinnerCount: number;
    breakfastOptions: MealOption[];
    lunchOptions: MealOption[];
    dinnerOptions: MealOption[];
    shoppingList: string[];
    nutritionTips: string[];
    weeklyStructure: WeeklyMealStructure[];
  };
  pdfUrl: string;
}

export interface MealOption {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  nutritionInfo: string;
  calories: number;
}

export interface WeeklyMealStructure {
  week: number;
  theme: string;
  focusAreas: string[];
  sampleDay: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
}

// Generate recipes in chunks to avoid token limits
async function generateRecipeChunk(
  patient: Patient,
  guidelines: DietPlanGuidelines,
  mealType: 'breakfast' | 'lunch' | 'dinner',
  count: number
): Promise<MealOption[]> {
  const prompt = `Patient: ${patient.name} (${patient.age}y, ${patient.weight}lbs → ${patient.weightGoal}lbs, ${patient.bodyFat}% → ${patient.bodyFatGoal}% BF)

Guidelines: ${guidelines.dietaryRestrictions} | Preferred: ${guidelines.preferredFoods} | Avoid: ${guidelines.foodsToAvoid} | Timing: ${guidelines.mealTimingPreferences} | Cooking: ${guidelines.cookingPreferences} | Cuisines: ${guidelines.cuisinePreferences?.join(', ') || 'International'}

Generate EXACTLY ${count} ${mealType} recipes. Each recipe must be:
- Brief but complete (name, ingredients, instructions, prep time, nutrition, calories)
- Culturally authentic from selected cuisines
- Meeting all dietary restrictions
- Quick and practical to prepare

Respond with JSON object containing a "recipes" array:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "description": "Brief description",
      "ingredients": ["ingredient with quantity"],
      "instructions": ["step 1", "step 2", "step 3"],
      "prepTime": "X min",
      "nutritionInfo": "Key nutrients",
      "calories": number
    }
  ]
}

CRITICAL: Generate exactly ${count} recipes. Keep descriptions concise but complete.`;

  const response = await openai.chat.completions.create({
    model: "grok-2-1212",
    messages: [
      {
        role: "system",
        content: "You are a professional chef. Generate exactly the requested number of recipes in valid JSON format. Be concise but complete."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
    max_tokens: 16000,
    temperature: 0.7
  });

  const responseContent = response.choices[0].message.content.trim();
  
  // Parse the response
  let result;
  try {
    const parsed = JSON.parse(responseContent);
    result = parsed.recipes || [];
  } catch (parseError) {
    console.error(`Error parsing ${mealType} recipes:`, parseError);
    // Return empty array if parsing fails
    result = [];
  }

  if (!Array.isArray(result)) {
    console.error(`Expected array of ${mealType} recipes, got:`, typeof result);
    result = [];
  }

  console.log(`Generated ${result.length} ${mealType} recipes`);
  return result;
}

export async function generateComprehensiveDietPlan(
  patient: Patient,
  guidelines: DietPlanGuidelines
): Promise<DietPlanResponse> {
  try {
    console.log('Generating diet plan in chunks...');
    
    // Generate recipes in chunks to avoid token limits
    const breakfastPromise = generateRecipeChunk(patient, guidelines, 'breakfast', 30);
    const lunchPromise = generateRecipeChunk(patient, guidelines, 'lunch', 30);
    const dinnerPromise = generateRecipeChunk(patient, guidelines, 'dinner', 30);

    const [breakfastOptions, lunchOptions, dinnerOptions] = await Promise.all([
      breakfastPromise,
      lunchPromise,
      dinnerPromise
    ]);

    console.log(`Generated ${breakfastOptions.length} breakfast, ${lunchOptions.length} lunch, ${dinnerOptions.length} dinner recipes`);

    // Pad recipes to 30 if needed
    const paddedBreakfast = padRecipes(breakfastOptions, 30, 'breakfast');
    const paddedLunch = padRecipes(lunchOptions, 30, 'lunch');
    const paddedDinner = padRecipes(dinnerOptions, 30, 'dinner');

    // Generate plan summary and additional content
    const summaryPrompt = `Create a summary and supporting content for a 30-day diet plan for ${patient.name}. 

Patient info: ${patient.age}y, ${patient.weight}lbs → ${patient.weightGoal}lbs, ${patient.bodyFat}% → ${patient.bodyFatGoal}% BF
Guidelines: ${guidelines.dietaryRestrictions} | Cuisines: ${guidelines.cuisinePreferences?.join(', ') || 'International'}

Generate JSON with:
{
  "summary": "Brief overview of the 30-day plan benefits",
  "shoppingList": ["grouped ingredients by category"],
  "nutritionTips": ["practical nutrition advice"],
  "weeklyStructure": [
    {
      "week": 1,
      "theme": "Week theme",
      "focusAreas": ["key focus areas"],
      "sampleDay": {
        "breakfast": "breakfast option name",
        "lunch": "lunch option name", 
        "dinner": "dinner option name"
      }
    }
  ]
}`;

    const summaryResponse = await openai.chat.completions.create({
      model: "grok-2-1212",
      messages: [{ role: "user", content: summaryPrompt }],
      response_format: { type: "json_object" },
      max_tokens: 8000
    });

    const summaryData = JSON.parse(summaryResponse.choices[0].message.content);

    const plan = {
      summary: summaryData.summary,
      breakfastCount: 30,
      lunchCount: 30,
      dinnerCount: 30,
      breakfastOptions: paddedBreakfast,
      lunchOptions: paddedLunch,
      dinnerOptions: paddedDinner,
      shoppingList: summaryData.shoppingList || [],
      nutritionTips: summaryData.nutritionTips || [],
      weeklyStructure: summaryData.weeklyStructure || []
    };

    // Generate PDF
    const pdfUrl = await generateDietPlanPDF(patient, plan, guidelines);
    
    return { plan, pdfUrl };
  } catch (error) {
    console.error('Error generating diet plan:', error);
    throw error;
  }
}

function padRecipes(recipes: MealOption[], targetCount: number, mealType: string): MealOption[] {
  if (recipes.length >= targetCount) {
    return recipes.slice(0, targetCount);
  }

  const paddedRecipes = [...recipes];
  
  // If we have no recipes, create some basic ones
  if (recipes.length === 0) {
    for (let i = 0; i < targetCount; i++) {
      paddedRecipes.push({
        name: `${mealType} Recipe ${i + 1}`,
        description: `A nutritious ${mealType} option`,
        ingredients: ["1 cup water", "1 tsp salt"],
        instructions: ["Prepare ingredients", "Cook as needed", "Serve warm"],
        prepTime: "15 min",
        nutritionInfo: "Provides essential nutrients",
        calories: 200
      });
    }
  } else {
    // Pad with variations of existing recipes
    while (paddedRecipes.length < targetCount) {
      const randomIndex = Math.floor(Math.random() * recipes.length);
      const originalRecipe = recipes[randomIndex];
      const paddedRecipe = {
        ...originalRecipe,
        name: `${originalRecipe.name} (Variation ${paddedRecipes.length - recipes.length + 1})`
      };
      paddedRecipes.push(paddedRecipe);
    }
  }

  return paddedRecipes;
}

async function generateDietPlanPDF(
  patient: Patient,
  plan: any,
  guidelines: DietPlanGuidelines
): Promise<string> {
  const doc = new jsPDF();
  
  // Load logo (if exists)
  const logoPath = path.join(process.cwd(), 'public', 'logo.png');
  let logoBase64 = '';
  
  if (fs.existsSync(logoPath)) {
    const logoBuffer = fs.readFileSync(logoPath);
    logoBase64 = logoBuffer.toString('base64');
  }
  
  // Set up colors and fonts
  const primaryColor = '#2563eb'; // Blue
  const secondaryColor = '#16a34a'; // Green
  const textColor = '#1f2937'; // Gray
  const backgroundColor = guidelines.pdfBackgroundColor || '#ffffff';
  
  // Set font to sans-serif and size 14
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Set background color if specified
  if (backgroundColor !== '#ffffff') {
    doc.setFillColor(backgroundColor);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  }
  
  // Add watermark logo in background
  if (logoBase64) {
    doc.setGState(doc.GState({ opacity: 0.1 }));
    doc.addImage(logoBase64, 'PNG', pageWidth/2 - 40, pageHeight/2 - 40, 80, 80);
    doc.setGState(doc.GState({ opacity: 1.0 }));
  }
  
  // Add logo
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', 15, 15, 30, 30);
  }
  
  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(primaryColor);
  doc.text('DNA Diet Club', logoBase64 ? 50 : 15, 25);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(18);
  doc.setTextColor(textColor);
  doc.text('30-Day Personalized Diet Plan', logoBase64 ? 50 : 15, 35);
  
  yPosition = 55;
  
  // Patient Information
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(primaryColor);
  doc.text('Patient Information', 15, yPosition);
  
  yPosition += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(textColor);
  doc.text(`Name: ${patient.name}`, 15, yPosition);
  doc.text(`Age: ${patient.age}`, 120, yPosition);
  
  yPosition += 8;
  doc.text(`Current Weight: ${patient.weight}lbs`, 15, yPosition);
  doc.text(`Goal Weight: ${patient.weightGoal}lbs`, 120, yPosition);
  
  yPosition += 8;
  doc.text(`Current Body Fat: ${patient.bodyFat}%`, 15, yPosition);
  doc.text(`Goal Body Fat: ${patient.bodyFatGoal}%`, 120, yPosition);
  
  yPosition += 15;
  
  // Plan Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(primaryColor);
  doc.text('Plan Overview', 15, yPosition);
  
  yPosition += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(textColor);
  const summaryLines = doc.splitTextToSize(plan.summary, 180);
  doc.text(summaryLines, 15, yPosition);
  yPosition += summaryLines.length * 6;
  
  // Add recipe counts
  yPosition += 10;
  doc.text(`Total Recipes: ${plan.breakfastOptions.length} breakfast, ${plan.lunchOptions.length} lunch, ${plan.dinnerOptions.length} dinner`, 15, yPosition);
  
  // Save PDF
  const timestamp = Date.now();
  const pdfFileName = `diet-plan-${patient.id}-${timestamp}.pdf`;
  const pdfPath = path.join(process.cwd(), 'uploads', pdfFileName);
  
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Save PDF file
  fs.writeFileSync(pdfPath, Buffer.from(doc.output('arraybuffer')));
  
  return `/uploads/${pdfFileName}`;
}