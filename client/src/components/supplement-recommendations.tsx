import { useState } from "react";
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
import { Pill, DollarSign, ExternalLink, Settings, Search, Plus, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const affiliateSettingsSchema = z.object({
  thorneAffiliateId: z.string().min(1, "Affiliate ID is required"),
  affiliateCode: z.string().min(1, "Affiliate code is required"),
  practiceUrl: z.string().url("Must be a valid URL"),
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
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAffiliateSettings, setShowAffiliateSettings] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(false);

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
      thorneAffiliateId: "",
      affiliateCode: "",
      practiceUrl: "",
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
    mutationFn: (data: any) => apiRequest('/api/provider/affiliate-settings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/provider/affiliate-settings'] });
      setShowAffiliateSettings(false);
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

  if (loadingRecommendations) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Supplement Recommendations
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
                  <Form {...affiliateForm}>
                    <form onSubmit={affiliateForm.handleSubmit((data) => saveAffiliateSettings.mutate(data))} className="space-y-4">
                      <FormField
                        control={affiliateForm.control}
                        name="thorneAffiliateId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Thorne Affiliate ID</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Thorne affiliate ID" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={affiliateForm.control}
                        name="affiliateCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Affiliate Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Your affiliate tracking code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={affiliateForm.control}
                        name="practiceUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Practice URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://yourpractice.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={saveAffiliateSettings.isPending}>
                        {saveAffiliateSettings.isPending ? "Saving..." : "Save Settings"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              {affiliateSettings?.settings && (
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
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-fit mt-2"
                        onClick={() => window.open(rec.affiliateUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on Thorne.com
                      </Button>
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