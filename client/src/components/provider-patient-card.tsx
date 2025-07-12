import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Send, TrendingUp } from "lucide-react";
import SendMessageModal from "@/components/send-message-modal";
import type { Patient } from "@shared/schema";

interface ProviderPatientCardProps {
  patient: Patient;
  onUpdate: (patient: Patient) => void;
  onAIAnalysis: (patient: Patient) => void;
  onHealthPrediction: (patient: Patient) => void;
}

export default function ProviderPatientCard({ patient, onUpdate, onAIAnalysis, onHealthPrediction }: ProviderPatientCardProps) {
  return (
    <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{patient.name}</h3>
            <p className="text-gray-600">{patient.email}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Last Visit</div>
            <div className="font-medium">{patient.lastVisit}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-medical-blue">{patient.weight} lbs</div>
            <div className="text-xs text-gray-600">Weight</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-health-green">{patient.bodyFat}%</div>
            <div className="text-xs text-gray-600">Body Fat</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">{patient.adherence}%</div>
            <div className="text-xs text-gray-600">Adherence</div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="text-sm">
            <span className="font-medium text-gray-700">Current Diet:</span>
            <span className="text-gray-600 ml-2">{patient.dietPlan || "No plan assigned"}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-700">Exercise:</span>
            <span className="text-gray-600 ml-2">{patient.exercisePlan || "No plan assigned"}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1 bg-medical-blue text-white hover:bg-blue-700"
            onClick={() => onUpdate(patient)}
          >
            Update Plans
          </Button>
          <SendMessageModal 
            patient={patient} 
            providerId={1}
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="px-3"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </Button>
            }
          />
          <Button
            variant="outline"
            size="sm"
            className="px-3"
            onClick={() => onAIAnalysis(patient)}
            title="AI Plan Generator"
          >
            <Brain className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="px-3"
            onClick={() => onHealthPrediction(patient)}
            title="Health Trend Prediction"
          >
            <TrendingUp className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
