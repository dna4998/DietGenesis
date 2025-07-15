import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  FileText, 
  Activity, 
  FlaskConical,
  Loader2,
  CheckCircle,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Patient } from "@shared/schema";

interface AIPlanGeneratorProps {
  patient: Patient;
  onClose: () => void;
}

interface AnalysisStep {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'pending' | 'loading' | 'completed' | 'error';
  result?: any;
}

export default function AIPlanGenerator({ patient, onClose }: AIPlanGeneratorProps) {
  const [steps, setSteps] = useState<AnalysisStep[]>([
    {
      id: 'lab-analysis',
      name: 'Lab Results Analysis',
      icon: <FlaskConical className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'gut-analysis',
      name: 'Gut Biome Analysis',
      icon: <Activity className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'plan-generation',
      name: 'Comprehensive Plan Generation',
      icon: <Brain className="h-5 w-5" />,
      status: 'pending'
    }
  ]);
  
  const [finalPlan, setFinalPlan] = useState<any>(null);
  const { toast } = useToast();

  const updateStepStatus = (stepId: string, status: AnalysisStep['status'], result?: any) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, result } : step
    ));
  };

  const labAnalysisMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/patients/${patient.id}/analyze-labs`);
      return response.json();
    },
    onSuccess: (data) => {
      updateStepStatus('lab-analysis', 'completed', data);
      gutBiomeAnalysisMutation.mutate();
    },
    onError: () => {
      updateStepStatus('lab-analysis', 'error');
      toast({ title: "Lab analysis failed", variant: "destructive" });
    },
  });

  const gutBiomeAnalysisMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/patients/${patient.id}/analyze-gut-biome`);
      return response.json();
    },
    onSuccess: (data) => {
      updateStepStatus('gut-analysis', 'completed', data);
      generatePlanMutation.mutate();
    },
    onError: () => {
      updateStepStatus('gut-analysis', 'error');
      toast({ title: "Gut biome analysis failed - continuing with lab results only", variant: "destructive" });
      // Continue with plan generation even if gut biome analysis fails
      generatePlanMutation.mutate();
    },
  });

  const generatePlanMutation = useMutation({
    mutationFn: async () => {
      const labResult = steps.find(s => s.id === 'lab-analysis')?.result;
      const gutResult = steps.find(s => s.id === 'gut-analysis')?.result;
      
      const response = await apiRequest("POST", `/api/patients/${patient.id}/generate-comprehensive-plan`, {
        labAnalysis: labResult,
        gutBiomeAnalysis: gutResult
      });
      return response.json();
    },
    onSuccess: (data) => {
      updateStepStatus('plan-generation', 'completed', data);
      setFinalPlan(data);
    },
    onError: () => {
      updateStepStatus('plan-generation', 'error');
      toast({ title: "Plan generation failed", variant: "destructive" });
    },
  });

  const sendPlanMutation = useMutation({
    mutationFn: async () => {
      // Update patient with new plans
      await apiRequest("PATCH", `/api/patients/${patient.id}`, {
        dietPlan: finalPlan.dietPlan,
        exercisePlan: finalPlan.exercisePlan,
        supplements: finalPlan.supplementPlan
      });

      // Send comprehensive message to patient
      const planMessage = `🎯 **New Personalized Treatment Plan**

**Diet Plan:**
${finalPlan.dietPlan}

**Supplement Protocol:**
${finalPlan.supplementPlan.map((s: string) => `• ${s}`).join('\n')}

**Exercise Plan:**
${finalPlan.exercisePlan}

**Scientific Rationale:**
${finalPlan.rationale}

**Key Metrics to Track:**
${finalPlan.keyMetrics.map((m: string) => `• ${m}`).join('\n')}

**Follow-up Recommendations:**
${finalPlan.followUpRecommendations.map((r: string) => `• ${r}`).join('\n')}`;

      return apiRequest("POST", `/api/patients/${patient.id}/messages/text`, {
        content: planMessage,
        providerId: 1
      });
    },
    onSuccess: () => {
      toast({ title: "Treatment plan sent to patient successfully!" });
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to send plan to patient", variant: "destructive" });
    },
  });

  const startAnalysis = () => {
    updateStepStatus('lab-analysis', 'loading');
    labAnalysisMutation.mutate();
  };

  const getStepStatusIcon = (status: AnalysisStep['status']) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <div className="h-4 w-4 rounded-full bg-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-600" />
          AI-Powered Treatment Plan Generator
        </CardTitle>
        <p className="text-sm text-gray-600">
          Analyze lab results and gut biome data to create personalized treatment plans for {patient.name}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Analysis Steps */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Analysis Progress</h3>
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {step.icon}
                <span className="font-medium">{step.name}</span>
              </div>
              <div className="flex-1" />
              {getStepStatusIcon(step.status)}
              {step.status === 'completed' && (
                <Badge variant="secondary">Complete</Badge>
              )}
              {step.status === 'error' && step.id === 'gut-analysis' && (
                <Badge variant="outline" className="text-orange-600">Optional - Skipped</Badge>
              )}
            </div>
          ))}
        </div>

        <Separator />

        {/* Results Summary */}
        {finalPlan && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Generated Treatment Plan</h3>
            
            <div className="grid gap-4">
              <Card className="p-4">
                <h4 className="font-semibold text-green-700 mb-2">Diet Plan</h4>
                <p className="text-sm text-gray-700">{finalPlan.dietPlan.substring(0, 200)}...</p>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-semibold text-blue-700 mb-2">Supplement Protocol</h4>
                <div className="space-y-1">
                  {finalPlan.supplementPlan.slice(0, 3).map((supplement: string, index: number) => (
                    <Badge key={index} variant="outline" className="mr-2">
                      {supplement.substring(0, 30)}...
                    </Badge>
                  ))}
                </div>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-semibold text-purple-700 mb-2">Exercise Plan</h4>
                <p className="text-sm text-gray-700">{finalPlan.exercisePlan.substring(0, 200)}...</p>
              </Card>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {!steps.some(s => s.status === 'loading') && !finalPlan && (
            <Button onClick={startAnalysis} className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Start AI Analysis
            </Button>
          )}
          
          {finalPlan && (
            <Button 
              onClick={() => sendPlanMutation.mutate()}
              disabled={sendPlanMutation.isPending}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4" />
              {sendPlanMutation.isPending ? "Sending..." : "Send Plan to Patient"}
            </Button>
          )}
          
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}