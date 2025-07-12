import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Patient } from "@shared/schema";

interface ProgressCardProps {
  patient: Patient;
}

export default function ProgressCard({ patient }: ProgressCardProps) {
  const weightLossProgress = patient.weightLoss ? 
    (parseFloat(patient.weightLoss) / (parseFloat(patient.weight) - parseFloat(patient.weightGoal))) * 100 : 0;

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Progress Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
              <span>Weight Loss Progress</span>
              <span>{patient.weightLoss} lbs lost</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-health-green h-2 rounded-full" style={{width: `${Math.min(weightLossProgress, 100)}%`}}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
              <span>Plan Adherence</span>
              <span>{patient.adherence}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-medical-blue h-2 rounded-full" style={{width: `${patient.adherence}%`}}></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
