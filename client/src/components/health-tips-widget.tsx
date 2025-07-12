import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, RefreshCw, Heart, Brain, Zap, Leaf } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Patient } from "@shared/schema";

interface HealthTip {
  id: string;
  title: string;
  content: string;
  category: "nutrition" | "exercise" | "mental_health" | "sleep" | "hydration" | "general";
  difficulty: "easy" | "medium" | "advanced";
  estimatedTime: string;
  personalizedFor?: string[];
}

interface HealthTipsWidgetProps {
  patient: Patient;
}

const categoryIcons = {
  nutrition: <Leaf className="w-4 h-4" />,
  exercise: <Zap className="w-4 h-4" />,
  mental_health: <Brain className="w-4 h-4" />,
  sleep: <Heart className="w-4 h-4" />,
  hydration: <Heart className="w-4 h-4" />,
  general: <Lightbulb className="w-4 h-4" />
};

const categoryColors = {
  nutrition: "bg-green-100 text-green-800",
  exercise: "bg-blue-100 text-blue-800",
  mental_health: "bg-purple-100 text-purple-800",
  sleep: "bg-indigo-100 text-indigo-800",
  hydration: "bg-cyan-100 text-cyan-800",
  general: "bg-yellow-100 text-yellow-800"
};

export default function HealthTipsWidget({ patient }: HealthTipsWidgetProps) {
  const queryClient = useQueryClient();
  
  // Fetch daily health tip from API
  const { data: dailyTip, isLoading } = useQuery({
    queryKey: ['/api/patients', patient.id, 'daily-tip'],
    queryFn: () => apiRequest("GET", `/api/patients/${patient.id}/daily-tip`).then(res => res.json())
  });

  // Mutation to refresh the tip (simulate getting a new one)
  const refreshTipMutation = useMutation({
    mutationFn: () => apiRequest("GET", `/api/patients/${patient.id}/daily-tip`).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients', patient.id, 'daily-tip'] });
    }
  });

  const refreshTip = () => {
    refreshTipMutation.mutate();
  };

  if (isLoading || !dailyTip) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            Daily Health Tip
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            Daily Health Tip
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshTip}
            disabled={refreshTipMutation.isPending}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`w-4 h-4 ${refreshTipMutation.isPending ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className={categoryColors[dailyTip.category]}>
              {categoryIcons[dailyTip.category]}
              <span className="ml-1 capitalize">{dailyTip.category.replace('_', ' ')}</span>
            </Badge>
            <Badge variant="outline" className="text-xs">
              {dailyTip.estimatedTime}
            </Badge>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                dailyTip.difficulty === 'easy' ? 'text-green-600' :
                dailyTip.difficulty === 'medium' ? 'text-yellow-600' : 'text-red-600'
              }`}
            >
              {dailyTip.difficulty}
            </Badge>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">{dailyTip.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{dailyTip.content}</p>
          </div>
          
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              💡 Tip: Personalized based on your health profile
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}