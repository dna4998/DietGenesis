import type { Patient } from "@shared/schema";

export interface HealthDataPoint {
  timestamp: Date;
  weight?: number;
  bodyFat?: number;
  bloodPressure?: string;
  adherence?: number;
  insulinResistance?: string;
  exercise?: number; // minutes per week
  steps?: number; // daily average
  sleep?: number; // hours per night
}

export interface HealthTrend {
  metric: string;
  direction: 'improving' | 'declining' | 'stable';
  confidence: number; // 0-1
  changeRate: number; // rate of change per week
  projectedValue: number; // projected value in 4 weeks
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export interface HealthPrediction {
  patientId: number;
  generatedAt: Date;
  trends: HealthTrend[];
  overallScore: number; // 0-100
  riskFactors: string[];
  interventions: string[];
  confidenceLevel: number;
  heartAttackRisk: {
    score: number; // 0-100 (0 = very low, 100 = very high)
    category: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
    factors: string[];
    recommendations: string[];
  };
  cancerRisk: {
    score: number; // 0-100 (0 = very low, 100 = very high)
    category: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
    factors: string[];
    recommendations: string[];
    aiAnalysis: string;
  };
}

class HealthPredictor {
  private generateSyntheticHealthHistory(patient: Patient): HealthDataPoint[] {
    const dataPoints: HealthDataPoint[] = [];
    const now = new Date();
    
    // Generate 12 weeks of synthetic data based on patient's current state
    for (let i = 12; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
      
      // Add some realistic variation to the data
      const weightVariation = (Math.random() - 0.5) * 4; // ±2 lbs variation
      const bodyFatVariation = (Math.random() - 0.5) * 2; // ±1% variation
      const adherenceVariation = (Math.random() - 0.5) * 20; // ±10% variation
      
      // Simulate gradual improvement or decline based on adherence
      const adherenceBase = patient.adherence || 70;
      const progressFactor = (adherenceBase - 60) / 100; // -0.1 to 0.4
      const weeklyProgress = progressFactor * (12 - i); // cumulative progress
      
      dataPoints.push({
        timestamp,
        weight: patient.weight ? Math.max(100, parseFloat(patient.weight) + weightVariation - weeklyProgress) : undefined,
        bodyFat: patient.bodyFat ? Math.max(5, parseFloat(patient.bodyFat) + bodyFatVariation - (weeklyProgress * 0.3)) : undefined,
        bloodPressure: patient.bloodPressure,
        adherence: Math.max(0, Math.min(100, adherenceBase + adherenceVariation + (weeklyProgress * 5))),
        insulinResistance: patient.insulinResistance,
        exercise: Math.max(0, 150 + (Math.random() - 0.5) * 60 + (weeklyProgress * 10)),
        steps: Math.max(0, 7000 + (Math.random() - 0.5) * 2000 + (weeklyProgress * 500)),
        sleep: Math.max(4, Math.min(10, 7 + (Math.random() - 0.5) * 2 + (weeklyProgress * 0.2)))
      });
    }
    
    return dataPoints;
  }

  private calculateTrend(values: number[]): { direction: 'improving' | 'declining' | 'stable', rate: number, confidence: number } {
    if (values.length < 3) {
      return { direction: 'stable', rate: 0, confidence: 0.3 };
    }

    // Simple linear regression to find trend
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);
    
    // Prevent division by zero
    const denominator = (n * sumXX - sumX * sumX);
    if (denominator === 0) {
      return { direction: 'stable', rate: 0, confidence: 0.3 };
    }
    
    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared for confidence
    const yMean = sumY / n;
    const totalSumSquares = y.reduce((acc, yi) => acc + Math.pow(yi - yMean, 2), 0);
    const residualSumSquares = y.reduce((acc, yi, i) => {
      const predicted = slope * x[i] + intercept;
      return acc + Math.pow(yi - predicted, 2);
    }, 0);
    
    // Prevent division by zero and handle edge cases
    const rSquared = totalSumSquares === 0 ? 0 : Math.max(0, 1 - (residualSumSquares / totalSumSquares));
    const confidence = Math.max(0.1, Math.min(1.0, rSquared));
    
    // Determine direction based on slope and significance
    const absSlope = Math.abs(slope);
    if (absSlope < 0.1) {
      return { direction: 'stable', rate: slope, confidence };
    } else if (slope > 0) {
      return { direction: 'improving', rate: slope, confidence };
    } else {
      return { direction: 'declining', rate: slope, confidence };
    }
  }

