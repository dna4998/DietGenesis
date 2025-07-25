import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, Smartphone, Copy, Check, AlertTriangle } from "lucide-react";

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

interface TwoFactorStatus {
  enabled: boolean;
  backupCodesCount: number;
}

export function TwoFactorSetupModal({ isOpen, onClose }: TwoFactorSetupModalProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [verificationCode, setVerificationCode] = useState('');
  const [setupData, setSetupData] = useState<TwoFactorSetup | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get 2FA status
  const { data: twoFactorStatus } = useQuery<TwoFactorStatus>({
    queryKey: ['/api/2fa/status'],
    enabled: isOpen,
  });

  // Setup 2FA mutation
  const setupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/2fa/setup');
      return response.json();
    },
    onSuccess: (data: TwoFactorSetup) => {
      setSetupData(data);
      setStep('verify');
    },
    onError: (error: Error) => {
      toast({
        title: "Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Enable 2FA mutation
  const enableMutation = useMutation({
    mutationFn: async ({ secret, verificationCode, backupCodes }: {
      secret: string;
      verificationCode: string;
      backupCodes: string[];
    }) => {
      const response = await apiRequest('POST', '/api/2fa/enable', {
        secret,
        verificationCode,
        backupCodes,
      });
      return response.json();
    },
    onSuccess: () => {
      setStep('backup');
      toast({
        title: "Two-Factor Authentication Enabled",
        description: "Your account is now protected with 2FA",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/2fa/status'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Disable 2FA mutation
  const disableMutation = useMutation({
    mutationFn: async (verificationCode: string) => {
      const response = await apiRequest('POST', '/api/2fa/disable', {
        verificationCode,
      });
      return response.json();
    },
    onSuccess: () => {
      onClose();
      toast({
        title: "Two-Factor Authentication Disabled",
        description: "2FA has been removed from your account",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/2fa/status'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Disable Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSetup = () => {
    setupMutation.mutate();
  };

  const handleVerify = () => {
    if (!setupData || !verificationCode) return;
    
    enableMutation.mutate({
      secret: setupData.secret,
      verificationCode,
      backupCodes: setupData.backupCodes,
    });
  };

  const handleDisable = () => {
    if (!verificationCode) return;
    disableMutation.mutate(verificationCode);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
      toast({
        title: "Copied",
        description: "Code copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setStep('setup');
    setVerificationCode('');
    setSetupData(null);
    setCopiedCode(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            Add an extra layer of security to your account with time-based codes from your phone.
          </DialogDescription>
        </DialogHeader>

        {twoFactorStatus?.enabled ? (
          // Disable 2FA flow
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-md">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">
                Two-factor authentication is currently enabled
              </span>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="disable-code">Enter verification code to disable 2FA</Label>
              <Input
                id="disable-code"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleDisable}
                disabled={!verificationCode || disableMutation.isPending}
                variant="destructive"
              >
                {disableMutation.isPending ? "Disabling..." : "Disable 2FA"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          // Enable 2FA flow
          <Tabs value={step} onValueChange={(value) => setStep(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="verify" disabled={!setupData}>Verify</TabsTrigger>
              <TabsTrigger value="backup" disabled={step !== 'backup'}>Backup</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-4">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  <Smartphone className="h-12 w-12 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Install an Authenticator App</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Download Google Authenticator, Authy, or similar app on your phone
                  </p>
                </div>
                <Button 
                  onClick={handleSetup} 
                  disabled={setupMutation.isPending}
                  className="w-full"
                >
                  {setupMutation.isPending ? "Generating..." : "Generate QR Code"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="verify" className="space-y-4">
              {setupData && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="font-semibold mb-2">Scan QR Code</h3>
                    <div className="flex justify-center mb-4">
                      <img 
                        src={setupData.qrCode} 
                        alt="QR Code" 
                        className="w-48 h-48 border rounded-md"
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      Or manually enter this secret key in your authenticator app:
                    </p>
                    <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 rounded-md">
                      <code className="text-sm flex-1">{setupData.secret}</code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(setupData.secret)}
                      >
                        {copiedCode === setupData.secret ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="verification-code">Enter the 6-digit code from your app</Label>
                    <Input
                      id="verification-code"
                      placeholder="123456"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={6}
                    />
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleVerify}
                      disabled={!verificationCode || enableMutation.isPending}
                    >
                      {enableMutation.isPending ? "Verifying..." : "Verify & Enable"}
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </TabsContent>

            <TabsContent value="backup" className="space-y-4">
              {setupData && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-md">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      Save these backup codes in a secure location
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Backup Recovery Codes</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Use these codes if you lose access to your authenticator app. Each code can only be used once.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {setupData.backupCodes.map((code, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                          <code className="text-sm flex-1">{code}</code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(code)}
                          >
                            {copiedCode === code ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button onClick={handleClose} className="w-full">
                      Done
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}