import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Play } from "lucide-react";
import type { Patient } from "@shared/schema";

interface ExercisePlanCardProps {
  patient: Patient;
}

export default function ExercisePlanCard({ patient }: ExercisePlanCardProps) {
  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Exercise Plan</CardTitle>
          <Badge className="bg-blue-100 text-blue-800 text-xs font-medium">In Progress</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-gray-700">{patient.exercisePlan || "No exercise plan assigned"}</p>
        </div>
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Recommended Videos:</h4>
          <div className="grid gap-3">
            <a 
              href="https://www.youtube.com/watch?v=R2_Mn-qRKjA" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                <Play className="text-white w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Full Body Strength Training</div>
                <div className="text-sm text-gray-600">Beginner-friendly workout • 25 minutes</div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
            <a 
              href="https://www.youtube.com/watch?v=ml6cT4AZdqI" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                <Play className="text-white w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">HIIT Cardio Workout</div>
                <div className="text-sm text-gray-600">High-intensity training • 20 minutes</div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
