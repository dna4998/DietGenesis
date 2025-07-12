import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info, 
  RefreshCw,
  ExternalLink,
  Shield,
  Globe,
  Settings
} from "lucide-react";

interface DexcomDiagnostics {
  apiConfigured: boolean;
  environmentMode: 'sandbox' | 'production';
  clientIdPresent: boolean;
  clientSecretPresent: boolean;
  redirectUri: string;
  baseUrl: string;
  lastError?: string;
  connectionTest?: {
    success: boolean;
    statusCode?: number;
    message?: string;
  };
}

export default function DexcomTroubleshooting() {
  const [testingConnection, setTestingConnection] = useState(false);

  const { data: diagnostics, isLoading, refetch } = useQuery<DexcomDiagnostics>({
    queryKey: ['/api/dexcom/diagnostics'],
    queryFn: async () => {
      const response = await fetch('/api/dexcom/diagnostics');
      if (!response.ok) {
        throw new Error('Failed to fetch Dexcom diagnostics');
      }
      return response.json();
    },
  });

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      await fetch('/api/dexcom/test-connection', { method: 'POST' });
      await refetch();
    } catch (error) {
      console.error('Connection test failed:', error);
    } finally {
      setTestingConnection(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Dexcom Integration Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Dexcom Integration Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Configuration Status */}
          <div className="space-y-3">
            <h4 className="font-medium">Configuration Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">API Configured</span>
                </div>
                {diagnostics?.apiConfigured ? (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Yes
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="w-3 h-3 mr-1" />
                    No
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">Environment</span>
                </div>
                <Badge variant={diagnostics?.environmentMode === 'production' ? 'default' : 'secondary'}>
                  {diagnostics?.environmentMode || 'Unknown'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  <span className="text-sm">Client ID</span>
                </div>
                {diagnostics?.clientIdPresent ? (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Present
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="w-3 h-3 mr-1" />
                    Missing
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Client Secret</span>
                </div>
                {diagnostics?.clientSecretPresent ? (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Present
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="w-3 h-3 mr-1" />
                    Missing
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* API Endpoints */}
          <div className="space-y-3">
            <h4 className="font-medium">API Configuration</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Base URL:</span>
                <code className="text-sm bg-white px-2 py-1 rounded">{diagnostics?.baseUrl}</code>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Redirect URI:</span>
                <code className="text-sm bg-white px-2 py-1 rounded">{diagnostics?.redirectUri}</code>
              </div>
            </div>
          </div>

          <Separator />

          {/* Connection Test */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Connection Test</h4>
              <Button
                size="sm"
                onClick={handleTestConnection}
                disabled={testingConnection}
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${testingConnection ? 'animate-spin' : ''}`} />
                Test Connection
              </Button>
            </div>

            {diagnostics?.connectionTest && (
              <div className={`p-3 rounded-lg ${
                diagnostics.connectionTest.success ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {diagnostics.connectionTest.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="font-medium">
                    {diagnostics.connectionTest.success ? 'Connection Successful' : 'Connection Failed'}
                  </span>
                </div>
                {diagnostics.connectionTest.statusCode && (
                  <div className="text-sm text-gray-600">
                    Status Code: {diagnostics.connectionTest.statusCode}
                  </div>
                )}
                {diagnostics.connectionTest.message && (
                  <div className="text-sm text-gray-600">
                    {diagnostics.connectionTest.message}
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Troubleshooting Steps */}
          <div className="space-y-3">
            <h4 className="font-medium">Troubleshooting Steps</h4>
            
            {!diagnostics?.apiConfigured && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>API Not Configured:</strong> Dexcom credentials are missing. Please add DEXCOM_CLIENT_ID and DEXCOM_CLIENT_SECRET to your environment variables.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-yellow-800">Dexcom Developer Setup</div>
                    <div className="text-sm text-yellow-700 mt-1">
                      1. Visit <a href="https://developer.dexcom.com" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">
                        Dexcom Developer Portal <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="text-sm text-yellow-700">
                      2. Create or log into your developer account
                    </div>
                    <div className="text-sm text-yellow-700">
                      3. Create a new application for "DNA Diet Club"
                    </div>
                    <div className="text-sm text-yellow-700">
                      4. Set redirect URI to: <code className="bg-white px-1 rounded">{diagnostics?.redirectUri}</code>
                    </div>
                    <div className="text-sm text-yellow-700">
                      5. Copy Client ID and Client Secret to your environment
                    </div>
                  </div>
                </div>
              </div>

              {diagnostics?.environmentMode === 'sandbox' && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-800">Sandbox Mode</div>
                      <div className="text-sm text-blue-700 mt-1">
                        Currently running in sandbox mode for testing. Patient connections will use demo data until moved to production.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Settings className="w-4 h-4 text-gray-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-800">Common Issues</div>
                    <ul className="text-sm text-gray-700 mt-1 space-y-1">
                      <li>• Ensure redirect URI matches exactly in Dexcom app settings</li>
                      <li>• Verify Client ID and Secret are correctly copied (no extra spaces)</li>
                      <li>• Check that your Dexcom developer application is approved</li>
                      <li>• Confirm your test account has appropriate permissions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {diagnostics?.lastError && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Last Error:</strong> {diagnostics.lastError}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}