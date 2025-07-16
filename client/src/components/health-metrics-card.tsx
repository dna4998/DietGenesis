import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Activity, Target, TrendingUp, Star } from "lucide-react";
import { CountUpAnimation, MicroAnimation, PulseIndicator } from "./micro-animations";
import { useState, useEffect } from "react";
import type { Patient } from "@shared/schema";

interface HealthMetricsCardProps {
  patient: Patient;
}

export default function HealthMetricsCard({ patient }: HealthMetricsCardProps) {
  const [previousWeight, setPreviousWeight] = useState(patient.weight);
  const [previousBodyFat, setPreviousBodyFat] = useState(patient.bodyFat);
  const [showMetricChange, setShowMetricChange] = useState(false);

  // Calculate if metrics are improving
  const weightImproving = patient.weight < previousWeight;
  const bodyFatImproving = patient.bodyFat < previousBodyFat;
  const weightToGoalDiff = Math.abs(patient.weight - patient.weightGoal);
  const bodyFatToGoalDiff = Math.abs(patient.bodyFat - patient.bodyFatGoal);

  // Detect changes for animations
  useEffect(() => {
    if (patient.weight !== previousWeight || patient.bodyFat !== previousBodyFat) {
      setShowMetricChange(true);
      setTimeout(() => setShowMetricChange(false), 3000);
    }
    setPreviousWeight(patient.weight);
    setPreviousBodyFat(patient.bodyFat);
  }, [patient.weight, patient.bodyFat, previousWeight, previousBodyFat]);

  const getMetricStatus = (current: number, goal: number, isPercentage: boolean = false) => {
    const diff = Math.abs(current - goal);
    const threshold = isPercentage ? 2 : 10;
    
    if (diff <= threshold) return { color: "green", label: "On Target", pulse: true };
    if (diff <= threshold * 2) return { color: "blue", label: "Close", pulse: false };
    return { color: "yellow", label: "Working", pulse: false };
  };

  const weightStatus = getMetricStatus(patient.weight, patient.weightGoal);
  const bodyFatStatus = getMetricStatus(patient.bodyFat, patient.bodyFatGoal, true);

  return (
    <Card className="bg-gradient-to-br from-white via-green-50 to-blue-50 shadow-lg border border-green-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Health Metrics
          <MicroAnimation 
            type="improvement" 
            trigger={showMetricChange && (weightImproving || bodyFatImproving)}
            className="text-green-500"
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Weight Metric */}
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 relative">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-4 w-4 text-blue-600 mr-1" />
              <PulseIndicator 
                active={weightStatus.pulse} 
                color={weightStatus.color} 
                size="sm" 
              />
            </div>
            <CountUpAnimation 
              value={patient.weight} 
              className="text-2xl font-bold text-blue-600"
              duration={1.5}
            />
            <div className="text-sm text-gray-600 mt-1">Current Weight (lbs)</div>
            <div className="text-xs text-gray-500">Goal: {patient.weightGoal} lbs</div>
            <Badge 
              variant="secondary" 
              className={`mt-2 text-${weightStatus.color}-600 bg-${weightStatus.color}-100`}
            >
              {weightStatus.label}
            </Badge>
            {weightImproving && showMetricChange && (
              <div className="absolute top-2 right-2">
                <TrendingUp className="h-4 w-4 text-green-500 animate-bounce" />
              </div>
            )}
          </div>

          {/* Body Fat Metric */}
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 relative">
            <div className="flex items-center justify-center mb-2">
              <Activity className="h-4 w-4 text-green-600 mr-1" />
              <PulseIndicator 
                active={bodyFatStatus.pulse} 
                color={bodyFatStatus.color} 
                size="sm" 
              />
            </div>
            <CountUpAnimation 
              value={patient.bodyFat} 
              suffix="%" 
              className="text-2xl font-bold text-green-600"
              duration={1.5}
            />
            <div className="text-sm text-gray-600 mt-1">Body Fat</div>
            <div className="text-xs text-gray-500">Goal: {patient.bodyFatGoal}%</div>
            <Badge 
              variant="secondary" 
              className={`mt-2 text-${bodyFatStatus.color}-600 bg-${bodyFatStatus.color}-100`}
            >
              {bodyFatStatus.label}
            </Badge>
            {bodyFatImproving && showMetricChange && (
              <div className="absolute top-2 right-2">
                <TrendingUp className="h-4 w-4 text-green-500 animate-bounce" />
              </div>
            )}
          </div>

          {/* Blood Pressure */}
          <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200">
            <div className="flex items-center justify-center mb-2">
              <Heart className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-lg font-semibold text-amber-700">{patient.bloodPressure}</div>
            <div className="text-sm text-gray-600 mt-1">Blood Pressure</div>
            <div className="text-xs text-gray-500 mt-2">
              {patient.bloodPressure === "120/80" ? "Optimal" : "Monitor"}
            </div>
          </div>

          {/* Blood Sugar */}
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-lg font-semibold text-purple-700">{patient.bloodSugar}</div>
            <div className="text-sm text-gray-600 mt-1">Blood Sugar</div>
            <div className="text-xs text-gray-500 mt-2">
              {parseInt(patient.bloodSugar) < 100 ? "Normal" : "Monitor"}
            </div>
          </div>
        </div>

        {/* Insulin Resistance Status */}
        <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Insulin Resistance:</span>
              <MicroAnimation 
                type="streak" 
                trigger={!patient.insulinResistance}
                className="text-green-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                patient.insulinResistance 
                  ? "bg-red-100 text-red-800" 
                  : "bg-green-100 text-green-800"
              }`}>
                {patient.insulinResistance ? "Present" : "Not Present"}
              </span>
              <PulseIndicator 
                active={!patient.insulinResistance} 
                color={patient.insulinResistance ? "red" : "green"} 
                size="sm" 
              />
            </div>
          </div>
          {!patient.insulinResistance && (
            <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
              <Star className="h-3 w-3" />
              Excellent metabolic health!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