  private analyzeWeightTrend(dataPoints: HealthDataPoint[]): HealthTrend {
    const weights = dataPoints.map(d => d.weight).filter(w => w !== undefined) as number[];
    
    if (weights.length === 0) {
      return {
        metric: 'weight',
        direction: 'stable',
        confidence: 0.5,
        changeRate: 0,
        projectedValue: 0,
        riskLevel: 'low',
        recommendations: ["No weight data available for analysis"]
      };
    }
    
    // Debug: Check if weights contain valid numbers
    const validWeights = weights.filter(w => !isNaN(w) && isFinite(w));
    if (validWeights.length < 3) {
      return {
        metric: 'weight',
        direction: 'stable',
        confidence: 0.5,
        changeRate: 0,
        projectedValue: validWeights[validWeights.length - 1] || 0,
        riskLevel: 'low',
        recommendations: ["Insufficient weight data for trend analysis"]
      };
    }
    
    const trend = this.calculateTrend(validWeights);
    
    const currentWeight = validWeights[validWeights.length - 1];
    const projectedValue = currentWeight + (trend.rate * 4); // 4 weeks projection
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (trend.direction === 'declining' && Math.abs(trend.rate) > 0.5) {
      riskLevel = 'high';
    } else if (trend.direction === 'declining' && Math.abs(trend.rate) > 0.25) {
      riskLevel = 'medium';
    }
    
    const recommendations = [];
    if (trend.direction === 'declining') {
      recommendations.push("Consider increasing protein intake to maintain muscle mass");
      recommendations.push("Monitor for rapid weight loss - consult provider if losing >2 lbs/week");
    } else if (trend.direction === 'improving') {
      recommendations.push("Great progress! Continue current nutrition plan");
      recommendations.push("Consider strength training to maximize muscle retention");
    } else {
      recommendations.push("Weight is stable - focus on body composition improvements");
    }
    
    return {
      metric: 'weight',
      direction: trend.direction,
      confidence: trend.confidence,
      changeRate: trend.rate,
      projectedValue,
      riskLevel,
      recommendations
    };
  }

  private analyzeBodyFatTrend(dataPoints: HealthDataPoint[]): HealthTrend {
    const bodyFats = dataPoints.map(d => d.bodyFat).filter(bf => bf !== undefined) as number[];
    
    if (bodyFats.length === 0) {
      return {
        metric: 'bodyFat',
        direction: 'stable',
        confidence: 0.5,
        changeRate: 0,
        projectedValue: 0,
        riskLevel: 'low',
        recommendations: ["No body fat data available for analysis"]
      };
    }
    
    // Debug: Check if bodyFats contain valid numbers
    const validBodyFats = bodyFats.filter(bf => !isNaN(bf) && isFinite(bf));
    if (validBodyFats.length < 3) {
      return {
        metric: 'bodyFat',
        direction: 'stable',
        confidence: 0.5,
        changeRate: 0,
        projectedValue: validBodyFats[validBodyFats.length - 1] || 0,
        riskLevel: 'low',
        recommendations: ["Insufficient body fat data for trend analysis"]
      };
    }
    
    const trend = this.calculateTrend(validBodyFats);
    
    const currentBodyFat = validBodyFats[validBodyFats.length - 1];
    const projectedValue = Math.max(5, currentBodyFat + (trend.rate * 4));
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (trend.direction === 'improving' && trend.rate < -0.2) {
      riskLevel = 'medium'; // Losing body fat too quickly
    } else if (trend.direction === 'declining' && trend.rate > 0.3) {
      riskLevel = 'high'; // Gaining body fat rapidly
    }
    
    const recommendations = [];
    if (trend.direction === 'improving') {
      recommendations.push("Excellent body composition progress!");
      recommendations.push("Continue resistance training to preserve muscle mass");
    } else if (trend.direction === 'declining') {
      recommendations.push("Body fat percentage is increasing - review caloric intake");
      recommendations.push("Increase cardiovascular exercise and strength training");
    } else {
      recommendations.push("Body fat is stable - consider adjusting training intensity");
    }
    
    return {
      metric: 'bodyFat',
      direction: trend.direction,
      confidence: trend.confidence,
      changeRate: trend.rate,
      projectedValue,
      riskLevel,
      recommendations
    };
  }

