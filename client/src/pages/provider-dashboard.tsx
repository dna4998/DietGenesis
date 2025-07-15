import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { Patient } from "@shared/schema";

// Lazy load components to prevent initial loading issues
import { lazy, Suspense } from "react";
const ProviderPatientCard = lazy(() => import("@/components/provider-patient-card"));
const PlanCreationForm = lazy(() => import("@/components/plan-creation-form"));
const AIPlanGenerator = lazy(() => import("@/components/ai-plan-generator"));
const HealthTrendPrediction = lazy(() => import("@/components/health-trend-prediction"));

export default function ProviderDashboard() {
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [showHealthPrediction, setShowHealthPrediction] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const { toast } = useToast();

  const { data: patients, isLoading, error } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const updatePatientMutation = useMutation({
    mutationFn: async ({ 
      patientId, 
      planData 
    }: { 
      patientId: number; 
      planData: {
        dietPlan: string;
        exercisePlan: string;
        supplements: string[];
        glp1Prescription: string;
      };
    }) => {
      const response = await apiRequest("PATCH", `/api/patients/${patientId}`, planData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setShowPlanForm(false);
      setSelectedPatient(null);
      toast({
        title: "Success",
        description: "Patient plans updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update patient plans. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateClick = (patient: Patient) => {
    console.log("handleUpdateClick called for:", patient.name);
    setSelectedPatient(patient);
    setShowPlanForm(true);
  };

  const handleAIAnalysisClick = (patient: Patient) => {
    console.log("handleAIAnalysisClick called for:", patient.name);
    setSelectedPatient(patient);
    setShowAIAnalysis(true);
  };

  const handlePlanSave = (planData: {
    dietPlan: string;
    exercisePlan: string;
    supplements: string[];
    glp1Prescription: string;
  }) => {
    if (selectedPatient) {
      updatePatientMutation.mutate({ 
        patientId: selectedPatient.id, 
        planData 
      });
    }
  };

  const handlePlanCancel = () => {
    setShowPlanForm(false);
    setSelectedPatient(null);
  };

  const handleAIAnalysisClose = () => {
    setShowAIAnalysis(false);
    setSelectedPatient(null);
  };

  const handleHealthPredictionClick = (patient: Patient) => {
    console.log("handleHealthPredictionClick called for:", patient.name);
    setSelectedPatient(patient);
    setShowHealthPrediction(true);
  };

  const handleHealthPredictionClose = () => {
    setShowHealthPrediction(false);
    setSelectedPatient(null);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Patients</h2>
          <p className="text-gray-600">There was an error loading the patient data. Please try again.</p>
        </div>
      </div>
    );
  }

  const totalPatients = patients?.length || 0;
  const avgAdherence = patients?.length ? 
    Math.round(patients.reduce((sum, p) => sum + p.adherence, 0) / patients.length) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage patient care plans and monitor progress</p>
      </div>

      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-medical-blue">{totalPatients}</div>
            <div className="text-gray-600">Active Patients</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-health-green">{avgAdherence}%</div>
            <div className="text-gray-600">Avg. Adherence</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">15</div>
            <div className="text-gray-600">Plans Updated This Week</div>
          </div>
        </div>
      </div>

      {/* Provider Tools */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Provider Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <span className="text-2xl">🩺</span>
                <span>AI Analysis</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <span className="text-2xl">📊</span>
                <span>Health Predictions</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <span className="text-2xl">💬</span>
                <span>Patient Messaging</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {patients && patients.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {patients.map(patient => (
            <Suspense key={patient.id} fallback={<Skeleton className="h-96" />}>
              <ProviderPatientCard 
                patient={patient} 
                onUpdate={handleUpdateClick}
                onAIAnalysis={handleAIAnalysisClick}
                onHealthPrediction={handleHealthPredictionClick}
              />
            </Suspense>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Patients Found</h3>
          <p className="text-gray-600">There are currently no patients in the system.</p>
        </div>
      )}

      {showPlanForm && selectedPatient && (
        <Suspense fallback={<div>Loading...</div>}>
          <PlanCreationForm
            patient={selectedPatient}
            onSave={handlePlanSave}
            onCancel={handlePlanCancel}
          />
        </Suspense>
      )}

      {showAIAnalysis && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Suspense fallback={<div className="bg-white p-8 rounded-lg">Loading AI Analysis...</div>}>
            <AIPlanGenerator
              patient={selectedPatient}
              onClose={handleAIAnalysisClose}
            />
          </Suspense>
        </div>
      )}

      {showHealthPrediction && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <Suspense fallback={<div className="bg-white p-8 rounded-lg">Loading Health Predictions...</div>}>
              <HealthTrendPrediction
                patient={selectedPatient}
              />
            </Suspense>
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={handleHealthPredictionClose}
                className="bg-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
