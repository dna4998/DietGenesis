import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  Shield, 
  Clock, 
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Smartphone,
  Wifi
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface DexcomWizardProps {
  patientId: number;
  onConnectionComplete?: () => void;
}

interface ConnectionStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'current' | 'completed' | 'failed';
}

interface DexcomStatus {
  connected: boolean;
  configured: boolean;
  demo: boolean;
}

export default function DexcomConnectionWizard({ patientId, onConnectionComplete }: DexcomWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionUrl, setConnectionUrl] = useState<string>("");
  const [steps, setSteps] = useState<ConnectionStep[]>([
    {
      id: 'welcome',
      title: 'Welcome to Dexcom CGM',
      description: 'Connect your continuous glucose monitor for real-time health tracking',
      status: 'current'
    },
    {
      id: 'authorize',
      title: 'Secure Authorization',
      description: 'Authorize health platform to access your Dexcom data',
      status: 'pending'
    },
    {
      id: 'connect',
      title: 'Device Connection',
      description: 'Link your Dexcom CGM device to your health profile',
      status: 'pending'
    },
    {
      id: 'complete',
      title: 'Setup Complete',
      description: 'Your Dexcom CGM is now connected and monitoring',
      status: 'pending'
    }
  ]);

  const { toast } = useToast();

  // Check connection status
  const { data: status, refetch: refetchStatus } = useQuery<DexcomStatus>({
    queryKey: ['/api/patients', patientId, 'dexcom', 'status'],
    queryFn: async () => {
      const response = await fetch(`/api/patients/${patientId}/dexcom/status`);
      if (!response.ok) {
        throw new Error('Failed to fetch Dexcom status');
      }
      return response.json();
    },
    refetchInterval: 5000, // Check every 5 seconds during wizard
  });

  // Initialize connection
  const initConnectionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/dexcom/connect/${patientId}`);
      if (!response.ok) {
        throw new Error('Failed to initiate Dexcom connection');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setConnectionUrl(data.authUrl);
      updateStepStatus(1, 'current');
      setCurrentStep(1);
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to initiate Dexcom connection",
        variant: "destructive",
      });
      updateStepStatus(0, 'failed');
    },
  });

  // Monitor connection completion
  useEffect(() => {
    if (status?.connected && currentStep < 3) {
      // Connection completed successfully
      updateStepStatus(2, 'completed');
      updateStepStatus(3, 'current');
      setCurrentStep(3);
      
      setTimeout(() => {
        updateStepStatus(3, 'completed');
        if (onConnectionComplete) {
          onConnectionComplete();
        }
        toast({
          title: "Connection Successful!",
          description: "Your Dexcom CGM is now connected and ready to monitor your glucose levels.",
        });
      }, 2000);
    }
  }, [status?.connected, currentStep, onConnectionComplete, toast]);

  const updateStepStatus = (stepIndex: number, newStatus: ConnectionStep['status']) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, status: newStatus } : step
    ));
  };

  const handleStartConnection = async () => {
    setIsConnecting(true);
    updateStepStatus(0, 'completed');
    try {
      await initConnectionMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to start connection:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleOpenDexcom = () => {
    if (connectionUrl) {
      window.open(connectionUrl, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes');
      updateStepStatus(1, 'completed');
      updateStepStatus(2, 'current');
      setCurrentStep(2);
      
      // Start monitoring for completion
      const interval = setInterval(() => {
        refetchStatus();
      }, 3000);

      // Clean up interval after 5 minutes
      setTimeout(() => {
        clearInterval(interval);
      }, 300000);
    }
  };

  const handleRetry = () => {
    setCurrentStep(0);
    setConnectionUrl("");
    setSteps(prev => prev.map((step, index) => ({
      ...step,
      status: index === 0 ? 'current' : 'pending'
    })));
  };

  const getStepIcon = (step: ConnectionStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'current':
        return <div className="w-5 h-5 rounded-full bg-blue-600 animate-pulse" />;
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-300" />;
    }
  };

  const progressPercentage = (steps.filter(s => s.status === 'completed').length / steps.length) * 100;

  if (status?.connected) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Dexcom CGM Connected!
            </h3>
            <p className="text-green-700 mb-4">
              Your continuous glucose monitor is successfully linked and monitoring your glucose levels in real-time.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-green-600">
              <Wifi className="w-4 h-4" />
              <span>Real-time monitoring active</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Dexcom CGM Connection Wizard
        </CardTitle>
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Steps Progress */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-3">
                {getStepIcon(step)}
                <div className="flex-1">
                  <div className={`font-medium ${
                    step.status === 'current' ? 'text-blue-600' :
                    step.status === 'completed' ? 'text-green-600' :
                    step.status === 'failed' ? 'text-red-600' :
                    'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {step.description}
                  </div>
                </div>
                {step.status === 'current' && (
                  <Badge variant="outline" className="text-xs">
                    Current
                  </Badge>
                )}
              </div>
            ))}
          </div>

          <Separator />

          {/* Step-specific content */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="text-center">
                <Smartphone className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Connect Your Dexcom CGM</h3>
                <p className="text-muted-foreground mb-4">
                  Securely link your continuous glucose monitor to get real-time glucose readings, 
                  trend analysis, and personalized health insights.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-medium text-blue-800">Secure</div>
                  <div className="text-sm text-blue-600">Bank-level encryption</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="font-medium text-green-800">Real-time</div>
                  <div className="text-sm text-green-600">Live glucose tracking</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-medium text-purple-800">Smart</div>
                  <div className="text-sm text-purple-600">AI-powered insights</div>
                </div>
              </div>

              <Button 
                onClick={handleStartConnection}
                disabled={isConnecting || initConnectionMutation.isPending}
                className="w-full"
                size="lg"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Initializing Connection...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Connect to Dexcom
                  </>
                )}
              </Button>
            </div>
          )}

          {currentStep === 1 && connectionUrl && (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  You'll be redirected to Dexcom's secure authorization page. Log in with your Dexcom account to authorize access.
                </AlertDescription>
              </Alert>

              <div className="text-center">
                <div className="bg-blue-50 p-6 rounded-lg mb-4">
                  <ExternalLink className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold mb-2">Authorize with Dexcom</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click the button below to open Dexcom's authorization page in a new window.
                  </p>
                </div>

                <Button onClick={handleOpenDexcom} size="lg" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Dexcom Authorization
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                After authorizing, return to this page. The connection will complete automatically.
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="animate-pulse">
                  <RefreshCw className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Connecting Your Device</h3>
                <p className="text-muted-foreground mb-4">
                  Please wait while we establish a secure connection with your Dexcom CGM...
                </p>

                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    This usually takes 10-30 seconds. Make sure you completed the authorization in the Dexcom window.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Connection Successful!
                </h3>
                <p className="text-muted-foreground mb-4">
                  Your Dexcom CGM is now connected and will start monitoring your glucose levels.
                </p>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-700">
                    ✓ Real-time glucose monitoring active<br />
                    ✓ Trend analysis enabled<br />
                    ✓ Health insights ready
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error state */}
          {steps.some(s => s.status === 'failed') && (
            <div className="mt-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Connection failed. Please try again or contact support if the issue persists.
                </AlertDescription>
              </Alert>
              <Button onClick={handleRetry} variant="outline" className="w-full mt-4">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}