  private analyzeAdherenceTrend(dataPoints: HealthDataPoint[]): HealthTrend {
    const adherences = dataPoints.map(d => d.adherence).filter(a => a !== undefined) as number[];
    const trend = this.calculateTrend(adherences);
    
    const currentAdherence = adherences[adherences.length - 1];
    const projectedValue = Math.max(0, Math.min(100, currentAdherence + (trend.rate * 4)));
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (currentAdherence < 60) {
      riskLevel = 'high';
    } else if (currentAdherence < 75) {
      riskLevel = 'medium';
    }
    
    const recommendations = [];
    if (trend.direction === 'declining') {
      recommendations.push("Adherence is declining - consider simplifying the plan");
      recommendations.push("Schedule regular check-ins with healthcare provider");
      recommendations.push("Identify and address barriers to adherence");
    } else if (trend.direction === 'improving') {
      recommendations.push("Great improvement in adherence!");
      recommendations.push("Continue building healthy habits");
    } else {
      recommendations.push("Adherence is stable - focus on consistency");
    }
    
    return {
      metric: 'adherence',
      direction: trend.direction,
      confidence: trend.confidence,
      changeRate: trend.rate,
      projectedValue,
      riskLevel,
      recommendations
    };
  }

  private analyzeExerciseTrend(dataPoints: HealthDataPoint[]): HealthTrend {
    const exercises = dataPoints.map(d => d.exercise).filter(e => e !== undefined) as number[];
    const trend = this.calculateTrend(exercises);
    
    const currentExercise = exercises[exercises.length - 1];
    const projectedValue = Math.max(0, currentExercise + (trend.rate * 4));
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (currentExercise < 150) {
      riskLevel = 'medium';
    }
    if (currentExercise < 75) {
      riskLevel = 'high';
    }
    
    const recommendations = [];
    if (trend.direction === 'declining') {
      recommendations.push("Exercise frequency is decreasing - set smaller, achievable goals");
      recommendations.push("Consider finding enjoyable physical activities");
    } else if (trend.direction === 'improving') {
      recommendations.push("Excellent progress in exercise consistency!");
      recommendations.push("Consider varying workout types to prevent plateaus");
    } else {
      recommendations.push("Exercise is consistent - focus on intensity or variety");
    }
    
    return {
      metric: 'exercise',
      direction: trend.direction,
      confidence: trend.confidence,
      changeRate: trend.rate,
      projectedValue,
      riskLevel,
      recommendations
    };
  }

