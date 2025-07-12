import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Lightbulb, AlertTriangle, Activity, Pill, ChefHat, Dumbbell } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Patient } from "@shared/schema";

interface NutritionInsight {
  summary: string;
  recommendations: string[];
  warnings: string[];
  metabolicAnalysis: string;
  supplementSuggestions: string[];
  isDemo?: boolean;
  demoMessage?: string;
}

interface MealPlan {
  mealPlan: string;
  macroBreakdown: string;
  shoppingList: string[];
  isDemo?: boolean;
  demoMessage?: string;
}

interface ExercisePlan {
  weeklyPlan: string;
  exerciseDetails: string;
  progressionPlan: string;
  equipmentNeeded: string[];
  safetyTips: string[];
  isDemo?: boolean;
  demoMessage?: string;
}

interface ProviderAIInsightsProps {
  patient: Patient;
  onClose: () => void;
}

export default function ProviderAIInsights({ patient, onClose }: ProviderAIInsightsProps) {
  const [insights, setInsights] = useState<NutritionInsight | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [exercisePlan, setExercisePlan] = useState<ExercisePlan | null>(null);
  const [activeTab, setActiveTab] = useState<"insights" | "mealplan" | "exercise">("insights");
  const { toast } = useToast();

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/patients/${patient.id}/insights`, {});
      return response.json();
    },
    onSuccess: (data: NutritionInsight) => {
      setInsights(data);
      toast({
        title: data.isDemo ? "Demo Insights Generated" : "AI Insights Generated",
        description: data.isDemo ? `Demo insights for ${patient.name}. Add credits for AI analysis.` : `Nutrition insights for ${patient.name} are ready!`,
      });
    },
    onError: (error: any) => {
      console.error("Error generating insights:", error);
      toast({
        title: "Error",
        description: "Failed to generate nutrition insights.",
        variant: "destructive",
      });
    },
  });

  const generateMealPlanMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/patients/${patient.id}/meal-plan`, {
        preferences: "Medical professional recommendation"
      });
      return response.json();
    },
    onSuccess: (data: MealPlan) => {
      setMealPlan(data);
      toast({
        title: data.isDemo ? "Demo Meal Plan Generated" : "Meal Plan Generated",
        description: data.isDemo ? `Demo meal plan for ${patient.name}. Add credits for AI planning.` : `7-day meal plan for ${patient.name} is ready!`,
      });
    },
    onError: (error: any) => {
      console.error("Error generating meal plan:", error);
      toast({
        title: "Error",
        description: "Failed to generate meal plan.",
        variant: "destructive",
      });
    },
  });

  const generateExercisePlanMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/patients/${patient.id}/exercise-plan`, {
        preferences: "Medical professional recommendation"
      });
      return response.json();
    },
    onSuccess: (data: ExercisePlan) => {
      setExercisePlan(data);
      toast({
        title: data.isDemo ? "Demo Exercise Plan Generated" : "Exercise Plan Generated",
        description: data.isDemo ? `Demo exercise plan for ${patient.name}. Add credits for AI planning.` : `Exercise plan for ${patient.name} is ready!`,
      });
    },
    onError: (error: any) => {
      console.error("Error generating exercise plan:", error);
      toast({
        title: "Error",
        description: "Failed to generate exercise plan.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">
              AI Analysis for {patient.name}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant={activeTab === "insights" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("insights")}
              className="flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              Nutrition Insights
            </Button>
            <Button
              variant={activeTab === "mealplan" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("mealplan")}
              className="flex items-center gap-2"
            >
              <ChefHat className="w-4 h-4" />
              Meal Planning
            </Button>
            <Button
              variant={activeTab === "exercise" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("exercise")}
              className="flex items-center gap-2"
            >
              <Dumbbell className="w-4 h-4" />
              Exercise Planning
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Patient Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Patient Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Weight:</span>
                <span className="ml-1 font-medium">{patient.weight} lbs</span>
              </div>
              <div>
                <span className="text-gray-600">Body Fat:</span>
                <span className="ml-1 font-medium">{patient.bodyFat}%</span>
              </div>
              <div>
                <span className="text-gray-600">Adherence:</span>
                <span className="ml-1 font-medium">{patient.adherence}%</span>
              </div>
              <div>
                <span className="text-gray-600">Insulin Resistance:</span>
                <span className="ml-1 font-medium">{patient.insulinResistance ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>

          {activeTab === "insights" && (
            <div className="space-y-6">
              {!insights && !generateInsightsMutation.isPending && (
                <div className="text-center py-8">
                  <Brain className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Generate AI Nutrition Insights
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Get detailed AI-powered analysis of {patient.name}'s metabolic health and nutrition needs
                  </p>
                  <Button
                    onClick={() => generateInsightsMutation.mutate()}
                    className="bg-purple-600 text-white hover:bg-purple-700"
                    size="lg"
                  >
                    Generate Insights
                  </Button>
                </div>
              )}

              {generateInsightsMutation.isPending && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-purple-600">
                    <Brain className="w-5 h-5 animate-pulse" />
                    <span>Analyzing patient data with Grok AI...</span>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              )}

              {insights && (
                <div className="space-y-6">
                  {insights.isDemo && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-orange-800 text-sm font-medium">{insights.demoMessage}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <Badge className={`${insights.isDemo ? 'bg-orange-100 text-orange-800' : 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800'}`}>
                      {insights.isDemo ? 'Demo Mode' : 'Powered by Grok AI'}
                    </Badge>
                    <Button
                      onClick={() => generateInsightsMutation.mutate()}
                      variant="outline"
                      size="sm"
                    >
                      Refresh Analysis
                    </Button>
                  </div>

                  {/* Summary */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Clinical Summary
                    </h4>
                    <p className="text-purple-800 text-sm">{insights.summary}</p>
                  </div>

                  {/* Metabolic Analysis */}
                  {insights.metabolicAnalysis && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Metabolic Analysis</h4>
                      <p className="text-blue-800 text-sm">{insights.metabolicAnalysis}</p>
                    </div>
                  )}

                  {/* Recommendations */}
                  {insights.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-green-600" />
                        Clinical Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {insights.recommendations.map((rec, idx) => (
                          <li key={idx} className="bg-green-50 border border-green-200 rounded p-3">
                            <span className="text-sm text-green-800">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warnings */}
                  {insights.warnings.length > 0 && (
                    <div>
                      <h4 className="font-medium text-amber-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Clinical Considerations
                      </h4>
                      <ul className="space-y-2">
                        {insights.warnings.map((warning, idx) => (
                          <li key={idx} className="bg-amber-50 border border-amber-200 rounded p-3">
                            <span className="text-sm text-amber-800">{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Supplement Suggestions */}
                  {insights.supplementSuggestions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Pill className="w-4 h-4 text-purple-600" />
                        Supplement Protocol Suggestions
                      </h4>
                      <div className="grid gap-2">
                        {insights.supplementSuggestions.map((supplement, idx) => (
                          <div key={idx} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <span className="text-sm text-purple-800">{supplement}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "mealplan" && (
            <div className="space-y-6">
              {!mealPlan && !generateMealPlanMutation.isPending && (
                <div className="text-center py-8">
                  <ChefHat className="w-16 h-16 text-orange-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Generate AI Meal Plan
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create a personalized 7-day meal plan for {patient.name} based on their health profile
                  </p>
                  <Button
                    onClick={() => generateMealPlanMutation.mutate()}
                    className="bg-orange-600 text-white hover:bg-orange-700"
                    size="lg"
                  >
                    Generate Meal Plan
                  </Button>
                </div>
              )}

              {generateMealPlanMutation.isPending && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-orange-600">
                    <ChefHat className="w-5 h-5 animate-pulse" />
                    <span>Creating personalized meal plan...</span>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              )}

              {mealPlan && (
                <div className="space-y-6">
                  {mealPlan.isDemo && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-orange-800 text-sm font-medium">{mealPlan.demoMessage}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <Badge className={`${mealPlan.isDemo ? 'bg-orange-100 text-orange-800' : 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800'}`}>
                      {mealPlan.isDemo ? 'Demo Mode' : 'Powered by Grok AI'}
                    </Badge>
                    <Button
                      onClick={() => generateMealPlanMutation.mutate()}
                      variant="outline"
                      size="sm"
                    >
                      Generate New Plan
                    </Button>
                  </div>

                  {/* Macro Breakdown */}
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-medium text-orange-900 mb-2">Daily Macro Targets</h4>
                    <div className="text-orange-800 text-sm whitespace-pre-wrap">
                      {mealPlan.macroBreakdown}
                    </div>
                  </div>

                  {/* Meal Plan */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">7-Day Meal Plan</h4>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {mealPlan.mealPlan}
                      </div>
                    </div>
                  </div>

                  {/* Shopping List */}
                  {mealPlan.shoppingList.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Shopping List</h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-h-48 overflow-y-auto">
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
                </div>
              )}
            </div>
          )}

          {activeTab === "exercise" && (
            <div className="space-y-6">
              {!exercisePlan && !generateExercisePlanMutation.isPending && (
                <div className="text-center py-8">
                  <Dumbbell className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Generate Exercise Plan</h3>
                  <p className="text-gray-600 mb-4">
                    Create a personalized exercise plan for {patient.name} based on their health profile
                  </p>
                  <Button 
                    onClick={() => generateExercisePlanMutation.mutate()}
                    className="flex items-center gap-2"
                  >
                    <Dumbbell className="w-4 h-4" />
                    Generate Exercise Plan
                  </Button>
                </div>
              )}

              {generateExercisePlanMutation.isPending && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-600">Generating exercise plan...</span>
                  </div>
                  <Skeleton className="h-32" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-20" />
                </div>
              )}

              {exercisePlan && (
                <div className="space-y-6">
                  {exercisePlan.isDemo && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-amber-800 text-sm">{exercisePlan.demoMessage}</p>
                    </div>
                  )}

                  {/* Weekly Plan */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      Weekly Exercise Plan
                    </h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                        {exercisePlan.weeklyPlan}
                      </pre>
                    </div>
                  </div>

                  {/* Exercise Details */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Exercise Details</h3>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                        {exercisePlan.exerciseDetails}
                      </pre>
                    </div>
                  </div>

                  {/* Progression Plan */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Progression Plan</h3>
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
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        Safety Tips
                      </h3>
                      <div className="space-y-2">
                        {exercisePlan.safetyTips.map((tip, index) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}