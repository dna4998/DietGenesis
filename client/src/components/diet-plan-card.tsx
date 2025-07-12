import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Patient } from "@shared/schema";

interface DietPlanCardProps {
  patient: Patient;
}

export default function DietPlanCard({ patient }: DietPlanCardProps) {
  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Diet Plan</CardTitle>
          <Badge className="bg-green-100 text-green-800 text-xs font-medium">Active</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-gray-700">{patient.dietPlan || "No diet plan assigned"}</p>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Nutritional Guidelines:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Maintain 20-30g net carbs daily</li>
            <li>• Consume 1.2g protein per kg body weight</li>
            <li>• Include healthy fats: avocado, olive oil, nuts</li>
            <li>• Hydrate with 8-10 glasses of water daily</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
