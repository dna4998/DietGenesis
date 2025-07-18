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
            <button 
              onClick={() => window.open("https://apps.apple.com/us/app/fiton-fitness-workout-plans/id1442473191", "_blank")}
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <Play className="text-white w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Full Body Strength Training</div>
                <div className="text-sm text-gray-600">FitOn App • Free workouts • 25 minutes</div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </button>
            <button 
              onClick={() => window.open("https://apps.apple.com/us/app/nike-training-club/id301521403", "_blank")}
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <Play className="text-white w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">HIIT Cardio Workout</div>
                <div className="text-sm text-gray-600">Nike Training Club • Free • 20 minutes</div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </button>
            <button 
              onClick={() => window.open("https://play.google.com/store/apps/details?id=com.jnj.sevenminuteworkout", "_blank")}
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                <Play className="text-white w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">7-Minute Scientific Workout</div>
                <div className="text-sm text-gray-600">J&J Official App • Free • 7 minutes</div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
