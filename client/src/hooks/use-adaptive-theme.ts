import { useMemo } from 'react';
import type { Patient } from '@/../../shared/schema';

export interface HealthMetrics {
  weight?: number;
  bodyFat?: number;
  bloodPressure?: string;
  insulinResistance?: string;
  adherence?: number;
  exerciseMinutes?: number;
  glucoseAverage?: number;
  glucoseVariability?: number;
}

export interface AdaptiveTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  card: string;
  border: string;
  text: string;
  muted: string;
  healthScore: number;
  statusColor: 'excellent' | 'good' | 'fair' | 'needs-attention' | 'critical';
  statusMessage: string;
}

function calculateHealthScore(metrics: HealthMetrics): number {
  let score = 100;
  let factors = 0;

  // Weight management (BMI estimation - assuming average height)
  if (metrics.weight) {
    factors++;
    if (metrics.weight > 200) score -= 15;
    else if (metrics.weight > 180) score -= 10;
    else if (metrics.weight < 120) score -= 5;
  }

  // Body fat percentage
  if (metrics.bodyFat) {
    factors++;
    if (metrics.bodyFat > 30) score -= 20;
    else if (metrics.bodyFat > 25) score -= 10;
    else if (metrics.bodyFat < 15) score -= 5;
  }

  // Blood pressure analysis
  if (metrics.bloodPressure && typeof metrics.bloodPressure === 'string') {
    factors++;
    const bp = metrics.bloodPressure.toLowerCase();
    if (bp.includes('high') || bp.includes('hypertension')) score -= 25;
    else if (bp.includes('elevated') || bp.includes('prehypertension')) score -= 15;
    else if (bp.includes('low') || bp.includes('hypotension')) score -= 10;
  }

  // Insulin resistance
  if (metrics.insulinResistance && typeof metrics.insulinResistance === 'string') {
    factors++;
    const ir = metrics.insulinResistance.toLowerCase();
    if (ir.includes('high') || ir.includes('severe')) score -= 30;
    else if (ir.includes('moderate')) score -= 20;
    else if (ir.includes('mild') || ir.includes('slight')) score -= 10;
  }

  // Medication/plan adherence
  if (metrics.adherence !== undefined) {
    factors++;
    if (metrics.adherence < 50) score -= 25;
    else if (metrics.adherence < 70) score -= 15;
    else if (metrics.adherence < 85) score -= 5;
    else if (metrics.adherence > 95) score += 5;
  }

  // Exercise activity
  if (metrics.exerciseMinutes !== undefined) {
    factors++;
    if (metrics.exerciseMinutes < 75) score -= 15; // Below recommended 150min/week
    else if (metrics.exerciseMinutes < 150) score -= 10;
    else if (metrics.exerciseMinutes > 300) score += 5;
  }

  // Glucose management (if available)
  if (metrics.glucoseAverage) {
    factors++;
    if (metrics.glucoseAverage > 180) score -= 30;
    else if (metrics.glucoseAverage > 140) score -= 20;
    else if (metrics.glucoseAverage > 120) score -= 10;
    else if (metrics.glucoseAverage >= 70 && metrics.glucoseAverage <= 100) score += 5;
  }

  if (metrics.glucoseVariability) {
    factors++;
    if (metrics.glucoseVariability > 40) score -= 20;
    else if (metrics.glucoseVariability > 25) score -= 10;
    else if (metrics.glucoseVariability < 15) score += 5;
  }

  // Ensure we have enough data points for meaningful assessment
  if (factors < 3) {
    return Math.max(75, score); // Default to "good" range if insufficient data
  }

  return Math.max(0, Math.min(100, score));
}

