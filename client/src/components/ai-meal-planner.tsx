import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChefHat, ShoppingCart, Target, Utensils } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Patient } from "@shared/schema";

interface MealPlan {
  mealPlan: string;
  macroBreakdown: string;
  shoppingList: string[];
}

interface AIMealPlannerProps {
  patient: Patient;
}

export default function AIMealPlanner({ patient }: AIMealPlannerProps) {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [preferences, setPreferences] = useState("");
  const { toast } = useToast();

  const generateMealPlanMutation = useMutation({
    mutationFn: async (prefs: string) => {
      const response = await apiRequest("POST", `/api/patients/${patient.id}/meal-plan`, {
        preferences: prefs
      });
      return response.json();
    },
    onSuccess: (data: MealPlan) => {
      setMealPlan(data);
      toast({
        title: "Meal Plan Generated",
        description: "Your personalized 7-day meal plan is ready!",
      });
    },
    onError: (error) => {
      console.error("Error generating meal plan:", error);
      toast({
        title: "Error", 
        description: "Failed to generate meal plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateMealPlan = () => {
    generateMealPlanMutation.mutate(preferences);
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-orange-600" />
            AI Meal Planner
          </CardTitle>
          <Badge className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 text-xs font-medium">
            Powered by Grok AI
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!mealPlan && !generateMealPlanMutation.isPending && (
          <div className="space-y-4">
            <div className="text-center">
              <ChefHat className="w-12 h-12 text-orange-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Generate a personalized 7-day meal plan based on your health goals
              </p>
            </div>
            
            <div>
              <Label htmlFor="preferences" className="text-sm font-medium text-gray-700">
                Dietary Preferences (optional)
              </Label>
              <Input
                id="preferences"
                className="mt-2"
                placeholder="e.g., vegetarian, gluten-free, dairy-free..."
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
              />
            </div>

            <Button
              onClick={handleGenerateMealPlan}
              className="w-full bg-orange-600 text-white hover:bg-orange-700"
            >
              Generate Meal Plan
            </Button>
          </div>
        )}

        {generateMealPlanMutation.isPending && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-orange-600">
              <ChefHat className="w-4 h-4 animate-pulse" />
              <span className="text-sm">Creating your personalized meal plan...</span>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}

        {mealPlan && (
          <div className="space-y-6">
            {/* Macro Breakdown */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Daily Macro Targets
              </h4>
              <div className="text-orange-800 text-sm whitespace-pre-wrap">
                {mealPlan.macroBreakdown}
              </div>
            </div>

            {/* Meal Plan */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-green-600" />
                7-Day Meal Plan
              </h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {mealPlan.mealPlan}
                </div>
              </div>
            </div>

            {/* Shopping List */}
            {mealPlan.shoppingList.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-blue-600" />
                  Shopping List
                </h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {mealPlan.shoppingList.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span className="text-sm text-blue-800">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => setPreferences("")}
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={generateMealPlanMutation.isPending}
              >
                New Plan
              </Button>
              <Button
                onClick={() => generateMealPlanMutation.mutate(preferences)}
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={generateMealPlanMutation.isPending}
              >
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}