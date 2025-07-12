import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/header";
import PatientDashboard from "@/pages/patient-dashboard";
import ProviderDashboard from "@/pages/provider-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  const [userRole, setUserRole] = useState<"patient" | "provider">("patient");
  const [selectedPatientId, setSelectedPatientId] = useState(1);

  // To use your own logo, uncomment and modify the line below:
  // const logoUrl = "/your-logo.png"; // Place your logo file in the public folder
  // const logoUrl = "/sample-logo.svg"; // Try the sample logo
  const logoUrl = undefined; // Currently using default DNA icon

  return (
    <div className="min-h-screen bg-gray-50">
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
