import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar, Heart, Activity, Droplets, Moon, Target, Plus, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const dailyMetricsSchema = z.object({
  weight: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  bloodPressureSystolic: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  bloodPressureDiastolic: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  bloodSugar: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  bodyFat: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  waistCircumference: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  heartRate: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  sleepHours: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  stepsCount: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  waterIntake: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  mood: z.string().optional(),
  energyLevel: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  notes: z.string().optional(),
});

type DailyMetricsForm = z.infer<typeof dailyMetricsSchema>;

interface DailyMetricsInputProps {
  patientId: number;
  triggerButton?: React.ReactNode;
}

export default function DailyMetricsInput({ patientId, triggerButton }: DailyMetricsInputProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<DailyMetricsForm>({
    resolver: zodResolver(dailyMetricsSchema),
    defaultValues: {
      weight: "",
      bloodPressureSystolic: "",
      bloodPressureDiastolic: "",
      bloodSugar: "",
      bodyFat: "",
      waistCircumference: "",
      heartRate: "",
      sleepHours: "",
      stepsCount: "",
      waterIntake: "",
      mood: "",
      energyLevel: "",
      notes: "",
    },
  });

  const saveDailyMetrics = useMutation({
    mutationFn: async (data: DailyMetricsForm) => {
      const metricsData = {
        patientId,
        date: new Date().toISOString(),
        ...data,
      };
      return apiRequest(`/api/patients/${patientId}/daily-metrics`, {
        method: 'POST',
        body: JSON.stringify(metricsData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Daily metrics saved!",
        description: "Your health data has been recorded successfully.",
      });
      form.reset();
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/patients', patientId] });
      queryClient.invalidateQueries({ queryKey: ['/api/patients', patientId, 'daily-metrics'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error saving metrics",
        description: error?.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: DailyMetricsForm) => {
    // Filter out empty values
    const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== "" && value !== undefined && value !== null) {
        acc[key as keyof DailyMetricsForm] = value;
      }
      return acc;
    }, {} as Partial<DailyMetricsForm>);

    if (Object.keys(filteredData).length === 0) {
      toast({
        title: "No data to save",
        description: "Please enter at least one health metric.",
        variant: "destructive",
      });
      return;
    }

    saveDailyMetrics.mutate(filteredData);
  };

  const defaultTrigger = (
    <Button variant="outline" className="w-full">
      <Plus className="h-4 w-4 mr-2" />
      Add Today's Metrics
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Daily Health Metrics
          </DialogTitle>
          <DialogDescription>
            Track your daily health data. Only fill in the metrics you have available today.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Weight and Body Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-600" />
                  Body Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (lbs)</FormLabel>
                      <FormControl>
                        <Input placeholder="150.5" type="number" step="0.1" {...field} />
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
                        <Input placeholder="18.5" type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="waistCircumference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waist (inches)</FormLabel>
                      <FormControl>
                        <Input placeholder="32.0" type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Vital Signs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-600" />
                  Vital Signs
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Blood Pressure</Label>
                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="bloodPressureSystolic"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="120" type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <span className="self-center text-gray-500">/</span>
                    <FormField
                      control={form.control}
                      name="bloodPressureDiastolic"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="80" type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="heartRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heart Rate (bpm)</FormLabel>
                      <FormControl>
                        <Input placeholder="70" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bloodSugar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Sugar (mg/dL)</FormLabel>
                      <FormControl>
                        <Input placeholder="95" type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Lifestyle Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  Lifestyle & Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="sleepHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Moon className="h-3 w-3" />
                        Sleep (hours)
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="8.0" type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stepsCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Steps</FormLabel>
                      <FormControl>
                        <Input placeholder="10000" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="waterIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Droplets className="h-3 w-3" />
                        Water (ounces)
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="64" type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Wellness Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Wellness & Mood</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="mood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mood</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your mood" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="excellent">😄 Excellent</SelectItem>
                          <SelectItem value="good">😊 Good</SelectItem>
                          <SelectItem value="fair">😐 Fair</SelectItem>
                          <SelectItem value="poor">😞 Poor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="energyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Energy Level (1-10)</FormLabel>
                      <FormControl>
                        <Input placeholder="7" type="number" min="1" max="10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional observations about your health today..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveDailyMetrics.isPending}>
                {saveDailyMetrics.isPending ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Metrics
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}