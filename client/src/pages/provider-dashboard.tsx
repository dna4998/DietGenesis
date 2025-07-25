import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import PatientDashboard from "./patient-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, MessageCircle, Clock, Send, FileText, Video } from "lucide-react";
import type { Patient, Message } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

// Form schema for creating new patients
const createPatientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  age: z.number().min(1).max(120),
  weight: z.number().min(1),
  weightGoal: z.number().min(1),
  bodyFat: z.number().min(1).max(50),
  bodyFatGoal: z.number().min(1).max(50),
  bloodPressure: z.string().min(1, "Blood pressure is required"),
  sendWelcomeEmail: z.boolean().default(true),
});

type CreatePatientForm = z.infer<typeof createPatientSchema>;

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
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showPatientView, setShowPatientView] = useState(false);
  const [showMessageCenter, setShowMessageCenter] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<CreatePatientForm>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      age: 30,
      weight: 150,
      weightGoal: 140,
      bodyFat: 20,
      bodyFatGoal: 15,
      bloodPressure: "120/80",
      sendWelcomeEmail: true,
    },
  });

  const { data: patients, isLoading, error } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  // Get all messages for this provider
  const { data: providerMessages, isLoading: messagesLoading } = useQuery({
    queryKey: [`/api/providers/${user?.id}/messages`],
    enabled: !!user?.id,
    retry: false,
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

  const createPatientMutation = useMutation({
    mutationFn: async (patientData: CreatePatientForm) => {
      const response = await apiRequest("POST", "/api/patients", patientData);
      return response.json();
    },
    onSuccess: (responseData: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setShowAddPatient(false);
      form.reset();
      
      // Show success message with email status
      const emailStatus = responseData.emailSent 
        ? "Welcome email with login credentials sent successfully!" 
        : "Patient created but welcome email could not be sent.";
      
      toast({
        title: "Patient Added Successfully",
        description: `${responseData.name} has been added to your patient list. ${emailStatus}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Patient",
        description: error.message || "Failed to add patient. Please try again.",
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

  const handleAddPatient = (data: CreatePatientForm) => {
    createPatientMutation.mutate(data);
  };

  const handleAddPatientCancel = () => {
    setShowAddPatient(false);
    form.reset();
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage patient care plans and monitor progress</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button 
              onClick={() => setShowPatientView(!showPatientView)} 
              variant={showPatientView ? "default" : "outline"}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              🎉 {showPatientView ? "Back to Provider" : "View Patient Celebrations"}
            </Button>
            <Button 
              onClick={() => setShowAddPatient(true)} 
              className="flex items-center gap-2 bg-medical-blue hover:bg-blue-700 text-white w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Add New Patient
            </Button>
          </div>
        </div>
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
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-blue-50 hover:border-blue-300"
                onClick={() => patients?.[0] && handleAIAnalysisClick(patients[0])}
                disabled={!patients?.length}
              >
                <span className="text-2xl">🩺</span>
                <span>AI Analysis</span>
                <span className="text-xs text-gray-500">Lab results & gut biome</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-green-50 hover:border-green-300"
                onClick={() => patients?.[0] && handleHealthPredictionClick(patients[0])}
                disabled={!patients?.length}
              >
                <span className="text-2xl">📊</span>
                <span>Health Predictions</span>
                <span className="text-xs text-gray-500">Risk assessment & trends</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-purple-50 hover:border-purple-300 relative"
                onClick={() => setShowMessageCenter(true)}
              >
                <span className="text-2xl">💬</span>
                <span>Message Center</span>
                <span className="text-xs text-gray-500">Patient messages</span>
                {providerMessages && Array.isArray(providerMessages) && providerMessages.filter((m: any) => !m.isRead && m.direction === 'patient_to_provider').length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {providerMessages.filter((m: any) => !m.isRead && m.direction === 'patient_to_provider').length}
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Celebration Demo View */}
      {showPatientView && patients && patients.length > 0 && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-purple-800 mb-2">🎉 Patient Celebration Demo</h2>
            <p className="text-purple-600">
              This shows how patients see their progress with animated celebrations, achievement badges, and milestone notifications.
            </p>
          </div>
          <PatientDashboard selectedPatientId={patients[0].id} />
        </div>
      )}

      {!showPatientView && patients && patients.length > 0 ? (
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

      {/* Add Patient Dialog */}
      <Dialog open={showAddPatient} onOpenChange={setShowAddPatient}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddPatient)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input placeholder="Password" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="30" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (lbs)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="150" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weightGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight Goal (lbs)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="140" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bodyFat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body Fat (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="20" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bodyFatGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body Fat Goal (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="15" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bloodPressure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Pressure</FormLabel>
                    <FormControl>
                      <Input placeholder="120/80" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sendWelcomeEmail"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Send welcome email with login credentials
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Automatically email the patient their login details and app access link
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleAddPatientCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPatientMutation.isPending}>
                  {createPatientMutation.isPending ? "Adding..." : "Add Patient"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Message Center Dialog */}
      <Dialog open={showMessageCenter} onOpenChange={setShowMessageCenter}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Message Center
              {providerMessages && Array.isArray(providerMessages) && providerMessages.filter((m: any) => !m.isRead && m.direction === 'patient_to_provider').length > 0 && (
                <Badge variant="destructive">
                  {providerMessages.filter((m: any) => !m.isRead && m.direction === 'patient_to_provider').length} unread
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[60vh]">
            {messagesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : !providerMessages || !Array.isArray(providerMessages) || providerMessages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No messages yet. Patients will be able to send you messages from their dashboard.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {providerMessages.map((message: any) => {
                  // Find the patient for this message
                  const messagePatient = patients?.find(p => p.id === message.patientId);
                  const isFromPatient = message.direction === 'patient_to_provider';
                  const isFromProvider = message.direction === 'provider_to_patient';
                  
                  const getMessageIcon = (messageType: string) => {
                    switch (messageType) {
                      case 'video_link': return <Video className="h-4 w-4" />;
                      case 'pdf_link': case 'pdf': return <FileText className="h-4 w-4" />;
                      default: return <Send className="h-4 w-4" />;
                    }
                  };

                  return (
                    <div 
                      key={message.id} 
                      className={`p-4 rounded-lg border ${
                        isFromPatient 
                          ? (message.isRead ? 'bg-green-50 border-green-200' : 'bg-green-100 border-green-300')
                          : 'bg-blue-50 border-blue-200 ml-8'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getMessageIcon(message.messageType)}
                          <span className="text-sm font-medium">
                            {isFromPatient ? `From: ${messagePatient?.name || 'Unknown Patient'}` : 'You sent:'}
                          </span>
                          {isFromPatient && !message.isRead && (
                            <Badge variant="destructive" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {new Date(message.createdAt).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-800 mb-2">
                        {message.content}
                      </div>
                      
                      {message.fileUrl && (
                        <div className="mt-2">
                          <a 
                            href={message.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline text-sm"
                          >
                            {message.messageType === 'video_link' ? 'View Video' : 
                             message.messageType === 'pdf_link' ? 'View PDF' : 
                             message.fileName || 'View File'}
                          </a>
                        </div>
                      )}
                      
                      {isFromPatient && !message.isRead && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2"
                          onClick={async () => {
                            try {
                              await apiRequest("PATCH", `/api/messages/${message.id}/read`);
                              queryClient.invalidateQueries({ queryKey: [`/api/providers/${user?.id}/messages`] });
                              toast({ title: "Message marked as read" });
                            } catch (error) {
                              toast({ 
                                title: "Error", 
                                description: "Failed to mark message as read",
                                variant: "destructive" 
                              });
                            }
                          }}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setShowMessageCenter(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
