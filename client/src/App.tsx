import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdaptiveThemeProvider } from "@/components/adaptive-theme-provider";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/header";
import PatientDashboard from "@/pages/patient-dashboard";
import ProviderDashboard from "@/pages/provider-dashboard";
import HipaaConsent from "@/pages/hipaa-consent";
import PrivacyPolicy from "@/pages/privacy-policy";
import Login from "@/pages/login";
import ProviderLogin from "@/pages/provider-login";
import NotFound from "@/pages/not-found";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { SkipLinks, LiveRegion } from "@/components/accessibility-features";
import { announceToScreenReader } from "@/lib/accessibility";

function AuthenticatedApp() {
  const { user, isPatient, isProvider } = useAuth();
  const [showHipaaConsent, setShowHipaaConsent] = useState(false);
  const [routeAnnounced, setRouteAnnounced] = useState(false);

  // Get patient data for adaptive theming (only for patient view)
  const { data: patient } = useQuery({
    queryKey: [`/api/patients/${user?.id}`],
    enabled: isPatient,
  });

  // Check HIPAA consent status for patients
  useEffect(() => {
    if (user && user.type === 'patient') {
      const checkHipaaStatus = async () => {
        try {
          const response = await apiRequest("GET", `/api/patients/${user.id}/hipaa-status`);
          const data = await response.json();
          setShowHipaaConsent(!data.hipaaConsentGiven);
        } catch (error) {
          console.error('Error checking HIPAA status:', error);
          setShowHipaaConsent(true); // Default to showing consent if there's an error
        }
      };
      checkHipaaStatus();
    }
  }, [user]);

  // Announce route changes to screen readers
  useEffect(() => {
    if (!routeAnnounced && user) {
      const role = user.type === 'patient' ? 'Patient' : 'Healthcare Provider';
      announceToScreenReader(`${role} dashboard loaded`, 'polite');
      setRouteAnnounced(true);
    }
  }, [user, routeAnnounced]);

  // Show HIPAA consent form for patients who haven't consented yet
  if (user && user.type === 'patient' && showHipaaConsent) {
    return (
      <HipaaConsent 
        patientId={user.id} 
        onComplete={() => setShowHipaaConsent(false)} 
      />
    );
  }

  return (
    <AdaptiveThemeProvider 
      patient={isPatient ? patient : undefined}
      enabled={isPatient}
    >
      <div className="min-h-screen bg-background">
        {/* Skip Links for keyboard navigation */}
        <SkipLinks />
        
        {/* Live region for screen reader announcements */}
        <LiveRegion />
        
        {/* Main navigation header */}
        <nav id="navigation" role="navigation" aria-label="Main navigation">
          <Header 
            userRole={user?.type || "patient"} 
            onRoleChange={() => {}} // Not needed with real auth
            title="DNA Diet Club"
            user={user}
          />
        </nav>
        
        {/* Main content area */}
        <main id="main-content" role="main" tabIndex={-1} className="focus:outline-none">
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/provider-login" component={ProviderLogin} />
            <Route path="/privacy-policy" component={PrivacyPolicy} />
            <Route path="/">
              {isPatient ? (
              <PatientDashboard selectedPatientId={user?.id || 1} />
            ) : (
              <ProviderDashboard />
            )}
          </Route>
          <Route component={NotFound} />
        </Switch>
        </main>
      </div>
    </AdaptiveThemeProvider>
  );
}

function Router() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/provider-login" component={ProviderLogin} />
        <Route component={Login} />
      </Switch>
    );
  }

  return <AuthenticatedApp />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}