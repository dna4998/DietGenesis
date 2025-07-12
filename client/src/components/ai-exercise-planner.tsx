import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dumbbell, Clock, Target, AlertTriangle, BookOpen, CheckCircle } from "lucide-react";
import type { Patient } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface ExercisePlan {
  weeklyPlan: string;
  exerciseDetails: string;
  progressionPlan: string;
  equipmentNeeded: string[];
  safetyTips: string[];
  isDemo?: boolean;
  demoMessage?: string;
}

interface AIExercisePlannerProps {
  patient: Patient;
}

export default function AIExercisePlanner({ patient }: AIExercisePlannerProps) {
  const [preferences, setPreferences] = useState("");
  const [exercisePlan, setExercisePlan] = useState<ExercisePlan | null>(null);
  const queryClient = useQueryClient();

  const generateExercisePlan = useMutation({
    mutationFn: async (prefs: string) => {
      const response = await apiRequest<ExercisePlan>({
        endpoint: `/api/patients/${patient.id}/exercise-plan`,
        method: "POST",
        body: { preferences: prefs }
      });
      return response;
    },
    onSuccess: (data: ExercisePlan) => {
      setExercisePlan(data);
    },
    onError: (error) => {
      console.error("Failed to generate exercise plan:", error);
    }
  });

  const handleGeneratePlan = () => {
    generateExercisePlan.mutate(preferences);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-blue-600" />
          AI Exercise Planner
        </CardTitle>
        <CardDescription>
          Get a personalized exercise plan powered by Grok AI based on your health profile and goals
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="exercise-preferences">Exercise Preferences (Optional)</Label>
          <Textarea
            id="exercise-preferences"
            placeholder="e.g., I prefer home workouts, have knee issues, enjoy cardio, want to focus on strength training..."
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        {exercisePlan?.isDemo && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {exercisePlan.demoMessage}
            </AlertDescription>
          </Alert>
        )}

        {exercisePlan && (
          <div className="space-y-6 mt-6">
            {/* Weekly Plan */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                <h3 className="font-semibold text-lg">Weekly Exercise Plan</h3>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                  {exercisePlan.weeklyPlan}
                </pre>
              </div>
            </div>

            {/* Exercise Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-lg">Exercise Details</h3>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                  {exercisePlan.exerciseDetails}
                </pre>
              </div>
            </div>

            {/* Progression Plan */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                <h3 className="font-semibold text-lg">Progression Plan</h3>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                  {exercisePlan.progressionPlan}
                </pre>
              </div>
            </div>

            {/* Equipment Needed */}
            {exercisePlan.equipmentNeeded.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Equipment Needed</h3>
                <div className="flex flex-wrap gap-2">
                  {exercisePlan.equipmentNeeded.map((equipment, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {equipment}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Safety Tips */}
            {exercisePlan.safetyTips.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <h3 className="font-semibold text-lg">Safety Tips</h3>
                </div>
                <div className="space-y-2">
                  {exercisePlan.safetyTips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          onClick={handleGeneratePlan}
          disabled={generateExercisePlan.isPending}
          className="w-full"
        >
          {generateExercisePlan.isPending ? "Generating Exercise Plan..." : "Generate Exercise Plan"}
        </Button>
      </CardFooter>
    </Card>
  );
}