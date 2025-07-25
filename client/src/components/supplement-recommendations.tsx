import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pill, DollarSign, ExternalLink, Settings, Search, Plus, Trash2, Share2, Copy, Mail, Link2, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const affiliateSettingsSchema = z.object({
  thorneAffiliateId: z.string().min(1, "Affiliate ID is required"),
  affiliateCode: z.string().min(1, "Affiliate code is required"),
  practiceUrl: z.string().url("Must be a valid URL").optional(),
  trackingEnabled: z.boolean().default(true),
});

const recommendationSchema = z.object({
  specificConcerns: z.string().optional(),
});

interface Patient {
  id: number;
  name: string;
  email: string;
  age: number;
  weight: string;
  insulinResistance: boolean;
  bloodPressure: string;
}

interface SupplementRecommendation {
  id: number;
  patientId: number;
  thorneProductId: string;
  productName: string;
  dosage: string;
  frequency: string;
  duration: string;
  reason: string;
  price: number;
  affiliateUrl: string;
  isActive: boolean;
  createdAt: string;
}

interface ThorneProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  ingredients: string[];
  benefits: string[];
  dosage: string;
  contraindications: string[];
  researchBacked: boolean;
}

interface SupplementRecommendationsProps {
  patientId: number;
  isProvider: boolean;
}

