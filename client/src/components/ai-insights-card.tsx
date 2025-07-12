import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Lightbulb, AlertTriangle, Activity, Pill } from "lucide-react";
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
}

interface AIInsightsCardProps {
  patient: Patient;
}

export default function AIInsightsCard({ patient }: AIInsightsCardProps) {
  const [insights, setInsights] = useState<NutritionInsight | null>(null);
  const { toast } = useToast();

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/patients/${patient.id}/insights`, {});
      return response.json();
    },
    onSuccess: (data: NutritionInsight) => {
      setInsights(data);
      toast({
        title: "AI Insights Generated",
        description: "Personalized nutrition insights are ready!",
      });
    },
    onError: (error: any) => {
      console.error("Error generating insights:", error);
      
      // Check if it's a credits issue
      if (error?.response?.status === 402) {
        toast({
          title: "AI Credits Needed",
          description: "Please add credits to your xAI account at console.x.ai to use AI insights.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to generate nutrition insights. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handleGenerateInsights = () => {
    generateInsightsMutation.mutate();
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Nutrition Insights
          </CardTitle>
          <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 text-xs font-medium">
            Powered by Grok AI
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!insights && !generateInsightsMutation.isPending && (
          <div className="text-center py-6">
            <Brain className="w-12 h-12 text-purple-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Get personalized nutrition insights based on your health data
            </p>
            <Button
              onClick={handleGenerateInsights}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              Generate AI Insights
            </Button>
          </div>
        )}

        {generateInsightsMutation.isPending && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-purple-600">
              <Brain className="w-4 h-4 animate-pulse" />
              <span className="text-sm">Analyzing your health data...</span>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}

        {insights && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Health Summary
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
                  Personalized Recommendations
                </h4>
                <ul className="space-y-2">
                  {insights.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">{rec}</span>
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
                  Important Considerations
                </h4>
                <ul className="space-y-2">
                  {insights.warnings.map((warning, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
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
                  AI Supplement Suggestions
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

            <Button
              onClick={handleGenerateInsights}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Refresh Insights
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}