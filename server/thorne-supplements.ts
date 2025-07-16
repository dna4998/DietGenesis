import OpenAI from "openai";
import {
  SupplementRecommendation,
  InsertSupplementRecommendation,
  ProviderAffiliateSettings,
  type Patient
} from "@shared/schema";

const openai = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY 
});

export interface ThorneProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  ingredients: string[];
  benefits: string[];
  dosage: string;
  contraindications: string[];
  researchBacked: boolean;
}

// Comprehensive Thorne supplement database
export const thorneProductCatalog: ThorneProduct[] = [
  // Metabolic Health & Weight Management
  {
    id: "THR-001",
    name: "Basic B Complex",
    description: "High-potency B-vitamin complex for energy metabolism and nervous system support",
    price: 19.00,
    category: "B Vitamins",
    ingredients: ["Thiamine", "Riboflavin", "Niacin", "B6", "Folate", "B12", "Biotin", "Pantothenic Acid"],
    benefits: ["Energy production", "Nervous system support", "Metabolic function"],
    dosage: "1 capsule daily",
    contraindications: ["None known"],
    researchBacked: true
  },
  {
    id: "THR-002", 
    name: "Berberine-500",
    description: "Supports healthy blood glucose metabolism and cardiovascular function",
    price: 49.00,
    category: "Metabolic Support",
    ingredients: ["Berberine HCl 500mg"],
    benefits: ["Blood glucose support", "Cardiovascular health", "Metabolic function"],
    dosage: "1 capsule twice daily",
    contraindications: ["Pregnancy", "Nursing", "Blood thinning medications"],
    researchBacked: true
  },
  {
    id: "THR-003",
    name: "Chromium Picolinate",
    description: "Supports healthy glucose metabolism and weight management",
    price: 15.00,
    category: "Minerals",
    ingredients: ["Chromium Picolinate 200mcg"],
    benefits: ["Glucose metabolism", "Weight management", "Insulin sensitivity"],
    dosage: "1 capsule daily",
    contraindications: ["Diabetes medications (consult physician)"],
    researchBacked: true
  },
  {
    id: "THR-004",
    name: "Meta-Fem",
    description: "Comprehensive support for women's metabolic health and hormone balance",
    price: 68.00,
    category: "Women's Health",
    ingredients: ["Green tea extract", "Chromium", "Alpha-lipoic acid", "Cinnamon", "Bitter melon"],
    benefits: ["Metabolic support", "Hormone balance", "Weight management"],
    dosage: "2 capsules twice daily",
    contraindications: ["Pregnancy", "Nursing"],
    researchBacked: true
  },
  
  // Cardiovascular Health
  {
    id: "THR-005",
    name: "Omega-3 with CoQ10",
    description: "Essential fatty acids with CoQ10 for cardiovascular and cellular energy support",
    price: 58.00,
    category: "Omega-3",
    ingredients: ["EPA 600mg", "DHA 400mg", "CoQ10 30mg"],
    benefits: ["Heart health", "Brain function", "Cellular energy"],
    dosage: "2 capsules daily",
    contraindications: ["Blood thinning medications"],
    researchBacked: true
  },
  {
    id: "THR-006",
    name: "Magnesium Bisglycinate",
    description: "Highly absorbable magnesium for muscle, nerve, and cardiovascular support",
    price: 24.00,
    category: "Minerals",
    ingredients: ["Magnesium Bisglycinate 200mg"],
    benefits: ["Muscle function", "Nerve support", "Cardiovascular health"],
    dosage: "2 capsules daily",
    contraindications: ["Kidney disease"],
    researchBacked: true
  },
  
  // Insulin Resistance & Diabetes Support
  {
    id: "THR-007",
    name: "Diabenil",
    description: "Comprehensive formula for healthy blood sugar metabolism",
    price: 55.00,
    category: "Metabolic Support",
    ingredients: ["Bitter melon", "Gymnema sylvestre", "Banaba leaf", "Alpha-lipoic acid"],
    benefits: ["Blood sugar support", "Insulin sensitivity", "Glucose metabolism"],
    dosage: "2 capsules twice daily",
    contraindications: ["Diabetes medications (monitor blood sugar)"],
    researchBacked: true
  },
  {
    id: "THR-008",
    name: "Alpha-Lipoic Acid",
    description: "Potent antioxidant supporting glucose metabolism and nerve health",
    price: 45.00,
    category: "Antioxidants",
    ingredients: ["Alpha-Lipoic Acid 300mg"],
    benefits: ["Glucose metabolism", "Antioxidant support", "Nerve health"],
    dosage: "1 capsule twice daily",
    contraindications: ["Thyroid medications"],
    researchBacked: true
  },
  
  // Digestive Health
  {
    id: "THR-009",
    name: "FloraSport 20B",
    description: "High-potency probiotic for digestive and immune system support",
    price: 42.00,
    category: "Probiotics",
    ingredients: ["20 Billion CFU multi-strain probiotic blend"],
    benefits: ["Digestive health", "Immune support", "Gut microbiome"],
    dosage: "1 capsule daily",
    contraindications: ["Immunocompromised individuals"],
    researchBacked: true
  },
  {
    id: "THR-010",
    name: "Betaine HCl & Pepsin",
    description: "Digestive support for protein digestion and nutrient absorption",
    price: 26.00,
    category: "Digestive Support",
    ingredients: ["Betaine HCl 520mg", "Pepsin 21mg"],
    benefits: ["Protein digestion", "Nutrient absorption", "Stomach acid support"],
    dosage: "1-2 capsules with meals",
    contraindications: ["Stomach ulcers", "GERD"],
    researchBacked: true
  },
  
  // Inflammation & Joint Health
  {
    id: "THR-011",
    name: "Curcumin Phytosome",
    description: "Highly bioavailable curcumin for inflammation and joint support",
    price: 62.00,
    category: "Anti-Inflammatory",
    ingredients: ["Curcumin Phytosome 500mg"],
    benefits: ["Anti-inflammatory", "Joint health", "Antioxidant support"],
    dosage: "1-2 capsules daily",
    contraindications: ["Blood thinning medications", "Gallstones"],
    researchBacked: true
  },
  
  // Sleep & Stress Management
  {
    id: "THR-012",
    name: "Stress Response",
    description: "Adaptogenic herbs for stress management and cortisol balance",
    price: 48.00,
    category: "Stress Support",
    ingredients: ["Ashwagandha", "Rhodiola", "Schisandra", "Eleuthero"],
    benefits: ["Stress management", "Cortisol balance", "Energy support"],
    dosage: "2 capsules daily",
    contraindications: ["Autoimmune conditions"],
    researchBacked: true
  },
  {
    id: "THR-013",
    name: "Melaton-3",
    description: "Melatonin for healthy sleep cycles and circadian rhythm support",
    price: 15.00,
    category: "Sleep Support",
    ingredients: ["Melatonin 3mg"],
    benefits: ["Sleep quality", "Circadian rhythm", "Antioxidant"],
    dosage: "1 capsule 30 minutes before bed",
    contraindications: ["Pregnancy", "Nursing", "Autoimmune conditions"],
    researchBacked: true
  },
  
  // Thyroid & Hormone Support
  {
    id: "THR-014",
    name: "Thyrocsin",
    description: "Comprehensive thyroid support with iodine, tyrosine, and botanicals",
    price: 39.00,
    category: "Thyroid Support",
    ingredients: ["Iodine", "L-Tyrosine", "Ashwagandha", "Guggul"],
    benefits: ["Thyroid function", "Metabolism support", "Energy"],
    dosage: "2 capsules daily",
    contraindications: ["Hyperthyroidism", "Thyroid medications"],
    researchBacked: true
  },
  
  // Basic Vitamins & Minerals
  {
    id: "THR-015",
    name: "Vitamin D3/K2",
    description: "Synergistic combination for bone health and calcium metabolism",
    price: 25.00,
    category: "Vitamins",
    ingredients: ["Vitamin D3 1000 IU", "Vitamin K2 45mcg"],
    benefits: ["Bone health", "Immune support", "Calcium metabolism"],
    dosage: "1 capsule daily",
    contraindications: ["Blood thinning medications (for K2)"],
    researchBacked: true
  },
  {
    id: "THR-016",
    name: "Zinc Bisglycinate",
    description: "Highly absorbable zinc for immune and metabolic support",
    price: 18.00,
    category: "Minerals",
    ingredients: ["Zinc Bisglycinate 15mg"],
    benefits: ["Immune support", "Wound healing", "Taste and smell"],
    dosage: "1 capsule daily",
    contraindications: ["Copper deficiency risk with long-term use"],
    researchBacked: true
  }
];

