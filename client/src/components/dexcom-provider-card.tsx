import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  BarChart3
} from "lucide-react";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Patient, DexcomData } from "@shared/schema";

interface DexcomStatus {
  connected: boolean;
  configured: boolean;
  demo: boolean;
}

interface DexcomDataResponse {
  data: DexcomData[];
  stats: {
    averageGlucose: number;
    timeInRange: number;
    timeAboveRange: number;
    timeBelowRange: number;
    glucoseVariability: number;
    latestReading: DexcomData | null;
  };
  demo: boolean;
}

interface DexcomProviderCardProps {
  patient: Patient;
}

export default function DexcomProviderCard({ patient }: DexcomProviderCardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  // Query Dexcom connection status
  const { data: status, isLoading: statusLoading } = useQuery<DexcomStatus>({
    queryKey: ['/api/patients', patient.id, 'dexcom', 'status'],
    queryFn: async () => {
      const response = await fetch(`/api/patients/${patient.id}/dexcom/status`);
      if (!response.ok) {
        throw new Error('Failed to fetch Dexcom status');
      }
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Query Dexcom data
  const { data: dexcomData, isLoading: dataLoading } = useQuery<DexcomDataResponse>({
    queryKey: ['/api/patients', patient.id, 'dexcom', 'data', selectedTimeRange],
    queryFn: async () => {
      const hours = selectedTimeRange === '24h' ? 24 : selectedTimeRange === '7d' ? 168 : 720;
      const response = await fetch(`/api/patients/${patient.id}/dexcom/data?hours=${hours}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Dexcom data');
      }
      return response.json();
    },
    enabled: status?.connected || status?.demo,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'doubleUp':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'singleUp':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case 'fortyFiveUp':
        return <TrendingUp className="w-4 h-4 text-yellow-500" />;
      case 'flat':
        return <Minus className="w-4 h-4 text-green-500" />;
      case 'fortyFiveDown':
        return <TrendingDown className="w-4 h-4 text-yellow-500" />;
      case 'singleDown':
        return <TrendingDown className="w-4 h-4 text-orange-500" />;
      case 'doubleDown':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getGlucoseColor = (glucose: number) => {
    if (glucose < 70) return 'text-red-600';
    if (glucose > 180) return 'text-orange-600';
    return 'text-green-600';
  };

  const formatChartData = (data: DexcomData[]) => {
    return data.map(reading => ({
      time: new Date(reading.timestamp).toLocaleString('en-US', { 
        month: 'short',
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      }),
      glucose: parseFloat(reading.glucoseValue),
      trend: reading.trend,
    }));
  };

  const getAlertLevel = (stats: DexcomDataResponse['stats']) => {
    if (stats.timeBelowRange > 10 || stats.timeAboveRange > 30) {
      return 'high';
    } else if (stats.timeBelowRange > 5 || stats.timeAboveRange > 20) {
      return 'medium';
    }
    return 'low';
  };

  if (statusLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Glucose className="w-5 h-5" />
            Dexcom CGM - {patient.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Dexcom CGM - {patient.name}
          </div>
          <div className="flex items-center gap-2">
            {status?.connected ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="w-3 h-3 mr-1" />
                Not Connected
              </Badge>
            )}
            {status?.demo && (
              <Badge variant="secondary">Demo Mode</Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Demo Mode Alert */}
          {status?.demo && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Running in demo mode with simulated glucose data for testing purposes.
              </AlertDescription>
            </Alert>
          )}

          {/* Connection Status */}
          {!status?.connected && !status?.demo && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Patient needs to connect their Dexcom CGM to enable continuous glucose monitoring.
              </AlertDescription>
            </Alert>
          )}

          {/* Glucose Data */}
          {dexcomData && dexcomData.data.length > 0 && (
            <div className="space-y-4">
              {/* Time Range Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Time Range:</span>
                <div className="flex gap-1">
                  {(['24h', '7d', '30d'] as const).map((range) => (
                    <Button
                      key={range}
                      variant={selectedTimeRange === range ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTimeRange(range)}
                    >
                      {range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : '30 Days'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Current Reading & Alert Level */}
              {dexcomData.stats.latestReading && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Latest Reading</h4>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(dexcomData.stats.latestReading.trend || 'flat')}
                      <span className="text-sm text-muted-foreground">
                        {new Date(dexcomData.stats.latestReading.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${getGlucoseColor(parseFloat(dexcomData.stats.latestReading.glucoseValue))}`}>
                        {dexcomData.stats.latestReading.glucoseValue}
                      </span>
                      <span className="text-sm text-muted-foreground">mg/dL</span>
                    </div>
                    
                    {/* Alert Level */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Alert Level:</span>
                      <Badge 
                        variant={getAlertLevel(dexcomData.stats) === 'high' ? 'destructive' : 
                                getAlertLevel(dexcomData.stats) === 'medium' ? 'default' : 'secondary'}
                      >
                        {getAlertLevel(dexcomData.stats) === 'high' ? 'High Risk' : 
                         getAlertLevel(dexcomData.stats) === 'medium' ? 'Medium Risk' : 'Low Risk'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Clinical Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{dexcomData.stats.averageGlucose}</div>
                  <div className="text-sm text-blue-800">Average mg/dL</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{dexcomData.stats.timeInRange}%</div>
                  <div className="text-sm text-green-800">Time in Range</div>
                  <div className="text-xs text-green-700">(70-180 mg/dL)</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{dexcomData.stats.timeAboveRange}%</div>
                  <div className="text-sm text-orange-800">Above Range</div>
                  <div className="text-xs text-orange-700">(&gt;180 mg/dL)</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{dexcomData.stats.timeBelowRange}%</div>
                  <div className="text-sm text-red-800">Below Range</div>
                  <div className="text-xs text-red-700">(&lt;70 mg/dL)</div>
                </div>
              </div>

              {/* Glucose Variability */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="font-medium">Glucose Variability</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{dexcomData.stats.glucoseVariability} mg/dL</div>
                  <div className="text-sm text-muted-foreground">Standard Deviation</div>
                </div>
              </div>

              <Separator />

              {/* Glucose Trend Chart */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Glucose Trends - {selectedTimeRange === '24h' ? 'Last 24 Hours' : selectedTimeRange === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formatChartData(dexcomData.data)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="time" 
                        fontSize={12}
                        tick={{ fontSize: 10 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        domain={[50, 300]}
                        fontSize={12}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value} mg/dL`, 'Glucose']}
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="glucose" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Clinical Recommendations */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Clinical Recommendations</h4>
                <ul className="text-sm space-y-1">
                  {dexcomData.stats.timeBelowRange > 10 && (
                    <li className="text-red-700">• High hypoglycemia risk - Consider reducing glucose-lowering medications</li>
                  )}
                  {dexcomData.stats.timeAboveRange > 30 && (
                    <li className="text-orange-700">• Excessive hyperglycemia - Consider adjusting treatment plan</li>
                  )}
                  {dexcomData.stats.glucoseVariability > 50 && (
                    <li className="text-yellow-700">• High glucose variability - Consider continuous glucose monitoring education</li>
                  )}
                  {dexcomData.stats.timeInRange > 70 && (
                    <li className="text-green-700">• Excellent glucose control - Continue current management</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* No Data Message */}
          {!dataLoading && (!dexcomData || dexcomData.data.length === 0) && (status?.connected || status?.demo) && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                No glucose data available for this patient. Data will appear once the Dexcom sensor starts transmitting.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}