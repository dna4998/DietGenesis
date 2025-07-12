import type { Patient } from "@shared/schema";
import type { NutritionInsight } from "./ai-insights";

export function generateDemoInsights(patient: Patient): NutritionInsight {
  const hasInsulinResistance = patient.insulinResistance;
  const weightToLose = patient.weight - patient.weightGoal;
  const bodyFatToLose = patient.bodyFat - patient.bodyFatGoal;
  
  return {
    summary: `${patient.name} shows ${hasInsulinResistance ? 'insulin resistance patterns' : 'good metabolic flexibility'} with ${weightToLose}lbs weight loss goal. Current adherence at ${patient.adherence}% suggests ${patient.adherence >= 80 ? 'excellent commitment' : 'room for improvement'} in plan following.`,
    
    recommendations: [
      hasInsulinResistance 
        ? "Implement time-restricted eating (16:8) to improve insulin sensitivity"
        : "Maintain current eating schedule with focus on nutrient timing",
      weightToLose > 20 
        ? "Aim for 1-2lbs per week weight loss through 500-750 calorie deficit"
        : "Focus on body recomposition with moderate calorie deficit",
      "Increase protein intake to 1.2-1.6g per kg body weight for muscle preservation",
      bodyFatToLose > 5 
        ? "Incorporate 3-4 resistance training sessions per week"
        : "Add 2-3 HIIT sessions weekly for metabolic enhancement",
      patient.bloodSugar === "High" 
        ? "Monitor blood glucose post-meal and adjust carbohydrate timing"
        : "Continue current blood sugar management approach"
    ],

    warnings: [
      hasInsulinResistance 
        ? "Monitor for hypoglycemic episodes when implementing fasting protocols"
        : "Watch for energy dips during increased training intensity",
      patient.bloodPressure === "High" 
        ? "Limit sodium intake to <2300mg daily and monitor BP during weight loss"
        : "Maintain adequate hydration during increased activity",
      patient.adherence < 70 
        ? "Low adherence may indicate plan adjustments needed - reassess goals"
        : "Avoid over-restriction that could lead to adherence drops"
    ],

    metabolicAnalysis: hasInsulinResistance 
      ? `Insulin resistance indicates impaired glucose metabolism requiring strategic carbohydrate timing and emphasis on fiber-rich, low-glycemic foods. Current weight loss of ${patient.weightLoss}lbs suggests metabolic adaptation is occurring. Focus on preserving lean mass while improving insulin sensitivity through targeted nutrition timing.`
      : `Good metabolic flexibility allows for varied macronutrient approaches. Current progress of ${patient.weightLoss}lbs indicates healthy metabolic rate. Continue current approach while optimizing nutrient timing around training for enhanced body composition.`,

    supplementSuggestions: [
      hasInsulinResistance 
        ? "Chromium picolinate (200-400mcg) to support glucose metabolism"
        : "Omega-3 fatty acids (2-3g EPA/DHA) for metabolic health",
      "Magnesium glycinate (400-600mg) for muscle recovery and sleep quality",
      patient.bloodSugar === "High" 
        ? "Berberine (500mg 2x daily) for glucose management"
        : "Vitamin D3 (2000-4000 IU) for metabolic support",
      weightToLose > 15 
        ? "Green tea extract (400-500mg EGCG) for fat oxidation support"
        : "Probiotics for gut health and nutrient absorption",
      "B-complex for energy metabolism during caloric restriction"
    ]
  };
}

