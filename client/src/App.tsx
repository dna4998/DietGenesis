import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdaptiveThemeProvider } from "@/components/adaptive-theme-provider";
import Header from "@/components/header";
import PatientDashboard from "@/pages/patient-dashboard";
import ProviderDashboard from "@/pages/provider-dashboard";
import NotFound from "@/pages/not-found";
import { useQuery } from "@tanstack/react-query";

function Router() {
  const [userRole, setUserRole] = useState<"patient" | "provider">("patient");
  const [selectedPatientId, setSelectedPatientId] = useState(1);

  // Your custom DNA Diet Club logo is now active!
  const logoUrl = "/logo.png"; // Your uploaded logo

  // Get patient data for adaptive theming (only for patient view)
  const { data: patient } = useQuery({
    queryKey: [`/api/patients/${selectedPatientId}`],
    enabled: userRole === "patient",
  });

  return (
    <AdaptiveThemeProvider 
      patient={userRole === "patient" ? patient : undefined}
      enabled={userRole === "patient"}
    >
      <div className="min-h-screen bg-background">
        <Header 
          userRole={userRole} 
          onRoleChange={setUserRole}
          logoUrl={logoUrl}
          title="DNA Diet Club"
        />
        <Switch>
          <Route path="/">
            {userRole === "patient" ? (
              <PatientDashboard selectedPatientId={selectedPatientId} />
            ) : (
              <ProviderDashboard />
            )}
          </Route>
          <Route path="/patient-dashboard">
            <PatientDashboard selectedPatientId={selectedPatientId} />
          </Route>
          <Route path="/provider-dashboard">
            <ProviderDashboard />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </div>
    </AdaptiveThemeProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
