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

export async function generateComprehensiveDietPlan(
  patient: Patient,
  guidelines: DietPlanGuidelines
): Promise<DietPlanResponse> {
  const prompt = `As a registered dietitian and nutritionist, create a comprehensive 30-day diet plan for ${patient.name}.

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
- Current Diet Plan: ${patient.dietPlan || 'None assigned'}

Provider Guidelines:
- Dietary Restrictions: ${guidelines.dietaryRestrictions}
- Preferred Foods: ${guidelines.preferredFoods}
- Foods to Avoid: ${guidelines.foodsToAvoid}
- Meal Timing Preferences: ${guidelines.mealTimingPreferences}
- Cooking Preferences: ${guidelines.cookingPreferences}
- Budget Considerations: ${guidelines.budgetConsiderations || 'Standard budget'}
- Special Instructions: ${guidelines.specialInstructions || 'None'}

IMPORTANT: You must generate EXACTLY 30 breakfast recipes, 30 lunch recipes, and 30 dinner recipes. Do not generate fewer recipes. Each meal category must have exactly 30 complete recipes with all details.

Create a detailed 30-day diet plan with:
1. EXACTLY 30 breakfast options with complete recipes (not less)
2. EXACTLY 30 lunch options with complete recipes (not less)
3. EXACTLY 30 dinner options with complete recipes (not less)
4. Weekly meal structure and themes
5. Comprehensive shopping list
6. Nutrition tips and guidelines

Each meal must include:
- Recipe name and description
- Complete ingredient list with quantities
- Step-by-step cooking instructions
- Preparation time
- Nutritional information
- Estimated calories

CRITICAL: Generate all 90 recipes (30 breakfast + 30 lunch + 30 dinner) in this single response. Do not abbreviate or summarize.

Respond in JSON format with all 90 recipes listed:
{
  "summary": "Brief overview of the 30-day plan and its benefits",
  "breakfastCount": 30,
  "lunchCount": 30,
  "dinnerCount": 30,
  "breakfastOptions": [
    {
      "name": "Recipe name",
      "description": "Brief description",
      "ingredients": ["ingredient with quantity"],
      "instructions": ["step by step"],
      "prepTime": "X minutes",
      "nutritionInfo": "Key nutritional highlights",
      "calories": number
    }
    // MUST include all 30 breakfast recipes here
  ],
  "lunchOptions": [
    // MUST include all 30 lunch recipes here with same structure
  ],
  "dinnerOptions": [
    // MUST include all 30 dinner recipes here with same structure
  ],
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

  const response = await openai.chat.completions.create({
    model: "grok-2-1212",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const plan = JSON.parse(response.choices[0].message.content);
  
  // Generate PDF with the plan
  const pdfUrl = await generateDietPlanPDF(patient, plan, guidelines);
  
  return { plan, pdfUrl };
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
  
  // Header with logo
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
  yPosition += 6;
  doc.text(`Current Weight: ${patient.weight} lbs`, 15, yPosition);
  doc.text(`Goal Weight: ${patient.weightGoal} lbs`, 120, yPosition);
  yPosition += 6;
  doc.text(`Body Fat: ${patient.bodyFat}%`, 15, yPosition);
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
  const summaryLines = doc.splitTextToSize(plan.summary, pageWidth - 30);
  doc.text(summaryLines, 15, yPosition);
  yPosition += summaryLines.length * 5 + 10;
  
  // Check if we need a new page
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Breakfast Options
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(secondaryColor);
  doc.text('🌅 Breakfast Options', 15, yPosition);
  yPosition += 10;
  
  for (let i = 0; i < Math.min(15, plan.breakfastOptions.length); i++) {
    const meal = plan.breakfastOptions[i];
    
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(textColor);
    doc.text(`${i + 1}. ${meal.name}`, 15, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text(`${meal.calories} calories • ${meal.prepTime}`, 15, yPosition + 6);
    
    yPosition += 12;
    const descLines = doc.splitTextToSize(meal.description, pageWidth - 30);
    doc.text(descLines, 15, yPosition);
    yPosition += descLines.length * 4 + 8;
  }
  
  // Lunch Options
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(16);
  doc.setTextColor(secondaryColor);
  doc.text('🌞 Lunch Options', 15, yPosition);
  yPosition += 10;
  
  for (let i = 0; i < Math.min(15, plan.lunchOptions.length); i++) {
    const meal = plan.lunchOptions[i];
    
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.setTextColor(textColor);
    doc.text(`${i + 1}. ${meal.name}`, 15, yPosition);
    doc.setFontSize(10);
    doc.text(`${meal.calories} calories • ${meal.prepTime}`, 15, yPosition + 6);
    
    yPosition += 12;
    const descLines = doc.splitTextToSize(meal.description, pageWidth - 30);
    doc.text(descLines, 15, yPosition);
    yPosition += descLines.length * 4 + 8;
  }
  
  // Dinner Options
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(16);
  doc.setTextColor(secondaryColor);
  doc.text('🌙 Dinner Options', 15, yPosition);
  yPosition += 10;
  
  for (let i = 0; i < Math.min(15, plan.dinnerOptions.length); i++) {
    const meal = plan.dinnerOptions[i];
    
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.setTextColor(textColor);
    doc.text(`${i + 1}. ${meal.name}`, 15, yPosition);
    doc.setFontSize(10);
    doc.text(`${meal.calories} calories • ${meal.prepTime}`, 15, yPosition + 6);
    
    yPosition += 12;
    const descLines = doc.splitTextToSize(meal.description, pageWidth - 30);
    doc.text(descLines, 15, yPosition);
    yPosition += descLines.length * 4 + 8;
  }
  
  // Complete Recipe Section
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(16);
  doc.setTextColor(secondaryColor);
  doc.text('📖 Complete Recipe Collection', 15, yPosition);
  yPosition += 15;
  
  // All Breakfast Recipes
  doc.setFontSize(14);
  doc.setTextColor(primaryColor);
  doc.text('All Breakfast Recipes', 15, yPosition);
  yPosition += 10;
  
  plan.breakfastOptions.forEach((meal: any, index: number) => {
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.setTextColor(textColor);
    doc.text(`${index + 1}. ${meal.name}`, 15, yPosition);
    doc.setFontSize(10);
    doc.text(`${meal.calories} calories • ${meal.prepTime}`, 15, yPosition + 6);
    
    yPosition += 12;
    const descLines = doc.splitTextToSize(meal.description, pageWidth - 30);
    doc.text(descLines, 15, yPosition);
    yPosition += descLines.length * 4;
    
    if (meal.ingredients && meal.ingredients.length > 0) {
      doc.text('Ingredients:', 15, yPosition);
      yPosition += 4;
      meal.ingredients.slice(0, 5).forEach((ingredient: string) => {
        doc.text(`• ${ingredient}`, 20, yPosition);
        yPosition += 4;
      });
    }
    
    yPosition += 6;
  });
  
  // All Lunch Recipes
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(14);
  doc.setTextColor(primaryColor);
  doc.text('All Lunch Recipes', 15, yPosition);
  yPosition += 10;
  
  plan.lunchOptions.forEach((meal: any, index: number) => {
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.setTextColor(textColor);
    doc.text(`${index + 1}. ${meal.name}`, 15, yPosition);
    doc.setFontSize(10);
    doc.text(`${meal.calories} calories • ${meal.prepTime}`, 15, yPosition + 6);
    
    yPosition += 12;
    const descLines = doc.splitTextToSize(meal.description, pageWidth - 30);
    doc.text(descLines, 15, yPosition);
    yPosition += descLines.length * 4;
    
    if (meal.ingredients && meal.ingredients.length > 0) {
      doc.text('Ingredients:', 15, yPosition);
      yPosition += 4;
      meal.ingredients.slice(0, 5).forEach((ingredient: string) => {
        doc.text(`• ${ingredient}`, 20, yPosition);
        yPosition += 4;
      });
    }
    
    yPosition += 6;
  });
  
  // All Dinner Recipes
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(14);
  doc.setTextColor(primaryColor);
  doc.text('All Dinner Recipes', 15, yPosition);
  yPosition += 10;
  
  plan.dinnerOptions.forEach((meal: any, index: number) => {
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.setTextColor(textColor);
    doc.text(`${index + 1}. ${meal.name}`, 15, yPosition);
    doc.setFontSize(10);
    doc.text(`${meal.calories} calories • ${meal.prepTime}`, 15, yPosition + 6);
    
    yPosition += 12;
    const descLines = doc.splitTextToSize(meal.description, pageWidth - 30);
    doc.text(descLines, 15, yPosition);
    yPosition += descLines.length * 4;
    
    if (meal.ingredients && meal.ingredients.length > 0) {
      doc.text('Ingredients:', 15, yPosition);
      yPosition += 4;
      meal.ingredients.slice(0, 5).forEach((ingredient: string) => {
        doc.text(`• ${ingredient}`, 20, yPosition);
        yPosition += 4;
      });
    }
    
    yPosition += 6;
  });

  // Shopping List
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(16);
  doc.setTextColor(secondaryColor);
  doc.text('🛒 Shopping List', 15, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setTextColor(textColor);
  plan.shoppingList.forEach((item: string, index: number) => {
    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(`• ${item}`, 15, yPosition);
    yPosition += 5;
  });
  
  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor('#666666');
    doc.text(`DNA Diet Club • Page ${i} of ${totalPages}`, 15, pageHeight - 10);
    doc.text(`Generated for ${patient.name}`, pageWidth - 60, pageHeight - 10);
  }
  
  // Save PDF
  const fileName = `diet-plan-${patient.id}-${Date.now()}.pdf`;
  const filePath = path.join(process.cwd(), 'uploads', fileName);
  
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  const pdfBuffer = doc.output('arraybuffer');
  fs.writeFileSync(filePath, Buffer.from(pdfBuffer));
  
  return `/uploads/${fileName}`;
}