function getThemeForScore(score: number): AdaptiveTheme {
  if (score >= 90) {
    return {
      primary: 'hsl(142, 76%, 36%)', // Rich green
      secondary: 'hsl(142, 76%, 46%)',
      accent: 'hsl(160, 84%, 39%)',
      background: 'hsl(143, 64%, 98%)',
      card: 'hsl(143, 64%, 96%)',
      border: 'hsl(142, 29%, 85%)',
      text: 'hsl(142, 13%, 15%)',
      muted: 'hsl(142, 13%, 45%)',
      healthScore: score,
      statusColor: 'excellent',
      statusMessage: 'Excellent health metrics - keep up the great work!'
    };
  } else if (score >= 75) {
    return {
      primary: 'hsl(213, 94%, 68%)', // Bright blue
      secondary: 'hsl(213, 94%, 78%)',
      accent: 'hsl(204, 94%, 68%)',
      background: 'hsl(213, 100%, 98%)',
      card: 'hsl(213, 100%, 96%)',
      border: 'hsl(213, 27%, 84%)',
      text: 'hsl(213, 13%, 15%)',
      muted: 'hsl(213, 13%, 45%)',
      healthScore: score,
      statusColor: 'good',
      statusMessage: 'Good health metrics - you\'re on the right track!'
    };
  } else if (score >= 60) {
    return {
      primary: 'hsl(45, 93%, 47%)', // Amber/gold
      secondary: 'hsl(45, 93%, 57%)',
      accent: 'hsl(38, 92%, 50%)',
      background: 'hsl(45, 100%, 98%)',
      card: 'hsl(45, 100%, 96%)',
      border: 'hsl(45, 34%, 78%)',
      text: 'hsl(45, 13%, 15%)',
      muted: 'hsl(45, 13%, 45%)',
      healthScore: score,
      statusColor: 'fair',
      statusMessage: 'Fair health metrics - some areas need attention.'
    };
  } else if (score >= 40) {
    return {
      primary: 'hsl(24, 95%, 53%)', // Orange
      secondary: 'hsl(24, 95%, 63%)',
      accent: 'hsl(20, 91%, 48%)',
      background: 'hsl(24, 100%, 98%)',
      card: 'hsl(24, 100%, 96%)',
      border: 'hsl(24, 34%, 78%)',
      text: 'hsl(24, 13%, 15%)',
      muted: 'hsl(24, 13%, 45%)',
      healthScore: score,
      statusColor: 'needs-attention',
      statusMessage: 'Health metrics need attention - let\'s work together on improvements.'
    };
  } else {
    return {
      primary: 'hsl(0, 84%, 60%)', // Red
      secondary: 'hsl(0, 84%, 70%)',
      accent: 'hsl(0, 72%, 51%)',
      background: 'hsl(0, 100%, 98%)',
      card: 'hsl(0, 100%, 96%)',
      border: 'hsl(0, 34%, 78%)',
      text: 'hsl(0, 13%, 15%)',
      muted: 'hsl(0, 13%, 45%)',
      healthScore: score,
      statusColor: 'critical',
      statusMessage: 'Critical health metrics - immediate attention recommended.'
    };
  }
}

export function useAdaptiveTheme(patient?: Patient): AdaptiveTheme {
  return useMemo(() => {
    if (!patient) {
      // Default theme for no patient data
      return getThemeForScore(75);
    }

    const metrics: HealthMetrics = {
      weight: patient.weight || undefined,
      bodyFat: patient.bodyFat || undefined,
      bloodPressure: patient.bloodPressure || undefined,
      insulinResistance: patient.insulinResistance || undefined,
      adherence: patient.adherence || undefined,
      // Additional metrics could be derived from other data sources
    };

    const healthScore = calculateHealthScore(metrics);
    return getThemeForScore(healthScore);
  }, [patient]);
}

export function useHealthStatus(patient?: Patient) {
  const theme = useAdaptiveTheme(patient);
  
  return {
    score: theme.healthScore,
    status: theme.statusColor,
    message: theme.statusMessage,
    color: theme.primary,
    recommendations: generateRecommendations(theme.statusColor, patient)
  };
}

function generateRecommendations(status: AdaptiveTheme['statusColor'], patient?: Patient): string[] {
  const recommendations: string[] = [];

  switch (status) {
    case 'excellent':
      recommendations.push('Maintain your current healthy lifestyle');
      recommendations.push('Consider setting new fitness goals');
      recommendations.push('Share your success strategies with others');
      break;
      
    case 'good':
      recommendations.push('Focus on consistency with current routines');
      recommendations.push('Consider adding new healthy habits');
      recommendations.push('Monitor progress regularly');
      break;
      
    case 'fair':
      recommendations.push('Review diet and exercise plans with your provider');
      recommendations.push('Increase physical activity gradually');
      recommendations.push('Focus on medication adherence');
      break;
      
    case 'needs-attention':
      recommendations.push('Schedule follow-up with healthcare provider');
      recommendations.push('Prioritize consistent medication adherence');
      recommendations.push('Consider working with a nutritionist');
      break;
      
    case 'critical':
      recommendations.push('Contact your healthcare provider immediately');
      recommendations.push('Review emergency action plan');
      recommendations.push('Consider intensive monitoring');
      break;
  }

  // Add patient-specific recommendations
  if (patient) {
    if (patient.adherence && patient.adherence < 70) {
      recommendations.push('Set medication reminders to improve adherence');
    }
    if (patient.weight && patient.weight > 200) {
      recommendations.push('Focus on sustainable weight management strategies');
    }
    if (patient.insulinResistance && typeof patient.insulinResistance === 'string' && patient.insulinResistance.toLowerCase().includes('high')) {
      recommendations.push('Prioritize blood sugar management');
    }
  }

  return recommendations.slice(0, 4); // Limit to 4 recommendations
}