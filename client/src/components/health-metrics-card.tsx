import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Patient } from "@shared/schema";

interface HealthMetricsCardProps {
  patient: Patient;
}

export default function HealthMetricsCard({ patient }: HealthMetricsCardProps) {
  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Health Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-medical-blue">{patient.weight}</div>
            <div className="text-sm text-gray-600">Current Weight (lbs)</div>
            <div className="text-xs text-gray-500">Goal: {patient.weightGoal} lbs</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-health-green">{patient.bodyFat}%</div>
            <div className="text-sm text-gray-600">Body Fat</div>
            <div className="text-xs text-gray-500">Goal: {patient.bodyFatGoal}%</div>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg">
            <div className="text-sm font-semibold text-amber-700">{patient.bloodPressure}</div>
            <div className="text-sm text-gray-600">Blood Pressure</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-sm font-semibold text-purple-700">{patient.bloodSugar}</div>
            <div className="text-sm text-gray-600">Blood Sugar</div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Insulin Resistance:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              patient.insulinResistance 
                ? "bg-red-100 text-red-800" 
                : "bg-green-100 text-green-800"
            }`}>
              {patient.insulinResistance ? "Present" : "Not Present"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
