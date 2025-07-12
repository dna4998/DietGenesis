import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Target,
  Calendar,
  BarChart3
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Patient } from "@shared/schema";

interface HealthTrend {
  metric: string;
  direction: 'improving' | 'declining' | 'stable';
  confidence: number;
  changeRate: number;
  projectedValue: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

interface HealthPrediction {
  patientId: number;
  generatedAt: string;
  trends: HealthTrend[];
  overallScore: number;
  riskFactors: string[];
  interventions: string[];
  confidenceLevel: number;
  isDemo?: boolean;
  demoMessage?: string;
}

interface HealthTrendPredictionProps {
  patient: Patient;
}

const getTrendIcon = (direction: string) => {
  switch (direction) {
    case 'improving':
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    case 'declining':
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    default:
      return <Minus className="w-4 h-4 text-gray-600" />;
  }
};

const getRiskColor = (level: string) => {
  switch (level) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-green-100 text-green-800';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

const formatMetricName = (metric: string) => {
  switch (metric) {
    case 'weight':
      return 'Weight';
    case 'bodyFat':
      return 'Body Fat %';
    case 'adherence':
      return 'Plan Adherence';
    case 'exercise':
      return 'Exercise (min/week)';
    default:
      return metric;
  }
};

export default function HealthTrendPrediction({ patient }: HealthTrendPredictionProps) {
  const [showDetails, setShowDetails] = useState(false);

  const { data: prediction, isLoading, error } = useQuery({
    queryKey: ['/api/patients', patient.id, 'health-prediction'],
    queryFn: () => apiRequest("GET", `/api/patients/${patient.id}/health-prediction`).then(res => res.json()),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Health Trend Prediction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !prediction) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Health Trend Prediction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Unable to generate health predictions. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Health Trend Prediction
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
        </div>
        {prediction.isDemo && (
          <Alert className="mt-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {prediction.demoMessage}
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Health Score */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Overall Health Score</h3>
            <span className={`text-2xl font-bold ${getScoreColor(prediction.overallScore || 75)}`}>
              {prediction.overallScore || 75}/100
            </span>
          </div>
          <Progress value={prediction.overallScore || 75} className="h-2" />
          <p className="text-sm text-gray-600 mt-2">
            Confidence: {Math.round((prediction.confidenceLevel || 0.75) * 100)}%
          </p>
        </div>

        {/* Health Trends Summary */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Health Trends (4-week projection)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {prediction.trends.map((trend, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTrendIcon(trend.direction)}
                    <span className="font-medium text-sm">{formatMetricName(trend.metric)}</span>
                  </div>
                  <Badge variant="outline" className={`text-xs ${getRiskColor(trend.riskLevel)}`}>
                    {trend.riskLevel}
                  </Badge>
                </div>
                <div className="text-xs text-gray-600">
                  <div>Direction: {trend.direction}</div>
                  <div>Confidence: {Math.round((trend.confidence || 0.5) * 100)}%</div>
                  {trend.metric === 'weight' && trend.projectedValue !== null && (
                    <div>Projected: {trend.projectedValue.toFixed(1)} lbs</div>
                  )}
                  {trend.metric === 'bodyFat' && trend.projectedValue !== null && (
                    <div>Projected: {trend.projectedValue.toFixed(1)}%</div>
                  )}
                  {trend.metric === 'adherence' && trend.projectedValue !== null && (
                    <div>Projected: {trend.projectedValue.toFixed(0)}%</div>
                  )}
                  {trend.metric === 'exercise' && trend.projectedValue !== null && (
                    <div>Projected: {trend.projectedValue.toFixed(0)} min/week</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Factors */}
        {prediction.riskFactors.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Risk Factors
            </h3>
            <div className="space-y-2">
              {prediction.riskFactors.map((risk, index) => (
                <Alert key={index} className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-sm text-red-800">
                    {risk}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Interventions */}
        {prediction.interventions.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              Recommended Interventions
            </h3>
            <div className="space-y-2">
              {prediction.interventions.map((intervention, index) => (
                <Alert key={index} className="border-blue-200 bg-blue-50">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-800">
                    {intervention}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Recommendations */}
        {showDetails && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-600" />
              Detailed Recommendations
            </h3>
            <div className="space-y-4">
              {prediction.trends.map((trend, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    {getTrendIcon(trend.direction)}
                    {formatMetricName(trend.metric)}
                  </h4>
                  <div className="space-y-1">
                    {trend.recommendations.map((rec, recIndex) => (
                      <div key={recIndex} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generation Info */}
        <div className="text-xs text-gray-500 border-t pt-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            Generated: {new Date(prediction.generatedAt).toLocaleDateString()} at {new Date(prediction.generatedAt).toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}