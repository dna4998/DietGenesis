import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import HealthMetricsCard from "@/components/health-metrics-card";
import MessagingCard from "@/components/messaging-card";
import SimpleSubscriptionCard from "@/components/simple-subscription-card";
import HealthTipsWidget from "@/components/health-tips-widget";
import DexcomIntegration from "@/components/dexcom-integration";
import HealthStatusIndicator from "@/components/health-status-indicator";
import ThemeDemoControls from "@/components/theme-demo-controls";
import MobilePreview from "@/components/mobile-optimizations";
import ColorSchemeSelector from "@/components/color-scheme-selector";
import { Skeleton } from "@/components/ui/skeleton";
import type { Patient } from "@shared/schema";

interface PatientDashboardProps {
  selectedPatientId: number;
}

export default function PatientDashboard({ selectedPatientId }: PatientDashboardProps) {
  const { toast } = useToast();
  const [localPatient, setLocalPatient] = useState<Patient | null>(null);

  // Check for subscription status in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const subscriptionStatus = urlParams.get('subscription');
    
    if (subscriptionStatus === 'success') {
      toast({
        title: "Subscription Activated!",
        description: "Your subscription has been successfully activated. Welcome to DNA Diet Club!",
      });
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (subscriptionStatus === 'cancelled') {
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription process was cancelled. You can try again anytime.",
        variant: "destructive",
      });
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {displayPatient.name}</h1>
        <p className="mt-2 text-muted-foreground">Last visit: {displayPatient.lastVisit}</p>
      </div>

      {/* Color Scheme Options */}
      <div className="mb-6">
        <ColorSchemeSelector 
          onSchemeSelect={(scheme) => {
            // In a real app, this would update the theme configuration
            console.log('Selected color scheme:', scheme.name);
          }}
          currentScheme="Modern Minimalist"
        />
      </div>

      {/* Mobile Preview - shows how the app looks on mobile devices */}
      <div className="mb-6 hidden md:block">
        <MobilePreview patient={displayPatient} />
      </div>

      {/* Theme Demo Controls - allows users to see adaptive theming in action */}
      <ThemeDemoControls 
        patient={displayPatient} 
        onPatientUpdate={(updates) => setLocalPatient(prev => prev ? { ...prev, ...updates } : null)}
      />

      {/* Health Status Overview - Shows adaptive theme */}
      <div className="mb-6">
        <HealthStatusIndicator patient={displayPatient} showRecommendations={true} />
      </div>

      {/* Daily Health Tip */}
      <div className="mb-6">
        <HealthTipsWidget patient={displayPatient} />
      </div>

      {/* Simplified Patient View - Demographics and Messages Only */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Patient Demographics and Health Info */}
        <div className="space-y-6">
          <HealthMetricsCard patient={displayPatient} />
          <SimpleSubscriptionCard patient={displayPatient} />
        </div>
        
        {/* Messages from Provider */}
        <div className="space-y-6">
          <MessagingCard patient={displayPatient} />
          <DexcomIntegration patientId={displayPatient.id} />
        </div>
      </div>
    </div>
  );
}
