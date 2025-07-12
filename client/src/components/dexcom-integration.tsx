import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Zap,
  Link,
  Unlink
} from "lucide-react";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { DexcomData } from "@shared/schema";

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

interface DexcomIntegrationProps {
  patientId: number;
}

export default function DexcomIntegration({ patientId }: DexcomIntegrationProps) {
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState(false);

  // Query Dexcom connection status
  const { data: status, isLoading: statusLoading } = useQuery<DexcomStatus>({
    queryKey: ['/api/patients', patientId, 'dexcom', 'status'],
    queryFn: async () => {
      const response = await fetch(`/api/patients/${patientId}/dexcom/status`);
      if (!response.ok) {
        throw new Error('Failed to fetch Dexcom status');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Query Dexcom data
  const { data: dexcomData, isLoading: dataLoading } = useQuery<DexcomDataResponse>({
    queryKey: ['/api/patients', patientId, 'dexcom', 'data'],
    queryFn: async () => {
      const response = await fetch(`/api/patients/${patientId}/dexcom/data`);
      if (!response.ok) {
        throw new Error('Failed to fetch Dexcom data');
      }
      return response.json();
    },
    enabled: status?.connected || status?.demo,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Connect to Dexcom
  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/dexcom/connect/${patientId}`);
      if (!response.ok) {
        throw new Error('Failed to initiate Dexcom connection');
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    },
  });

  // Disconnect from Dexcom
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/patients/${patientId}/dexcom/disconnect`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to disconnect Dexcom');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients', patientId, 'dexcom'] });
    },
  });

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to connect to Dexcom:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to disconnect from Dexcom:', error);
    }
  };

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
      time: new Date(reading.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      }),
      glucose: parseFloat(reading.glucoseValue),
      trend: reading.trend,
    }));
  };

  if (statusLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Dexcom CGM Integration
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
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Dexcom CGM Integration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {status?.connected ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Connected</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium">Not Connected</span>
                </>
              )}
              {status?.demo && (
                <Badge variant="secondary">Demo Mode</Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              {status?.connected ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={disconnectMutation.isPending}
                >
                  <Unlink className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              ) : (
                <Button 
                  size="sm"
                  onClick={handleConnect}
                  disabled={isConnecting || connectMutation.isPending}
                >
                  <Link className="w-4 h-4 mr-2" />
                  {isConnecting ? 'Connecting...' : 'Connect Dexcom'}
                </Button>
              )}
            </div>
          </div>

          {/* Demo Mode Alert */}
          {status?.demo && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Dexcom integration is running in demo mode. Real-time glucose data will be simulated for testing purposes.
              </AlertDescription>
            </Alert>
          )}

          {/* Glucose Data */}
          {dexcomData && dexcomData.data.length > 0 && (
            <div className="space-y-4">
              {/* Current Reading */}
              {dexcomData.stats.latestReading && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Current Reading</h4>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(dexcomData.stats.latestReading.trend || 'flat')}
                      <span className="text-sm text-muted-foreground">
                        {new Date(dexcomData.stats.latestReading.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getGlucoseColor(parseFloat(dexcomData.stats.latestReading.glucoseValue))}`}>
                      {dexcomData.stats.latestReading.glucoseValue}
                    </span>
                    <span className="text-sm text-muted-foreground">mg/dL</span>
                  </div>
                </div>
              )}

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{dexcomData.stats.averageGlucose}</div>
                  <div className="text-sm text-muted-foreground">Average</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{dexcomData.stats.timeInRange}%</div>
                  <div className="text-sm text-muted-foreground">Time in Range</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{dexcomData.stats.timeAboveRange}%</div>
                  <div className="text-sm text-muted-foreground">Above Range</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{dexcomData.stats.timeBelowRange}%</div>
                  <div className="text-sm text-muted-foreground">Below Range</div>
                </div>
              </div>

              <Separator />

              {/* Glucose Chart */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  24-Hour Glucose Trends
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
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Reference Ranges */}
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Target Range: 70-180 mg/dL</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Above Range: &gt;180 mg/dL</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Below Range: &lt;70 mg/dL</span>
                </div>
              </div>
            </div>
          )}

          {/* No Data Message */}
          {!dataLoading && (!dexcomData || dexcomData.data.length === 0) && (status?.connected || status?.demo) && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                No glucose data available yet. Data will appear once your Dexcom sensor starts transmitting readings.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}