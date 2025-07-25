import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, Settings } from "lucide-react";
import { TwoFactorSetupModal } from "./two-factor-setup-modal";

interface TwoFactorStatus {
  enabled: boolean;
  backupCodesCount: number;
}

export default function TwoFactorSettings() {
  const [showSetupModal, setShowSetupModal] = useState(false);

  // Get 2FA status
  const { data: twoFactorStatus, isLoading } = useQuery<TwoFactorStatus>({
    queryKey: ['/api/2fa/status'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {twoFactorStatus?.enabled ? (
              <ShieldCheck className="h-5 w-5 text-green-600" />
            ) : (
              <Shield className="h-5 w-5 text-gray-600" />
            )}
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Security Status</span>
                {twoFactorStatus?.enabled ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Enabled
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-orange-200 text-orange-800">
                    Disabled
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {twoFactorStatus?.enabled
                  ? "Your account is protected with two-factor authentication"
                  : "Add an extra layer of security to your account"
                }
              </p>
              {twoFactorStatus?.enabled && twoFactorStatus.backupCodesCount !== undefined && (
                <p className="text-sm text-gray-500">
                  {twoFactorStatus.backupCodesCount} backup codes remaining
                </p>
              )}
            </div>
            <Button
              onClick={() => setShowSetupModal(true)}
              variant={twoFactorStatus?.enabled ? "outline" : "default"}
              size="sm"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {twoFactorStatus?.enabled ? "Manage" : "Setup"}
            </Button>
          </div>

          {!twoFactorStatus?.enabled && (
            <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
              <div className="flex">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">
                    Enhance Your Account Security
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Two-factor authentication adds an extra layer of protection by requiring a code from your phone in addition to your password.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <TwoFactorSetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
      />
    </>
  );
}