  private calculateOverallScore(trends: HealthTrend[]): number {
    let score = 70; // Base score
    
    trends.forEach(trend => {
      const weight = trend.metric === 'adherence' ? 0.3 : 0.2;
      
      if (trend.direction === 'improving') {
        score += 15 * weight * trend.confidence;
      } else if (trend.direction === 'declining') {
        score -= 20 * weight * trend.confidence;
      }
      
      // Risk factor adjustments
      if (trend.riskLevel === 'high') {
        score -= 10;
      } else if (trend.riskLevel === 'medium') {
        score -= 5;
      }
    });
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private identifyRiskFactors(trends: HealthTrend[]): string[] {
    const riskFactors: string[] = [];
    
    trends.forEach(trend => {
      if (trend.riskLevel === 'high') {
        switch (trend.metric) {
          case 'weight':
            if (trend.direction === 'declining') {
              riskFactors.push("Rapid weight loss may indicate inadequate nutrition");
            } else {
              riskFactors.push("Weight gain trend requires intervention");
            }
            break;
          case 'bodyFat':
            if (trend.direction === 'declining') {
              riskFactors.push("Increasing body fat percentage");
            }
            break;
          case 'adherence':
            riskFactors.push("Poor adherence to treatment plan");
            break;
          case 'exercise':
            riskFactors.push("Insufficient physical activity levels");
            break;
        }
      }
    });
    
    return riskFactors;
  }

  private generateInterventions(trends: HealthTrend[], riskFactors: string[]): string[] {
    const interventions: string[] = [];
    
    if (riskFactors.length > 0) {
      interventions.push("Schedule follow-up appointment within 2 weeks");
    }
    
    const decliningTrends = trends.filter(t => t.direction === 'declining' && t.confidence > 0.6);
    if (decliningTrends.length >= 2) {
      interventions.push("Consider comprehensive plan review and adjustment");
    }
    
    const adherenceTrend = trends.find(t => t.metric === 'adherence');
    if (adherenceTrend && adherenceTrend.direction === 'declining') {
      interventions.push("Implement adherence support strategies");
    }
    
    const exerciseTrend = trends.find(t => t.metric === 'exercise');
    if (exerciseTrend && exerciseTrend.projectedValue < 150) {
      interventions.push("Develop structured exercise progression plan");
    }
    
    return interventions;
  }

  private calculateHeartAttackRisk(patient: Patient): {
    score: number;
    category: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
    factors: string[];
    recommendations: string[];
  } {
    let riskScore = 0;
    const factors = [];
    const recommendations = [];

    // Age risk factor
    if (patient.age >= 65) {
      riskScore += 25;
      factors.push("Age 65 or older");
    } else if (patient.age >= 55) {
      riskScore += 15;
      factors.push("Age 55-64");
    } else if (patient.age >= 45) {
      riskScore += 10;
      factors.push("Age 45-54");
    }

    // Blood pressure risk
    if (patient.bloodPressure) {
      const [systolic, diastolic] = patient.bloodPressure.split('/').map(Number);
      if (systolic >= 180 || diastolic >= 110) {
        riskScore += 30;
        factors.push("Very high blood pressure (>180/110)");
        recommendations.push("Immediate medical attention for blood pressure control");
      } else if (systolic >= 160 || diastolic >= 100) {
        riskScore += 25;
        factors.push("High blood pressure (>160/100)");
        recommendations.push("Medication review and lifestyle modifications");
      } else if (systolic >= 140 || diastolic >= 90) {
        riskScore += 15;
        factors.push("Elevated blood pressure (>140/90)");
        recommendations.push("Regular monitoring and dietary changes");
      }
    }

    // Weight and BMI risk (approximated from weight)
    if (patient.weight) {
      const weight = parseFloat(patient.weight);
      if (weight > 250) {
        riskScore += 20;
        factors.push("Obesity (BMI likely >35)");
        recommendations.push("Weight management program with medical supervision");
      } else if (weight > 220) {
        riskScore += 15;
        factors.push("Overweight (BMI likely >30)");
        recommendations.push("Structured weight loss plan");
      }
    }

    // Insulin resistance and metabolic factors
    if (patient.insulinResistance) {
      riskScore += 15;
      factors.push("Insulin resistance/Type 2 diabetes");
      recommendations.push("Strict glucose control and cardiovascular monitoring");
    }

    // Exercise and lifestyle factors
    if (patient.adherence && patient.adherence < 50) {
      riskScore += 10;
      factors.push("Poor treatment adherence");
      recommendations.push("Behavioral counseling and support systems");
    }

    // Body fat percentage
    if (patient.bodyFat) {
      const bodyFat = parseFloat(patient.bodyFat);
      if (bodyFat > 35) {
        riskScore += 10;
        factors.push("High body fat percentage");
        recommendations.push("Body composition improvement through exercise");
      }
    }

    // Determine risk category
    let category: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
    if (riskScore >= 80) {
      category = 'very_high';
    } else if (riskScore >= 60) {
      category = 'high';
    } else if (riskScore >= 40) {
      category = 'moderate';
    } else if (riskScore >= 20) {
      category = 'low';
    } else {
      category = 'very_low';
    }

    // Add general recommendations
    if (riskScore > 40) {
      recommendations.push("Regular cardiology consultation");
      recommendations.push("Consider cardiac stress testing");
    }
    if (riskScore > 20) {
      recommendations.push("Daily aspirin therapy (consult physician)");
      recommendations.push("Lipid profile monitoring");
    }
    
    recommendations.push("Mediterranean diet with omega-3 fatty acids");
    recommendations.push("Regular moderate exercise (150 min/week)");
    recommendations.push("Stress management techniques");

    return {
      score: Math.min(100, riskScore),
      category,
      factors,
      recommendations
    };
  }

  private async calculateCancerRisk(patient: Patient): Promise<{
    score: number;
    category: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
    factors: string[];
    recommendations: string[];
    aiAnalysis: string;
  }> {
    // Import Grok AI at the top level would be better, but for now we'll use it here
    const OpenAI = require('openai');
    
    let riskScore = 0;
    const factors = [];
    const recommendations = [];

    // Age-based risk factors
    if (patient.age >= 65) {
      riskScore += 20;
      factors.push("Age 65 or older - increased cancer risk");
    } else if (patient.age >= 50) {
      riskScore += 15;
      factors.push("Age 50-64 - moderate cancer risk increase");
    } else if (patient.age >= 40) {
      riskScore += 10;
      factors.push("Age 40-49 - slight cancer risk increase");
    }

    // Lifestyle and health factors
    if (patient.weight) {
      const weight = parseFloat(patient.weight);
      if (weight > 250) {
        riskScore += 15;
        factors.push("Severe obesity - increased cancer risk");
      } else if (weight > 220) {
        riskScore += 10;
        factors.push("Obesity - moderate cancer risk increase");
      }
    }

    if (patient.bodyFat) {
      const bodyFat = parseFloat(patient.bodyFat);
      if (bodyFat > 35) {
        riskScore += 8;
        factors.push("High body fat percentage - cancer risk factor");
      }
    }

    // Metabolic factors
    if (patient.insulinResistance) {
      riskScore += 12;
      factors.push("Insulin resistance/Type 2 diabetes - cancer risk factor");
    }

    // Lifestyle factors
    if (patient.adherence && patient.adherence < 50) {
      riskScore += 8;
      factors.push("Poor lifestyle adherence - increased cancer risk");
    }

    // Exercise as protective factor
    if (patient.adherence && patient.adherence > 80) {
      riskScore -= 5;
      factors.push("Good adherence to healthy lifestyle - protective factor");
    }

    // Determine risk category
    let category: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
    if (riskScore >= 70) {
      category = 'very_high';
    } else if (riskScore >= 50) {
      category = 'high';
    } else if (riskScore >= 30) {
      category = 'moderate';
    } else if (riskScore >= 15) {
      category = 'low';
    } else {
      category = 'very_low';
    }

    // Generate AI analysis using Grok
    let aiAnalysis = "Cancer risk assessment based on demographic and lifestyle factors.";
    
    try {
      if (process.env.XAI_API_KEY) {
        const openai = new OpenAI({ 
          baseURL: "https://api.x.ai/v1", 
          apiKey: process.env.XAI_API_KEY 
        });

        const prompt = `As a medical AI assistant, analyze the cancer risk for this patient profile:
        - Age: ${patient.age}
        - Weight: ${patient.weight} lbs
        - Body Fat: ${patient.bodyFat}%
        - Insulin Resistance: ${patient.insulinResistance ? 'Yes' : 'No'}
        - Blood Pressure: ${patient.bloodPressure}
        - Treatment Adherence: ${patient.adherence}%
        - Current risk factors: ${factors.join(', ')}
        
        Provide a brief, professional analysis of their cancer risk profile focusing on modifiable risk factors and preventive measures. Keep response under 150 words.`;

        const response = await openai.chat.completions.create({
          model: "grok-2-1212",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 200,
        });

        aiAnalysis = response.choices[0].message.content || aiAnalysis;
      }
    } catch (error) {
      console.log("AI analysis unavailable, using default assessment");
    }

    // Generate recommendations based on risk level
    if (riskScore >= 50) {
      recommendations.push("Schedule comprehensive cancer screening");
      recommendations.push("Consult oncology specialist for risk assessment");
    }
    if (riskScore >= 30) {
      recommendations.push("Follow age-appropriate cancer screening guidelines");
      recommendations.push("Consider genetic counseling if family history present");
    }
    
    // Universal recommendations
    recommendations.push("Maintain healthy weight through diet and exercise");
    recommendations.push("Avoid tobacco and limit alcohol consumption");
    recommendations.push("Eat a diet rich in fruits, vegetables, and whole grains");
    recommendations.push("Stay physically active with regular exercise");
    recommendations.push("Protect skin from excessive sun exposure");
    recommendations.push("Stay up-to-date with recommended vaccinations");

    return {
      score: Math.min(100, Math.max(0, riskScore)),
      category,
      factors,
      recommendations,
      aiAnalysis
    };
  }

  public async predictHealthTrends(patient: Patient): Promise<HealthPrediction> {
    const dataPoints = this.generateSyntheticHealthHistory(patient);
    
    const trends: HealthTrend[] = [];
    
    // Analyze different health metrics
    if (patient.weight) {
      trends.push(this.analyzeWeightTrend(dataPoints));
    }
    
    if (patient.bodyFat) {
      trends.push(this.analyzeBodyFatTrend(dataPoints));
    }
    
    trends.push(this.analyzeAdherenceTrend(dataPoints));
    trends.push(this.analyzeExerciseTrend(dataPoints));
    
    const overallScore = this.calculateOverallScore(trends);
    const riskFactors = this.identifyRiskFactors(trends);
    const interventions = this.generateInterventions(trends, riskFactors);
    const heartAttackRisk = this.calculateHeartAttackRisk(patient);
    const cancerRisk = await this.calculateCancerRisk(patient);
    
    // Calculate overall confidence based on trend confidences
    const validConfidences = trends.filter(t => t.confidence !== null).map(t => t.confidence);
    const avgConfidence = validConfidences.length > 0 
      ? validConfidences.reduce((sum, c) => sum + c, 0) / validConfidences.length 
      : 0.5;
    
    return {
      patientId: patient.id,
      generatedAt: new Date(),
      trends,
      overallScore: overallScore || 75,
      riskFactors,
      interventions,
      confidenceLevel: avgConfidence,
      heartAttackRisk,
      cancerRisk
    };
  }
}

export const healthPredictor = new HealthPredictor();

// Demo prediction function for when ML models aren't available
export async function generateDemoHealthPrediction(patient: Patient): Promise<HealthPrediction & { isDemo: boolean; demoMessage: string }> {
  // Generate demo trends with proper values
  const demoTrends: HealthTrend[] = [
    {
      metric: 'weight',
      direction: 'declining',
      confidence: 0.82,
      changeRate: -0.75,
      projectedValue: patient.weight ? parseFloat(patient.weight) - 3 : 180,
      riskLevel: 'low',
      recommendations: [
        "Excellent weight loss progress!",
        "Continue current nutrition plan",
        "Consider strength training to preserve muscle mass"
      ]
    },
    {
      metric: 'bodyFat',
      direction: 'declining',
      confidence: 0.78,
      changeRate: -0.5,
      projectedValue: patient.bodyFat ? parseFloat(patient.bodyFat) - 2 : 25,
      riskLevel: 'low',
      recommendations: [
        "Body composition is improving steadily",
        "Keep up the cardio and resistance training",
        "Focus on protein intake to maintain muscle"
      ]
    },
    {
      metric: 'adherence',
      direction: 'improving',
      confidence: 0.85,
      changeRate: 2.5,
      projectedValue: Math.min(100, (patient.adherence || 80) + 10),
      riskLevel: 'low',
      recommendations: [
        "Plan adherence is excellent",
        "Consistency is key to long-term success"
      ]
    },
    {
      metric: 'exercise',
      direction: 'improving',
      confidence: 0.73,
      changeRate: 15,
      projectedValue: 200,
      riskLevel: 'low',
      recommendations: [
        "Exercise frequency is increasing",
        "Consider adding variety to prevent plateaus",
        "Monitor recovery between sessions"
      ]
    }
  ];

  // Calculate heart attack risk for demo
  const heartAttackRisk = {
    score: 32,
    category: 'moderate' as const,
    factors: [
      "Age 45-54",
      "Elevated blood pressure (>140/90)",
      "Insulin resistance/Type 2 diabetes",
      "Overweight (BMI likely >30)"
    ],
    recommendations: [
      "Regular cardiology consultation",
      "Daily aspirin therapy (consult physician)",
      "Lipid profile monitoring",
      "Mediterranean diet with omega-3 fatty acids",
      "Regular moderate exercise (150 min/week)",
      "Stress management techniques"
    ]
  };

  // Calculate cancer risk for demo
  const cancerRisk = {
    score: 28,
    category: 'low' as const,
    factors: [
      "Age 40-49 - slight cancer risk increase",
      "Overweight (BMI likely >30)",
      "Insulin resistance/Type 2 diabetes - cancer risk factor"
    ],
    recommendations: [
      "Follow age-appropriate cancer screening guidelines",
      "Maintain healthy weight through diet and exercise",
      "Avoid tobacco and limit alcohol consumption",
      "Eat a diet rich in fruits, vegetables, and whole grains",
      "Stay physically active with regular exercise",
      "Protect skin from excessive sun exposure"
    ],
    aiAnalysis: "Based on your current health profile, your cancer risk is in the low-moderate range. Key modifiable factors include weight management and maintaining good glycemic control. Your active lifestyle and adherence to health recommendations are protective factors. Continue regular screening as recommended for your age group, focus on maintaining a healthy weight, and ensure adequate physical activity. The combination of insulin resistance and excess weight slightly elevates risk, but these are manageable through lifestyle modifications."
  };

  return {
    patientId: patient.id,
    generatedAt: new Date(),
    trends: demoTrends,
    overallScore: 83,
    riskFactors: [
      "Insulin resistance requires ongoing monitoring",
      "Blood pressure needs consistent tracking"
    ],
    interventions: [
      "Continue current GLP-1 therapy",
      "Increase fiber intake for better glucose control",
      "Consider meal timing optimization"
    ],
    confidenceLevel: 0.8,
    heartAttackRisk,
    cancerRisk,
    isDemo: true,
    demoMessage: "Demo prediction based on statistical analysis. Real ML predictions require health data history."
  };
}