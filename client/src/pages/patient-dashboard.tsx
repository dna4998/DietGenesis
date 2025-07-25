import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import HealthMetricsCard from "@/components/health-metrics-card";
import MessagingCard from "@/components/messaging-card";
import PatientMessageInput from "@/components/patient-message-input";
import SimpleSubscriptionCard from "@/components/simple-subscription-card";
import HealthTipsWidget from "@/components/health-tips-widget";
import DexcomIntegration from "@/components/dexcom-integration";
import HealthStatusIndicator from "@/components/health-status-indicator";
import TwoFactorSettings from "@/components/two-factor-settings";


import CelebrationTrigger, { useCelebrationTrigger } from "@/components/celebration-trigger";
import ProgressCelebration from "@/components/progress-celebration";
import ProgressCard from "@/components/progress-card";
import WeightProgressChart from "@/components/weight-progress-chart";
import ExercisePlanCard from "@/components/exercise-plan-card";
import SupplementsCard from "@/components/supplements-card";
import { useProgressCelebration } from "@/hooks/use-progress-celebration";

import { Skeleton } from "@/components/ui/skeleton";
import type { Patient } from "@shared/schema";

interface PatientDashboardProps {
  selectedPatientId: number;
}

export default function PatientDashboard({ selectedPatientId }: PatientDashboardProps) {
  const { toast } = useToast();
  const [localPatient, setLocalPatient] = useState<Patient | null>(null);
  
  // Celebration hooks
  const { showCelebration, celebrationData, triggerCelebration, closeCelebration } = useProgressCelebration();
  const { lastTriggeredAchievement, handleCelebrationTriggered, requestNotificationPermission } = useCelebrationTrigger(localPatient || {} as Patient);

  // Check for subscription status in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const subscriptionStatus = urlParams.get('subscription');
    
    if (subscriptionStatus === 'success') {
      toast({
        title: "Subscription Activated!",
        description: "Your subscription has been successfully activated. Welcome to our health platform!",
      });
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Request notification permission and trigger celebration
      requestNotificationPermission();
      setTimeout(() => {
        if (localPatient) {
          triggerCelebration(localPatient);
        }
      }, 1000);
    } else if (subscriptionStatus === 'cancelled') {
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription process was cancelled. You can try again anytime.",
        variant: "destructive",
      });
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast, localPatient, triggerCelebration, requestNotificationPermission]);

  // Request notification permission on first load
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  const { data: patient, isLoading, error } = useQuery<Patient>({
    queryKey: ["/api/patients", selectedPatientId],
  });

  // Update local patient when data changes
  useEffect(() => {
    if (patient) {
      setLocalPatient(patient);
    }
  }, [patient]);

  // Use local patient for demo purposes, fall back to fetched patient
  const displayPatient = localPatient || patient;

  // Fetch subscription status
  const { data: subscriptionStatus } = useQuery({
    queryKey: ['/api/patients', selectedPatientId, 'subscription', 'status'],
    enabled: !!displayPatient,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Patient Data</h2>
          <p className="text-gray-600">There was an error loading the patient information. Please try again.</p>
        </div>
      </div>
    );
  }

  if (!displayPatient) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Patient Not Found</h2>
          <p className="text-gray-600">The requested patient could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Celebration Trigger - Auto-detects achievements */}
      <CelebrationTrigger 
        patient={displayPatient} 
        onCelebrationTriggered={handleCelebrationTriggered}
      />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {displayPatient.name}</h1>
        <p className="mt-2 text-muted-foreground">Last visit: {displayPatient.lastVisit}</p>
      </div>








      {/* Health Status Overview - Shows adaptive theme */}
      <div className="mb-6">
        <HealthStatusIndicator patient={displayPatient} showRecommendations={true} />
      </div>

      {/* Health Metrics - Positioned right below health status overview */}
      <div className="mb-6">
        <HealthMetricsCard patient={displayPatient} />
      </div>

      {/* Progress Overview - Positioned right below health metrics */}
      <div className="mb-6">
        <ProgressCard patient={displayPatient} />
      </div>

      {/* Daily Health Tip */}
      <div className="mb-6">
        <HealthTipsWidget patient={displayPatient} />
      </div>

      {/* Enhanced Patient View with Progress Celebrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Messages from Provider */}
        <div className="space-y-6">
          <MessagingCard patient={displayPatient} />
          {/* Message Your Provider - Positioned right after received messages */}
          <PatientMessageInput 
            patientId={displayPatient.id} 
            providerId={7} 
            disabled={false}
          />
        </div>
        
        {/* Patient Settings and Integrations */}
        <div className="space-y-6">
          <DexcomIntegration patientId={displayPatient.id} />
          <TwoFactorSettings />
        </div>
      </div>



      {/* Exercise and Supplement Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ExercisePlanCard patient={displayPatient} />
        <SupplementsCard patient={displayPatient} />
      </div>

      {/* Weight Progress Visualization */}
      <div className="mb-8">
        <WeightProgressChart patient={displayPatient} />
      </div>

      {/* Choose Your Plan - Positioned at the bottom */}
      <div className="mb-8">
        <SimpleSubscriptionCard patient={displayPatient} />
      </div>

      {/* Progress Celebration Modal */}
      {showCelebration && celebrationData && (
        <ProgressCelebration
          patient={{
            name: celebrationData.name,
            weight: parseFloat(celebrationData.weight as string) || 0,
            weightGoal: parseFloat(celebrationData.weightGoal as string) || 0,
            bodyFat: parseFloat(celebrationData.bodyFat as string) || 0,
            bodyFatGoal: parseFloat(celebrationData.bodyFatGoal as string) || 0,
            adherence: celebrationData.adherence || 0
          }}
          onClose={closeCelebration}
        />
      )}
    </div>
  );
}