// Generate affiliate URL with practice tracking
export function generateAffiliateUrl(
  productId: string, 
  affiliateSettings: ProviderAffiliateSettings
): string {
  // Since the exact Thorne affiliate URL format isn't publicly available,
  // we'll direct users to the main Thorne website with affiliate tracking
  // The affiliate ID will be embedded in the URL for tracking
  const masterAffiliateId = "PR115297";
  
  // If provider has custom settings, use their affiliate ID; otherwise use the master link
  const affiliateId = affiliateSettings.thorneAffiliateId || masterAffiliateId;
  
  // For now, direct users to the main Thorne website with affiliate tracking
  // In a real implementation, the provider would have access to their specific affiliate URLs
  return `https://www.thorne.com?ref=${affiliateId}`;
}

// AI-powered supplement recommendations
export async function generateSupplementRecommendations(
  patient: Patient,
  affiliateSettings: ProviderAffiliateSettings,
  specificConcerns?: string[]
): Promise<InsertSupplementRecommendation[]> {
  const patientProfile = `
Patient Profile:
- Age: ${patient.age}
- Weight: ${patient.weight} lbs, Goal: ${patient.weightGoal} lbs
- Body Fat: ${patient.bodyFat}%, Goal: ${patient.bodyFatGoal}%
- Insulin Resistance: ${patient.insulinResistance ? 'Yes' : 'No'}
- Blood Pressure: ${patient.bloodPressure}
- Blood Sugar: ${patient.bloodSugar}
- Current Supplements: ${patient.supplements?.join(', ') || 'None'}
${specificConcerns ? `- Specific Concerns: ${specificConcerns.join(', ')}` : ''}
  `;

  const availableProducts = thorneProductCatalog.map(product => `
ID: ${product.id}
Name: ${product.name}
Category: ${product.category}
Benefits: ${product.benefits.join(', ')}
Contraindications: ${product.contraindications.join(', ')}
Price: $${product.price}
  `).join('\n');

  const prompt = `As a clinical nutritionist, analyze this patient profile and recommend 3-5 Thorne supplements from the available catalog.

${patientProfile}

Available Thorne Products:
${availableProducts}

Provide recommendations in this JSON format:
{
  "recommendations": [
    {
      "thorneProductId": "THR-001",
      "dosage": "1 capsule daily with breakfast",
      "instructions": "Take with food to improve absorption",
      "duration": "3 months",
      "reason": "Detailed explanation of why this supplement is recommended for this patient",
      "priority": "high|medium|low"
    }
  ]
}

Consider:
1. Patient's specific health conditions and goals
2. Potential interactions with existing supplements
3. Evidence-based benefits for their condition
4. Appropriate dosing and duration
5. Priority based on most impactful interventions first

Focus on metabolic health, cardiovascular support, and weight management based on patient profile.`;

  try {
    const response = await openai.chat.completions.create({
      model: "grok-2-1212",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return result.recommendations.map((rec: any) => {
      const product = thorneProductCatalog.find(p => p.id === rec.thorneProductId);
      if (!product) return null;

      return {
        patientId: patient.id,
        providerId: affiliateSettings.providerId,
        thorneProductId: rec.thorneProductId,
        productName: product.name,
        dosage: rec.dosage,
        instructions: rec.instructions,
        duration: rec.duration,
        reason: rec.reason,
        priority: rec.priority,
        affiliateUrl: generateAffiliateUrl(rec.thorneProductId, affiliateSettings),
        productPrice: product.price.toString(),
        isActive: true,
      };
    }).filter(Boolean) as InsertSupplementRecommendation[];

  } catch (error) {
    console.error("Error generating supplement recommendations:", error);
    
    // Fallback recommendations for common conditions
    const fallbackRecs: InsertSupplementRecommendation[] = [];
    
    if (patient.insulinResistance) {
      const berberine = thorneProductCatalog.find(p => p.id === "THR-002");
      if (berberine) {
        fallbackRecs.push({
          patientId: patient.id,
          providerId: affiliateSettings.providerId,
          thorneProductId: "THR-002",
          productName: berberine.name,
          dosage: "1 capsule twice daily",
          instructions: "Take with meals to support glucose metabolism",
          duration: "3 months",
          reason: "Supports healthy blood glucose metabolism in patients with insulin resistance",
          priority: "high",
          affiliateUrl: generateAffiliateUrl("THR-002", affiliateSettings),
          productPrice: berberine.price.toString(),
          isActive: true,
        });
      }
    }

    // Basic B-Complex for energy and metabolism
    const bComplex = thorneProductCatalog.find(p => p.id === "THR-001");
    if (bComplex) {
      fallbackRecs.push({
        patientId: patient.id,
        providerId: affiliateSettings.providerId,
        thorneProductId: "THR-001",
        productName: bComplex.name,
        dosage: "1 capsule daily",
        instructions: "Take with breakfast for optimal absorption",
        duration: "6 months",
        reason: "Supports energy metabolism and nervous system function",
        priority: "medium",
        affiliateUrl: generateAffiliateUrl("THR-001", affiliateSettings),
        productPrice: bComplex.price.toString(),
        isActive: true,
      });
    }

    return fallbackRecs;
  }
}

// Get product details by ID
export function getThorneProductById(productId: string): ThorneProduct | undefined {
  return thorneProductCatalog.find(product => product.id === productId);
}

// Search products by category or condition
export function searchThorneProducts(query: string): ThorneProduct[] {
  const lowercaseQuery = query.toLowerCase();
  return thorneProductCatalog.filter(product =>
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.category.toLowerCase().includes(lowercaseQuery) ||
    product.benefits.some(benefit => benefit.toLowerCase().includes(lowercaseQuery)) ||
    product.description.toLowerCase().includes(lowercaseQuery)
  );
}

// Calculate total monthly cost
export function calculateMonthlyCost(recommendations: SupplementRecommendation[]): number {
  return recommendations.reduce((total, rec) => {
    const price = parseFloat(rec.productPrice || "0");
    return total + price;
  }, 0);
}