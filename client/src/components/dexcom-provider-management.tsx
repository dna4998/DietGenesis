import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  Zap, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Settings,
  AlertTriangle,
  TrendingUp,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Patient } from "@shared/schema";

interface DexcomOverview {
  totalPatients: number;
  connectedPatients: number;
  disconnectedPatients: number;
  averageGlucose: number;
  patientsInRange: number;
  alertsToday: number;
}

export default function DexcomProviderManagement() {
  const { toast } = useToast();
  
  // Query all patients
  const { data: patients, isLoading: patientsLoading } = useQuery<Patient[]>({
    queryKey: ['/api/patients'],
  });

  // Query Dexcom overview stats
  const { data: overview, isLoading: overviewLoading } = useQuery<DexcomOverview>({
    queryKey: ['/api/dexcom/overview'],
    queryFn: async () => {
      const response = await fetch('/api/dexcom/overview');
      if (!response.ok) {
        throw new Error('Failed to fetch Dexcom overview');
      }
      return response.json();
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Mutation to disconnect a patient
  const disconnectMutation = useMutation({
    mutationFn: async (patientId: number) => {
      const response = await apiRequest("DELETE", `/api/patients/${patientId}/dexcom/disconnect`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dexcom/overview'] });
      toast({
        title: "Patient Disconnected",
        description: "Patient has been successfully disconnected from Dexcom CGM.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Disconnect Failed",
        description: error.message || "Failed to disconnect patient from Dexcom.",
        variant: "destructive",
      });
    },
  });

  // Mutation to refresh patient data
  const refreshMutation = useMutation({
    mutationFn: async (patientId: number) => {
      const response = await apiRequest("POST", `/api/patients/${patientId}/dexcom/refresh`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      toast({
        title: "Data Refreshed",
        description: "Patient glucose data has been refreshed from Dexcom.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Refresh Failed",
        description: error.message || "Failed to refresh patient data.",
        variant: "destructive",
      });
    },
  });

  const handleDisconnect = (patientId: number) => {
    if (confirm("Are you sure you want to disconnect this patient from Dexcom CGM?")) {
      disconnectMutation.mutate(patientId);
    }
  };

  const handleRefresh = (patientId: number) => {
    refreshMutation.mutate(patientId);
  };

  if (patientsLoading || overviewLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Dexcom CGM Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const connectedPatients = patients?.filter(p => p.dexcomAccessToken) || [];
  const disconnectedPatients = patients?.filter(p => !p.dexcomAccessToken) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Dexcom CGM Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overview Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{patients?.length || 0}</div>
              <div className="text-sm text-blue-800">Total Patients</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{connectedPatients.length}</div>
              <div className="text-sm text-green-800">Connected</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{disconnectedPatients.length}</div>
              <div className="text-sm text-orange-800">Not Connected</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {connectedPatients.length > 0 ? `${Math.round((connectedPatients.length / patients!.length) * 100)}%` : '0%'}
              </div>
              <div className="text-sm text-purple-800">Connection Rate</div>
            </div>
          </div>

          <Separator />

          {/* Connected Patients */}
          {connectedPatients.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Connected Patients ({connectedPatients.length})
              </h4>
              <div className="space-y-2">
                {connectedPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-gray-600">
                          Connected since: {patient.dexcomTokenExpiry ? 
                            new Date(patient.dexcomTokenExpiry).toLocaleDateString() : 'Unknown'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-green-600">
                        <Activity className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRefresh(patient.id)}
                        disabled={refreshMutation.isPending}
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Refresh
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDisconnect(patient.id)}
                        disabled={disconnectMutation.isPending}
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disconnected Patients */}
          {disconnectedPatients.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <XCircle className="w-4 h-4 text-orange-600" />
                Not Connected ({disconnectedPatients.length})
              </h4>
              <div className="space-y-2">
                {disconnectedPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <div>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-gray-600">No Dexcom connection</div>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Patients Message */}
          {(!patients || patients.length === 0) && (
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                No patients found. Add patients to start managing Dexcom CGM connections.
              </AlertDescription>
            </Alert>
          )}

          {/* Management Instructions */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Provider Instructions</h4>
            <ul className="text-sm space-y-1 text-blue-800">
              <li>• Patients can connect their Dexcom CGM from their dashboard</li>
              <li>• Use "Refresh" to pull the latest glucose data from Dexcom</li>
              <li>• "Disconnect" removes CGM access and clears stored tokens</li>
              <li>• Connection status updates automatically every minute</li>
              <li>• View detailed glucose analytics in individual patient cards</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}