export function SupplementRecommendations({ patientId, isProvider }: SupplementRecommendationsProps) {
  console.log("SupplementRecommendations component rendering for patient:", patientId, "isProvider:", isProvider);
  
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAffiliateSettings, setShowAffiliateSettings] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Fetch affiliate settings
  const { data: affiliateSettings } = useQuery({
    queryKey: ['/api/provider/affiliate-settings'],
    enabled: isProvider,
  });

  // Fetch current recommendations
  const { data: recommendationsData, isLoading: loadingRecommendations } = useQuery({
    queryKey: ['/api/patients', patientId, 'supplement-recommendations'],
  });

  // Fetch patient data
  const { data: patient } = useQuery<Patient>({
    queryKey: ['/api/patients', patientId],
  });

  // Search Thorne products
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['/api/thorne/products/search', searchQuery],
    enabled: isProvider && searchQuery.length > 2,
  });

  // Forms
  const affiliateForm = useForm({
    resolver: zodResolver(affiliateSettingsSchema),
    defaultValues: affiliateSettings?.settings || {
      thorneAffiliateId: "PR115297",
      affiliateCode: "PR115297",
      practiceUrl: "https://www.thorne.com/u/PR115297",
      trackingEnabled: true,
    },
  });

  const recommendationForm = useForm({
    resolver: zodResolver(recommendationSchema),
    defaultValues: {
      specificConcerns: "",
    },
  });

  // Mutations
  const saveAffiliateSettings = useMutation({
    mutationFn: (data: any) => {
      console.log("Saving affiliate settings with data:", data);
      console.log("Data type:", typeof data);
      console.log("Data keys:", Object.keys(data));
      console.log("JSON stringified data:", JSON.stringify(data));
      
      return apiRequest('/api/provider/affiliate-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: (response) => {
      console.log("Affiliate settings saved successfully:", response);
      queryClient.invalidateQueries({ queryKey: ['/api/provider/affiliate-settings'] });
      setShowAffiliateSettings(false);
    },
    onError: (error) => {
      console.error("Failed to save affiliate settings:", error);
      console.error("Error details:", error.message || error);
      // You could add a toast notification here to show the error to the user
    },
  });

  const generateRecommendations = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/patients/${patientId}/supplement-recommendations`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients', patientId, 'supplement-recommendations'] });
      setShowProductSearch(false);
    },
  });

  const deactivateRecommendation = useMutation({
    mutationFn: (recommendationId: number) => apiRequest(`/api/supplement-recommendations/${recommendationId}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients', patientId, 'supplement-recommendations'] });
    },
  });

  const recommendations = recommendationsData?.recommendations || [];
  const totalMonthlyCost = recommendationsData?.totalMonthlyCost || 0;

  // Share functionality
  const generateShareableText = () => {
    if (!patient || recommendations.length === 0) return "";
    
    let shareText = `🏥 SUPPLEMENT RECOMMENDATIONS\n`;
    shareText += `Patient: ${patient.name}\n`;
    shareText += `Generated by: Health Platform\n\n`;
    
    shareText += `💊 RECOMMENDED SUPPLEMENTS:\n`;
    recommendations.forEach((rec, index) => {
      shareText += `${index + 1}. ${rec.productName}\n`;
      shareText += `   • Dosage: ${rec.dosage}\n`;
      shareText += `   • Frequency: ${rec.frequency}\n`;
      shareText += `   • Duration: ${rec.duration}\n`;
      shareText += `   • Reason: ${rec.reason}\n`;
      shareText += `   • Price: $${rec.price.toFixed(2)}/month\n`;
      shareText += `   • Thorne Link: ${rec.affiliateUrl}\n\n`;
    });
    
    shareText += `💰 TOTAL MONTHLY COST: $${totalMonthlyCost.toFixed(2)}\n\n`;
    shareText += `ℹ️ These recommendations are personalized based on the patient's health profile and should be reviewed with a healthcare provider before starting any new supplement regimen.\n\n`;
    shareText += `🔗 Visit our health platform for more personalized health insights.`;
    
    return shareText;
  };

  const generateShareableUrl = () => {
    const baseUrl = window.location.origin;
    const encodedText = encodeURIComponent(generateShareableText());
    return `${baseUrl}/share?content=${encodedText}&type=supplements&patient=${patient?.id}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateShareableText());
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareViaEmail = () => {
    const subject = `Supplement Recommendations for ${patient?.name}`;
    const body = encodeURIComponent(generateShareableText());
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${body}`);
  };

  const copyShareableLink = async () => {
    try {
      const shareUrl = generateShareableUrl();
      await navigator.clipboard.writeText(shareUrl);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (err) {
      console.error('Failed to copy link: ', err);
    }
  };



  // Auto-save affiliate settings if not already configured
  React.useEffect(() => {
    if (isProvider && !affiliateSettings?.settings?.thorneAffiliateId) {
      console.log("Auto-saving default affiliate settings...");
      saveAffiliateSettings.mutate({
        thorneAffiliateId: "PR115297",
        affiliateCode: "PR115297",
        practiceUrl: "https://www.thorne.com/u/PR115297",
        trackingEnabled: true,
      });
    }
  }, [isProvider, affiliateSettings, saveAffiliateSettings]);

  if (loadingRecommendations) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Supplement Recommendations (Loading...)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Supplement Recommendations
            </CardTitle>
            <CardDescription>
              Personalized Thorne supplement recommendations
            </CardDescription>
          </div>
          {isProvider && (
            <div className="flex gap-2">
              <Dialog open={showAffiliateSettings} onOpenChange={setShowAffiliateSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Thorne Affiliate Settings</DialogTitle>
                    <DialogDescription>
                      Configure your Thorne affiliate settings to generate personalized supplement recommendations.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Thorne Affiliate ID</label>
                      <Input 
                        placeholder="Your Thorne affiliate ID" 
                        {...affiliateForm.register("thorneAffiliateId")}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Affiliate Code</label>
                      <Input 
                        placeholder="Your affiliate tracking code" 
                        {...affiliateForm.register("affiliateCode")}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Practice URL</label>
                      <Input 
                        placeholder="https://yourpractice.com" 
                        {...affiliateForm.register("practiceUrl")}
                      />
                    </div>
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <label className="text-base font-medium">
                          Enable Tracking
                        </label>
                        <div className="text-sm text-muted-foreground">
                          Track affiliate commissions for supplement recommendations
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        {...affiliateForm.register("trackingEnabled")}
                        className="h-4 w-4"
                      />
                    </div>
                    <Button 
                      type="button" 
                      disabled={saveAffiliateSettings.isPending}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        console.log("Save button clicked");
                        
                        const formData = affiliateForm.getValues();
                        console.log("Form values:", formData);
                        console.log("Form errors:", affiliateForm.formState.errors);
                        
                        // Direct mutation without form submission
                        console.log("Calling mutation directly");
                        saveAffiliateSettings.mutate(formData);
                      }}
                    >
                      {saveAffiliateSettings.isPending ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {affiliateSettings?.settings && (
                <>
                  <Dialog open={showProductSearch} onOpenChange={setShowProductSearch}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Generate Recommendations
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Generate AI Supplement Recommendations</DialogTitle>
                        <DialogDescription>
                          Our AI will analyze {patient?.name}'s health profile and generate personalized supplement recommendations.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...recommendationForm}>
                        <form onSubmit={recommendationForm.handleSubmit((data) => generateRecommendations.mutate(data))} className="space-y-4">
                          <FormField
                            control={recommendationForm.control}
                            name="specificConcerns"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Specific Health Concerns (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Any specific health concerns or goals to focus on..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" disabled={generateRecommendations.isPending}>
                            {generateRecommendations.isPending ? "Generating..." : "Generate Recommendations"}
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>

                  {recommendations.length > 0 && (
                    <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Share Supplement Recommendations</DialogTitle>
                          <DialogDescription>
                            Share {patient?.name}'s supplement recommendations with colleagues or patients.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-3">
                            <Button onClick={copyToClipboard} className="w-full justify-start">
                              {copiedToClipboard ? (
                                <Check className="h-4 w-4 mr-2 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4 mr-2" />
                              )}
                              {copiedToClipboard ? "Copied!" : "Copy to Clipboard"}
                            </Button>
                            
                            <Button onClick={shareViaEmail} variant="outline" className="w-full justify-start">
                              <Mail className="h-4 w-4 mr-2" />
                              Share via Email
                            </Button>
                            
                            <Button onClick={copyShareableLink} variant="outline" className="w-full justify-start">
                              <Link2 className="h-4 w-4 mr-2" />
                              Copy Shareable Link
                            </Button>
                          </div>
                          
                          <div className="pt-4 border-t">
                            <Label className="text-sm font-medium">Preview:</Label>
                            <div className="mt-2 p-3 bg-gray-50 rounded-md max-h-32 overflow-y-auto text-xs">
                              {generateShareableText().substring(0, 200)}...
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Test Thorne Link - Always Visible */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Thorne Professional Access</h4>
          <a
            href="https://www.thorne.com/login"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-blue-300 w-fit"
          >
            <ExternalLink className="h-4 w-4" />
            Login to Thorne Professional Account
          </a>
          <p className="text-sm text-blue-600 mt-2">Access your professional account to manage supplement recommendations</p>
        </div>
        
        {!isProvider || !affiliateSettings?.settings ? (
          <Alert>
            <AlertDescription>
              {!isProvider 
                ? "Supplement recommendations are managed by your healthcare provider."
                : "Please configure your Thorne affiliate settings to generate supplement recommendations."
              }
            </AlertDescription>
          </Alert>
        ) : recommendations.length === 0 ? (
          <Alert>
            <AlertDescription>
              No supplement recommendations yet. Generate personalized recommendations based on the patient's health profile.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-green-800">Monthly Cost Summary</h3>
                <p className="text-sm text-green-600">Total estimated monthly cost for all supplements</p>
              </div>
              <div className="flex items-center gap-1 text-2xl font-bold text-green-800">
                <DollarSign className="h-6 w-6" />
                {totalMonthlyCost.toFixed(2)}
              </div>
            </div>

            <div className="grid gap-4">
              {recommendations.map((rec: SupplementRecommendation) => (
                <Card key={rec.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{rec.productName}</CardTitle>
                        <CardDescription>{rec.reason}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">${rec.price.toFixed(2)}/month</Badge>
                        {isProvider && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deactivateRecommendation.mutate(rec.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 text-sm">
                      <div><strong>Dosage:</strong> {rec.dosage}</div>
                      <div><strong>Frequency:</strong> {rec.frequency}</div>
                      <div><strong>Duration:</strong> {rec.duration}</div>
                      <div className="flex flex-col gap-2 mt-2">
                        {/* Working Thorne login link */}
                        <a
                          href="https://www.thorne.com/login"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-blue-300 w-fit"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Login to Thorne Professional Account
                        </a>
                        
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>💡 After logging in:</p>
                          <p>1. Search for "{rec.productName}"</p>
                          <p>2. Use your professional account's affiliate link</p>
                          <p>3. Access your dispensary tools for patient recommendations</p>
                          <p className="mt-2">
                            <strong>Direct URL:</strong> 
                            <span className="text-blue-600 font-mono text-xs">https://www.thorne.com/login</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}