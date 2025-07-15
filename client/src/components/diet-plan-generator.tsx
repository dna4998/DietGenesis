import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Utensils,
  Coffee,
  Sun,
  Moon,
  FileText,
  Download,
  Send,
  Loader2,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Patient } from "@shared/schema";

interface DietPlanGeneratorProps {
  patient: Patient;
  onClose: () => void;
}

const guidelinesSchema = z.object({
  dietaryRestrictions: z.string().min(1, "Please specify dietary restrictions"),
  preferredFoods: z.string().min(1, "Please specify preferred foods"),
  foodsToAvoid: z.string().min(1, "Please specify foods to avoid"),
  mealTimingPreferences: z.string().min(1, "Please specify meal timing preferences"),
  cookingPreferences: z.string().min(1, "Please specify cooking preferences"),
  budgetConsiderations: z.string().optional(),
  specialInstructions: z.string().optional(),
});

type GuidelinesForm = z.infer<typeof guidelinesSchema>;

export default function DietPlanGenerator({ patient, onClose }: DietPlanGeneratorProps) {
  const [step, setStep] = useState<'guidelines' | 'generating' | 'complete'>('guidelines');
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<GuidelinesForm>({
    resolver: zodResolver(guidelinesSchema),
    defaultValues: {
      dietaryRestrictions: "",
      preferredFoods: "",
      foodsToAvoid: "",
      mealTimingPreferences: "",
      cookingPreferences: "",
      budgetConsiderations: "",
      specialInstructions: "",
    },
  });

  const generatePlanMutation = useMutation({
    mutationFn: async (guidelines: GuidelinesForm) => {
      const response = await apiRequest("POST", `/api/patients/${patient.id}/generate-diet-plan`, {
        guidelines,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedPlan(data.plan);
      setPdfUrl(data.pdfUrl);
      setStep('complete');
      toast({ title: "30-day diet plan generated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to generate diet plan", variant: "destructive" });
      setStep('guidelines');
    },
  });

  const sendPlanMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/patients/${patient.id}/send-diet-plan`, {
        pdfUrl,
        planSummary: generatedPlan?.summary || "30-day personalized diet plan",
      });
    },
    onSuccess: () => {
      toast({ title: "Diet plan sent to patient successfully!" });
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to send diet plan", variant: "destructive" });
    },
  });

  const onSubmit = (data: GuidelinesForm) => {
    setStep('generating');
    generatePlanMutation.mutate(data);
  };

  const downloadPdf = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="h-6 w-6 text-green-600" />
            30-Day Diet Plan Generator
          </DialogTitle>
        </DialogHeader>

        {step === 'guidelines' && (
          <div className="space-y-6">
            <p className="text-sm text-gray-600">
              Provide detailed guidelines to generate a comprehensive 30-day meal plan for {patient.name}
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dietaryRestrictions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dietary Restrictions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Gluten-free, dairy-free, vegetarian, keto, low-carb..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredFoods"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Foods</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Lean proteins, leafy greens, nuts, fish, berries..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="foodsToAvoid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Foods to Avoid</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Processed foods, sugar, refined carbs, specific allergens..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mealTimingPreferences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meal Timing Preferences</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Intermittent fasting 16:8, 3 meals + 2 snacks, early dinner..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cookingPreferences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cooking Preferences</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Quick 30-min meals, batch cooking, meal prep, raw foods..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budgetConsiderations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Considerations (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Budget-friendly options, seasonal produce, bulk buying..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="specialInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Instructions (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional instructions, medical considerations, or specific goals..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  Generate 30-Day Diet Plan
                </Button>
              </form>
            </Form>
          </div>
        )}

        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-green-600" />
            <h3 className="text-lg font-semibold">Generating Your 30-Day Diet Plan</h3>
            <p className="text-sm text-gray-600 text-center max-w-md">
              Our AI is creating a personalized meal plan with 30 breakfast, 30 lunch, and 30 dinner recipes
              based on your guidelines and the patient's health profile. This may take a few moments...
            </p>
          </div>
        )}

        {step === 'complete' && generatedPlan && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <h3 className="font-semibold">30-Day Diet Plan Generated Successfully!</h3>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Plan Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Coffee className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">Breakfast Options:</span>
                    <Badge variant="outline">{generatedPlan.breakfastCount || 30} recipes</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">Lunch Options:</span>
                    <Badge variant="outline">{generatedPlan.lunchCount || 30} recipes</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Dinner Options:</span>
                    <Badge variant="outline">{generatedPlan.dinnerCount || 30} recipes</Badge>
                  </div>
                </div>
                
                {generatedPlan.summary && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">{generatedPlan.summary}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={downloadPdf}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
              
              <Button
                onClick={() => sendPlanMutation.mutate()}
                disabled={sendPlanMutation.isPending}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4" />
                {sendPlanMutation.isPending ? "Sending..." : "Send to Patient"}
              </Button>
              
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}