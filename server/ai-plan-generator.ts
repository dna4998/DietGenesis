import OpenAI from "openai";
import type { Patient } from "@shared/schema";

const openai = new OpenAI({ baseURL: "https://api.x.ai/v1", apiKey: process.env.XAI_API_KEY });

export interface LabAnalysisResult {
  keyFindings: string[];
  metabolicMarkers: string[];
  nutritionalDeficiencies: string[];
  recommendations: string[];
}

export interface GutBiomeAnalysisResult {
  diversityScore: string;
  beneficialBacteria: string[];
  harmfulBacteria: string[];
  inflammationMarkers: string[];
  recommendations: string[];
}

export interface ComprehensivePlan {
  dietPlan: string;
  supplementPlan: string[];
  exercisePlan: string;
  rationale: string;
  keyMetrics: string[];
  followUpRecommendations: string[];
}

export async function analyzeLabResults(patient: Patient, labResultsContent: string): Promise<LabAnalysisResult> {
  const prompt = `As a functional medicine practitioner, analyze these lab results for ${patient.name} (Age: ${patient.age}, Weight: ${patient.weight}lbs, Body Fat: ${patient.bodyFat}%, Current Health Status: ${patient.healthStatus}).

Lab Results Content:
${labResultsContent}

Provide a comprehensive analysis focusing on:
1. Key findings and abnormal values
2. Metabolic markers and their implications
3. Nutritional deficiencies identified
4. Specific recommendations for improvement

Respond in JSON format with the following structure:
{
  "keyFindings": ["finding1", "finding2"],
  "metabolicMarkers": ["marker1 status", "marker2 status"],
  "nutritionalDeficiencies": ["deficiency1", "deficiency2"],
  "recommendations": ["recommendation1", "recommendation2"]
}`;

  const response = await openai.chat.completions.create({
    model: "grok-2-1212",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content);
}

export async function analyzeGutBiome(patient: Patient, gutBiomeContent: string): Promise<GutBiomeAnalysisResult> {
  const prompt = `As a functional medicine practitioner specializing in gut health, analyze this gut biome test for ${patient.name} (Age: ${patient.age}, Weight: ${patient.weight}lbs, Health Status: ${patient.healthStatus}).

Gut Biome Test Content:
${gutBiomeContent}

Provide a comprehensive analysis focusing on:
1. Overall microbiome diversity score
2. Beneficial bacteria levels
3. Harmful bacteria or pathogens
4. Inflammation markers
5. Specific recommendations for gut health improvement

Respond in JSON format with the following structure:
{
  "diversityScore": "score and interpretation",
  "beneficialBacteria": ["bacteria1 level", "bacteria2 level"],
  "harmfulBacteria": ["pathogen1 level", "pathogen2 level"],
  "inflammationMarkers": ["marker1 status", "marker2 status"],
  "recommendations": ["recommendation1", "recommendation2"]
}`;

  const response = await openai.chat.completions.create({
    model: "grok-2-1212",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content);
}

export async function generateComprehensivePlan(
  patient: Patient,
  labAnalysis?: LabAnalysisResult,
  gutBiomeAnalysis?: GutBiomeAnalysisResult
): Promise<ComprehensivePlan> {
  const analysisContext = [];
  
  if (labAnalysis) {
    analysisContext.push(`Lab Analysis Results:
- Key Findings: ${labAnalysis.keyFindings.join(', ')}
- Metabolic Markers: ${labAnalysis.metabolicMarkers.join(', ')}
- Nutritional Deficiencies: ${labAnalysis.nutritionalDeficiencies.join(', ')}
- Lab Recommendations: ${labAnalysis.recommendations.join(', ')}`);
  }
  
  if (gutBiomeAnalysis) {
    analysisContext.push(`Gut Biome Analysis Results:
- Diversity Score: ${gutBiomeAnalysis.diversityScore}
- Beneficial Bacteria: ${gutBiomeAnalysis.beneficialBacteria.join(', ')}
- Harmful Bacteria: ${gutBiomeAnalysis.harmfulBacteria.join(', ')}
- Inflammation Markers: ${gutBiomeAnalysis.inflammationMarkers.join(', ')}
- Gut Health Recommendations: ${gutBiomeAnalysis.recommendations.join(', ')}`);
  }

  const prompt = `As a functional medicine practitioner, create a comprehensive treatment plan for ${patient.name}.

Patient Profile:
- Age: ${patient.age}
- Weight: ${patient.weight}lbs
- Body Fat: ${patient.bodyFat}%
- Blood Pressure: ${patient.bloodPressure}
- Health Status: ${patient.healthStatus}
- Current Diet Plan: ${patient.dietPlan || 'None assigned'}
- Current Exercise Plan: ${patient.exercisePlan || 'None assigned'}
- Current Supplements: ${patient.supplements?.join(', ') || 'None'}

${analysisContext.join('\n\n')}

Create a personalized plan that includes:
1. Detailed diet plan with specific foods and meal timing
2. Supplement protocol with dosages and timing
3. Exercise plan tailored to their condition
4. Scientific rationale for each recommendation
5. Key metrics to track progress
6. Follow-up recommendations

Respond in JSON format:
{
  "dietPlan": "detailed diet plan with specific recommendations",
  "supplementPlan": ["supplement1 with dosage", "supplement2 with dosage"],
  "exercisePlan": "detailed exercise plan with frequency and intensity",
  "rationale": "scientific explanation for the plan",
  "keyMetrics": ["metric1 to track", "metric2 to track"],
  "followUpRecommendations": ["recommendation1", "recommendation2"]
}`;

  const response = await openai.chat.completions.create({
    model: "grok-2-1212",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content);
}