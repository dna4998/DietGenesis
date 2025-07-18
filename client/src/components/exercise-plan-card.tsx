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
              className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all cursor-pointer transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                <Play className="text-white w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-blue-900">Full Body Strength Training</div>
                <div className="text-sm text-blue-700">FitOn App • Free workouts • 25 minutes</div>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-500" />
            </button>
            <button 
              onClick={() => window.open("https://apps.apple.com/us/app/nike-training-club/id301521403", "_blank")}
              className="flex items-center p-3 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg hover:from-green-100 hover:to-green-200 transition-all cursor-pointer transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                <Play className="text-white w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-green-900">HIIT Cardio Workout</div>
                <div className="text-sm text-green-700">Nike Training Club • Free • 20 minutes</div>
              </div>
              <ExternalLink className="w-4 h-4 text-green-500" />
            </button>
            <button 
              onClick={() => window.open("https://play.google.com/store/apps/details?id=com.jnj.sevenminuteworkout", "_blank")}
              className="flex items-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all cursor-pointer transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                <Play className="text-white w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-purple-900">7-Minute Scientific Workout</div>
                <div className="text-sm text-purple-700">J&J Official App • Free • 7 minutes</div>
              </div>
              <ExternalLink className="w-4 h-4 text-purple-500" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
