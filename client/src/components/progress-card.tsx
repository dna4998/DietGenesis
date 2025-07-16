import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, Sparkles, Trophy } from "lucide-react";
import { ProgressBarAnimation, CountUpAnimation, MicroAnimation, PulseIndicator } from "./micro-animations";
import ProgressCelebration from "./progress-celebration";
import { useProgressCelebration } from "@/hooks/use-progress-celebration";
import { useState, useEffect } from "react";
import type { Patient } from "@shared/schema";

interface ProgressCardProps {
  patient: Patient;
}

export default function ProgressCard({ patient }: ProgressCardProps) {
  const [previousWeight, setPreviousWeight] = useState(patient.weight);
  const [previousAdherence, setPreviousAdherence] = useState(patient.adherence);
  const [showProgressChange, setShowProgressChange] = useState(false);
  
  const { showCelebration, celebrationData, triggerCelebration, closeCelebration } = useProgressCelebration();

  // Calculate progress metrics
  const weightLossProgress = patient.weightLoss ? 
    (parseFloat(patient.weightLoss) / (parseFloat(patient.weight) - parseFloat(patient.weightGoal))) * 100 : 0;
  
  const bodyFatProgress = Math.max(0, Math.min(100, ((patient.bodyFat - patient.bodyFatGoal) / patient.bodyFat) * 100));
  const weightProgress = Math.max(0, Math.min(100, ((patient.weight - patient.weightGoal) / patient.weight) * 100));
  
  // Detect changes for micro-animations
  useEffect(() => {
    if (patient.weight !== previousWeight || patient.adherence !== previousAdherence) {
      setShowProgressChange(true);
      setTimeout(() => setShowProgressChange(false), 2000);
    }
    setPreviousWeight(patient.weight);
    setPreviousAdherence(patient.adherence);
  }, [patient.weight, patient.adherence, previousWeight, previousAdherence]);

  // Check for celebration triggers
  const shouldCelebrate = () => {
    return weightProgress >= 25 || bodyFatProgress >= 30 || patient.adherence >= 80;
  };

  const getProgressStatus = (value: number, target: number) => {
    const progress = (value / target) * 100;
    if (progress >= 75) return { color: "green", label: "Excellent" };
    if (progress >= 50) return { color: "blue", label: "Good" };
    if (progress >= 25) return { color: "yellow", label: "Progress" };
    return { color: "red", label: "Getting Started" };
  };

  const adherenceStatus = getProgressStatus(patient.adherence, 100);
  const weightStatus = getProgressStatus(weightProgress, 100);

  return (
    <>
      <Card className="bg-gradient-to-br from-white via-blue-50 to-purple-50 shadow-lg border border-blue-200 relative overflow-hidden">
        <CardHeader className="relative">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              Progress Overview
              <MicroAnimation 
                type="improvement" 
                trigger={showProgressChange}
                className="text-green-500"
              />
            </CardTitle>
            
            {shouldCelebrate() && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => triggerCelebration(patient)}
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white border-none"
              >
                <Trophy className="h-4 w-4" />
                View Achievements
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Weight Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Weight Goal Progress</span>
                <PulseIndicator 
                  active={weightProgress > 50} 
                  color={weightStatus.color} 
                  size="sm" 
                />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={`text-${weightStatus.color}-600 bg-${weightStatus.color}-100`}>
                  {weightStatus.label}
                </Badge>
                <CountUpAnimation 
                  value={Math.round(weightProgress)} 
                  suffix="%" 
                  className="text-sm font-semibold text-gray-600"
                />
              </div>
            </div>
            
            <ProgressBarAnimation
              value={weightProgress}
              target={100}
              showSparkle={weightProgress > 50}
              label={`Current: ${patient.weight} lbs → Goal: ${patient.weightGoal} lbs`}
            />
          </div>

          {/* Body Fat Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Body Fat Reduction</span>
                <MicroAnimation 
                  type="progress_tick" 
                  trigger={bodyFatProgress > 30}
                  className="text-emerald-500"
                />
              </div>
              <CountUpAnimation 
                value={Math.round(bodyFatProgress)} 
                suffix="%" 
                className="text-sm font-semibold text-gray-600"
              />
            </div>
            
            <ProgressBarAnimation
              value={bodyFatProgress}
              target={100}
              showSparkle={bodyFatProgress > 40}
              label={`Current: ${patient.bodyFat}% → Goal: ${patient.bodyFatGoal}%`}
            />
          </div>

          {/* Adherence Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Plan Adherence</span>
                <MicroAnimation 
                  type="streak" 
                  trigger={patient.adherence >= 80}
                  className="text-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={`text-${adherenceStatus.color}-600 bg-${adherenceStatus.color}-100`}>
                  {adherenceStatus.label}
                </Badge>
                <CountUpAnimation 
                  value={patient.adherence} 
                  suffix="%" 
                  className="text-sm font-semibold text-gray-600"
                />
              </div>
            </div>
            
            <ProgressBarAnimation
              value={patient.adherence}
              target={100}
              showSparkle={patient.adherence > 85}
            />
          </div>

          {/* Achievement Summary */}
          {shouldCelebrate() && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-sm font-medium text-green-700 mb-2">
                <Sparkles className="h-4 w-4" />
                Outstanding Progress!
              </div>
              <p className="text-sm text-green-600">
                You're making excellent progress toward your health goals. Keep up the amazing work!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Celebration Modal */}
      {showCelebration && (
        <ProgressCelebration
          patient={celebrationData}
          onClose={closeCelebration}
        />
      )}
    </>
  );
}
