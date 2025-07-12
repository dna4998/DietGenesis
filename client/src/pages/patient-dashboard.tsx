import { useQuery } from "@tanstack/react-query";
import HealthMetricsCard from "@/components/health-metrics-card";
import MessagingCard from "@/components/messaging-card";
import SubscriptionCard from "@/components/subscription-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Patient } from "@shared/schema";

interface PatientDashboardProps {
  selectedPatientId: number;
}

export default function PatientDashboard({ selectedPatientId }: PatientDashboardProps) {
  const { data: patient, isLoading, error } = useQuery<Patient>({
    queryKey: ["/api/patients", selectedPatientId],
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

  if (!patient) {
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
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {patient.name}</h1>
        <p className="mt-2 text-gray-600">Last visit: {patient.lastVisit}</p>
      </div>

      {/* Simplified Patient View - Demographics and Messages Only */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Patient Demographics and Health Info */}
        <div className="space-y-6">
          <HealthMetricsCard patient={patient} />
          <SubscriptionCard patient={patient} />
        </div>
        
        {/* Messages from Provider */}
        <div className="space-y-6">
          <MessagingCard patient={patient} />
        </div>
      </div>
    </div>
  );
}