export function generateDemoMealPlan(patient: Patient): {
  mealPlan: string;
  macroBreakdown: string;
  shoppingList: string[];
} {
  const hasInsulinResistance = patient.insulinResistance;
  const calories = Math.round((patient.weight * 12) - 500); // Rough deficit calculation
  const protein = Math.round(patient.weight * 0.8);
  const carbs = hasInsulinResistance ? Math.round(calories * 0.25 / 4) : Math.round(calories * 0.35 / 4);
  const fat = Math.round((calories - (protein * 4) - (carbs * 4)) / 9);

  return {
    macroBreakdown: `Daily Targets for ${patient.name}:
• Calories: ${calories}
• Protein: ${protein}g (${Math.round(protein * 4 / calories * 100)}%)
• Carbohydrates: ${carbs}g (${Math.round(carbs * 4 / calories * 100)}%)
• Fat: ${fat}g (${Math.round(fat * 9 / calories * 100)}%)

${hasInsulinResistance ? 'Lower carb approach for insulin sensitivity' : 'Balanced macros for metabolic flexibility'}`,

    mealPlan: `7-DAY MEAL PLAN FOR ${patient.name.toUpperCase()}

DAY 1:
Breakfast: Greek yogurt (1 cup) with berries (1/2 cup) and almonds (1 oz)
Lunch: Grilled chicken salad with mixed greens, avocado, and olive oil dressing
Dinner: Baked salmon (6 oz) with roasted vegetables and quinoa (1/2 cup)
Snack: Apple with almond butter (1 tbsp)

DAY 2:
Breakfast: Vegetable omelet (3 eggs) with spinach and mushrooms
Lunch: Turkey and avocado wrap with whole grain tortilla
Dinner: Lean beef stir-fry with broccoli and brown rice (1/2 cup)
Snack: Greek yogurt with walnuts

DAY 3:
Breakfast: Overnight oats with protein powder and chia seeds
Lunch: Quinoa bowl with grilled chicken, vegetables, and tahini
Dinner: Baked cod with sweet potato and green beans
Snack: Hummus with cucumber slices

DAY 4:
Breakfast: Smoothie with protein powder, spinach, banana, and almond milk
Lunch: Lentil soup with side salad
Dinner: Grilled chicken breast with roasted Brussels sprouts and wild rice
Snack: Cottage cheese with berries

DAY 5:
Breakfast: Chia pudding with coconut milk and strawberries
Lunch: Tuna salad on mixed greens with olive oil dressing
Dinner: Pork tenderloin with roasted cauliflower and quinoa
Snack: Hard-boiled eggs (2)

DAY 6:
Breakfast: Greek yogurt parfait with granola and fruit
Lunch: Chicken and vegetable soup with whole grain roll
Dinner: Shrimp stir-fry with zucchini noodles
Snack: Nuts and seeds mix (1 oz)

DAY 7:
Breakfast: Protein pancakes with sugar-free syrup
Lunch: Salmon salad with mixed greens and avocado
Dinner: Turkey meatballs with marinara and zucchini noodles
Snack: Protein smoothie

MEAL PREP TIPS:
• Batch cook proteins on Sunday
• Pre-cut vegetables for easy assembly
• Prepare overnight oats and chia puddings in advance
• Keep healthy snacks portioned and ready`,

    shoppingList: [
      "Greek yogurt (plain, large container)",
      "Eggs (2 dozen)",
      "Chicken breast (3 lbs)",
      "Salmon fillets (1.5 lbs)",
      "Ground turkey (1 lb)",
      "Lean beef or pork tenderloin (1 lb)",
      "Canned tuna (4 cans)",
      "Shrimp (1 lb, frozen)",
      "Mixed greens (3 bags)",
      "Spinach (fresh)",
      "Broccoli (2 heads)",
      "Brussels sprouts (1 bag)",
      "Cauliflower (1 head)",
      "Zucchini (4 medium)",
      "Sweet potatoes (3 medium)",
      "Avocados (4-5)",
      "Berries (mixed, 2 containers)",
      "Apples (6)",
      "Bananas (6)",
      "Quinoa (1 bag)",
      "Brown rice (1 bag)",
      "Wild rice (1 bag)",
      "Oats (rolled)",
      "Chia seeds",
      "Almonds (raw)",
      "Walnuts",
      "Almond butter",
      "Olive oil (extra virgin)",
      "Coconut milk (unsweetened)",
      "Almond milk",
      "Protein powder",
      "Lentils (dried or canned)",
      "Hummus",
      "Cottage cheese",
      "Whole grain tortillas",
      "Canned tomatoes (for marinara)"
    ]
  };
}