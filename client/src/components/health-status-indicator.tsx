import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useHealthStatus } from "@/hooks/use-adaptive-theme";
import { Activity, TrendingUp, AlertTriangle, CheckCircle2, Heart } from "lucide-react";
import type { Patient } from "@/../../shared/schema";

interface HealthStatusIndicatorProps {
  patient?: Patient;
  showRecommendations?: boolean;
  compact?: boolean;
}

export default function HealthStatusIndicator({ 
  patient, 
  showRecommendations = true,
  compact = false 
}: HealthStatusIndicatorProps) {
  const healthStatus = useHealthStatus(patient);

  const getStatusIcon = () => {
    switch (healthStatus.status) {
      case 'excellent':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'good':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'fair':
        return <Activity className="h-5 w-5 text-yellow-600" />;
      case 'needs-attention':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'critical':
        return <Heart className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const getStatusBadgeVariant = () => {
    switch (healthStatus.status) {
      case 'excellent':
        return 'default';
      case 'good':
        return 'secondary';
      case 'fair':
        return 'outline';
      case 'needs-attention':
        return 'destructive';
      case 'critical':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Health Score: {healthStatus.score}/100</span>
            <Badge variant={getStatusBadgeVariant()} className="text-xs">
              {healthStatus.status.replace('-', ' ').toUpperCase()}
            </Badge>
          </div>
          <Progress value={healthStatus.score} className="h-1 mt-1" />
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          {getStatusIcon()}
          <span>Health Status Overview</span>
          <Badge variant={getStatusBadgeVariant()}>
            {healthStatus.status.replace('-', ' ').toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Health Score</span>
            <span className="text-lg font-bold" style={{ color: healthStatus.color }}>
              {healthStatus.score}/100
            </span>
          </div>
          <Progress value={healthStatus.score} className="h-2" />
          <p className="text-sm text-gray-600">{healthStatus.message}</p>
        </div>

        {showRecommendations && healthStatus.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recommendations:</h4>
            <ul className="space-y-1">
              {healthStatus.recommendations.map((rec, index) => (
                <li key={index} className="text-xs text-gray-600 flex items-start space-x-1">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {patient && (
          <div className="text-xs text-gray-500 pt-2 border-t">
            <p>Based on: Weight, Body Fat, Blood Pressure, Insulin Resistance, and Adherence</p>
            <p className="mt-1">Theme adapts automatically to your health metrics</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}