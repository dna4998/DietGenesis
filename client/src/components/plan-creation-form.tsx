import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import type { Patient } from "@shared/schema";

interface PlanCreationFormProps {
  patient: Patient;
  onSave: (planData: {
    dietPlan: string;
    exercisePlan: string;
    supplements: string[];
    glp1Prescription: string;
  }) => void;
  onCancel: () => void;
}

export default function PlanCreationForm({ patient, onSave, onCancel }: PlanCreationFormProps) {
  const [formData, setFormData] = useState({
    dietPlan: patient.dietPlan || "",
    exercisePlan: patient.exercisePlan || "",
    supplements: patient.supplements?.join(", ") || "",
    glp1Prescription: patient.glp1Prescription || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      dietPlan: formData.dietPlan,
      exercisePlan: formData.exercisePlan,
      supplements: formData.supplements.split(",").map(s => s.trim()).filter(s => s),
      glp1Prescription: formData.glp1Prescription,
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-screen overflow-y-auto">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Update Plans for {patient.name}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="dietPlan" className="text-sm font-medium text-gray-700">
                Diet Plan
              </Label>
              <Textarea
                id="dietPlan"
                className="mt-2"
                rows={3}
                placeholder="Enter detailed diet plan recommendations..."
                value={formData.dietPlan}
                onChange={(e) => setFormData({...formData, dietPlan: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="exercisePlan" className="text-sm font-medium text-gray-700">
                Exercise Plan
              </Label>
              <Textarea
                id="exercisePlan"
                className="mt-2"
                rows={3}
                placeholder="Enter exercise plan with frequency and intensity..."
                value={formData.exercisePlan}
                onChange={(e) => setFormData({...formData, exercisePlan: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="supplements" className="text-sm font-medium text-gray-700">
                Supplements (comma-separated)
              </Label>
              <Input
                id="supplements"
                className="mt-2"
                placeholder="Omega-3, Vitamin D3, Probiotics..."
                value={formData.supplements}
                onChange={(e) => setFormData({...formData, supplements: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="glp1Prescription" className="text-sm font-medium text-gray-700">
                GLP-1 Prescription (if applicable)
              </Label>
              <Input
                id="glp1Prescription"
                className="mt-2"
                placeholder="e.g., Semaglutide 0.25mg weekly"
                value={formData.glp1Prescription}
                onChange={(e) => setFormData({...formData, glp1Prescription: e.target.value})}
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-medical-blue text-white hover:bg-blue-700"
              >
                Save Plans
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
