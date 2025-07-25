import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Activity, Target, TrendingUp, Star, Plus } from "lucide-react";
import { CountUpAnimation, MicroAnimation, PulseIndicator } from "./micro-animations";
import { useState, useEffect } from "react";
import type { Patient } from "@shared/schema";
import DailyMetricsInput from "./daily-metrics-input";

interface HealthMetricsCardProps {
  patient: Patient;
}

export default function HealthMetricsCard({ patient }: HealthMetricsCardProps) {
  // Convert string values to numbers for calculations
  const currentWeight = parseFloat(patient.weight?.toString() || "0");
  const currentBodyFat = parseFloat(patient.bodyFat?.toString() || "0");
  const goalWeight = parseFloat(patient.weightGoal?.toString() || "0");
  const goalBodyFat = parseFloat(patient.bodyFatGoal?.toString() || "0");
  
  const [previousWeight, setPreviousWeight] = useState(currentWeight);
  const [previousBodyFat, setPreviousBodyFat] = useState(currentBodyFat);
  const [showMetricChange, setShowMetricChange] = useState(false);
  const [clickedMetric, setClickedMetric] = useState<string | null>(null);

  // Calculate if metrics are improving
  const weightImproving = currentWeight < previousWeight;
  const bodyFatImproving = currentBodyFat < previousBodyFat;
  const weightToGoalDiff = Math.abs(currentWeight - goalWeight);
  const bodyFatToGoalDiff = Math.abs(currentBodyFat - goalBodyFat);

  // Detect changes for animations
  useEffect(() => {
    if (currentWeight !== previousWeight || currentBodyFat !== previousBodyFat) {
      setShowMetricChange(true);
      setTimeout(() => setShowMetricChange(false), 3000);
    }
    setPreviousWeight(currentWeight);
    setPreviousBodyFat(currentBodyFat);
  }, [currentWeight, currentBodyFat, previousWeight, previousBodyFat]);

  const getMetricStatus = (current: number, goal: number, isPercentage: boolean = false) => {
    const diff = Math.abs(current - goal);
    const threshold = isPercentage ? 2 : 10;
    
    if (diff <= threshold) return { color: "green", label: "On Target", pulse: true };
    if (diff <= threshold * 2) return { color: "blue", label: "Close", pulse: false };
    return { color: "yellow", label: "Working", pulse: false };
  };

  const weightStatus = getMetricStatus(currentWeight, goalWeight);
  const bodyFatStatus = getMetricStatus(currentBodyFat, goalBodyFat, true);

  return (
    <Card className="bg-gradient-to-br from-white via-green-50 to-blue-50 shadow-lg border border-green-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Health Metrics
            <MicroAnimation 
              type="improvement" 
              trigger={showMetricChange && (weightImproving || bodyFatImproving)}
              className="text-green-500"
            />
          </div>
          <DailyMetricsInput 
            patientId={patient.id}
            triggerButton={
              <button className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                <Plus className="h-4 w-4 mr-1" />
                Add Today's Data
              </button>
            }
          />
          <div className="text-xs text-gray-500 mt-1">
            💡 Click any metric below to update it
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Weight Metric */}
          <DailyMetricsInput 
            patientId={patient.id}
            triggerButton={
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 relative cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 group">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-4 w-4 text-blue-600 mr-1" />
                  <PulseIndicator 
                    active={weightStatus.pulse} 
                    color={weightStatus.color} 
                    size="sm" 
                  />
                  <Plus className="h-3 w-3 text-blue-600 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <CountUpAnimation 
                  value={currentWeight} 
                  className="text-2xl font-bold text-blue-600"
                  duration={1.5}
                />
                <div className="text-sm text-gray-600 mt-1">Current Weight (lbs)</div>
                <div className="text-xs text-gray-500">Goal: {goalWeight} lbs</div>
                <div className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                  🖱️ Click to update
                </div>
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
            }
            focusField="weight"
          />

          {/* Body Fat Metric */}
          <DailyMetricsInput 
            patientId={patient.id}
            triggerButton={
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 relative cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 group">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="h-4 w-4 text-green-600 mr-1" />
                  <PulseIndicator 
                    active={bodyFatStatus.pulse} 
                    color={bodyFatStatus.color} 
                    size="sm" 
                  />
                  <Plus className="h-3 w-3 text-green-600 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <CountUpAnimation 
                  value={currentBodyFat} 
                  suffix="%" 
                  className="text-2xl font-bold text-green-600"
                  duration={1.5}
                />
                <div className="text-sm text-gray-600 mt-1">Body Fat</div>
                <div className="text-xs text-gray-500">Goal: {goalBodyFat}%</div>
                <div className="text-xs text-green-600 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                  🖱️ Click to update
                </div>
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
            }
            focusField="bodyFat"
          />

          {/* Blood Pressure */}
          <DailyMetricsInput 
            patientId={patient.id}
            triggerButton={
              <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 group">
                <div className="flex items-center justify-center mb-2">
                  <Heart className="h-4 w-4 text-amber-600" />
                  <Plus className="h-3 w-3 text-amber-600 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-lg font-semibold text-amber-700">{patient.bloodPressure}</div>
                <div className="text-sm text-gray-600 mt-1">Blood Pressure</div>
                <div className="text-xs text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                  🖱️ Click to update
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {patient.bloodPressure === "120/80" ? "Optimal" : "Monitor"}
                </div>
              </div>
            }
            focusField="bloodPressure"
          />

          {/* Blood Sugar */}
          <DailyMetricsInput 
            patientId={patient.id}
            triggerButton={
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 group">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-4 w-4 text-purple-600" />
                  <Plus className="h-3 w-3 text-purple-600 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-lg font-semibold text-purple-700">{patient.bloodSugar}</div>
                <div className="text-sm text-gray-600 mt-1">Blood Sugar</div>
                <div className="text-xs text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                  🖱️ Click to update
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {parseInt(patient.bloodSugar) < 100 ? "Normal" : "Monitor"}
                </div>
              </div>
            }
            focusField="bloodSugar"
          />
        </div>

        {/* Insulin Resistance Status - Clickable */}
        <DailyMetricsInput 
          patientId={patient.id}
          triggerButton={
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-blue-300 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Insulin Resistance:</span>
                  <MicroAnimation 
                    type="streak" 
                    trigger={patient.insulinResistance === 'normal' || !patient.insulinResistance}
                    className="text-green-500"
                  />
                  <Plus className="h-3 w-3 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    !patient.insulinResistance || patient.insulinResistance === 'normal'
                      ? "bg-green-100 text-green-800"
                      : patient.insulinResistance === 'mild'
                      ? "bg-yellow-100 text-yellow-800"
                      : patient.insulinResistance === 'moderate'
                      ? "bg-orange-100 text-orange-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {!patient.insulinResistance || patient.insulinResistance === 'normal' 
                      ? "Normal" 
                      : patient.insulinResistance === 'mild'
                      ? "Mild"
                      : patient.insulinResistance === 'moderate'
                      ? "Moderate"
                      : patient.insulinResistance === 'high'
                      ? "High"
                      : patient.insulinResistance === 'severe'
                      ? "Severe"
                      : "Not Set"
                    }
                  </span>
                  <PulseIndicator 
                    active={!patient.insulinResistance || patient.insulinResistance === 'normal'} 
                    color={!patient.insulinResistance || patient.insulinResistance === 'normal' ? "green" : "red"} 
                    size="sm" 
                  />
                </div>
              </div>
              {(!patient.insulinResistance || patient.insulinResistance === 'normal') && (
                <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Excellent metabolic health!
                </div>
              )}
              <div className="mt-2 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                🖱️ Click to update your insulin resistance level
              </div>
            </div>
          }
          focusField="insulinResistance"
        />
      </CardContent>
    </Card>
  );
}
