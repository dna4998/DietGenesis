import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Send, TrendingUp, Upload, Utensils, Play } from "lucide-react";
import SendMessageModal from "@/components/send-message-modal";
import MedicalDocumentUpload from "@/components/medical-document-upload";
import DietPlanGenerator from "@/components/diet-plan-generator";
import { VideoExercisePlanner } from "@/components/video-exercise-planner";
import type { Patient } from "@shared/schema";
import { useState } from "react";

interface ProviderPatientCardProps {
  patient: Patient;
  onUpdate: (patient: Patient) => void;
  onAIAnalysis: (patient: Patient) => void;
  onHealthPrediction: (patient: Patient) => void;
}

export default function ProviderPatientCard({ patient, onUpdate, onAIAnalysis, onHealthPrediction }: ProviderPatientCardProps) {
  const [lastClicked, setLastClicked] = useState<string | null>(null);
  const [showDietPlanGenerator, setShowDietPlanGenerator] = useState(false);
  const [showExercisePlanner, setShowExercisePlanner] = useState(false);
  
  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="p-6">
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
          <button
            className="flex-1 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors font-medium"
            onClick={() => onUpdate(patient)}
          >
            Update Plans
          </button>
          <SendMessageModal 
            patient={patient} 
            providerId={1}
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="px-3"
                title="Send Message"
                onClick={() => console.log("Send message clicked for:", patient.name)}
              >
                <Send className="w-4 h-4" />
              </Button>
            }
          />
          <MedicalDocumentUpload 
            patient={patient} 
            providerId={1}
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="px-3"
                title="Upload Medical Document"
              >
                <Upload className="w-4 h-4" />
              </Button>
            }
          />
          <button
            className="border border-gray-300 hover:bg-gray-50 px-3 py-2 rounded-md transition-colors"
            onClick={() => onAIAnalysis(patient)}
            title="AI Plan Generator"
          >
            <Brain className="w-4 h-4" />
          </button>
          <button
            className="border border-gray-300 hover:bg-gray-50 px-3 py-2 rounded-md transition-colors"
            onClick={() => onHealthPrediction(patient)}
            title="Health Trend Prediction"
          >
            <TrendingUp className="w-4 h-4" />
          </button>
          <button
            className="border border-gray-300 hover:bg-gray-50 px-3 py-2 rounded-md transition-colors"
            onClick={() => setShowDietPlanGenerator(true)}
            title="Generate 30-Day Diet Plan"
          >
            <Utensils className="w-4 h-4" />
          </button>
          <button
            className="border border-gray-300 hover:bg-gray-50 px-3 py-2 rounded-md transition-colors"
            onClick={() => setShowExercisePlanner(true)}
            title="Generate 7-Day Exercise Plan"
          >
            <Play className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {showDietPlanGenerator && (
        <DietPlanGenerator
          patient={patient}
          onClose={() => setShowDietPlanGenerator(false)}
        />
      )}
      
      {showExercisePlanner && (
        <div className="border-t border-gray-200 p-6">
          <VideoExercisePlanner patientId={patient.id} />
          <Button 
            variant="outline" 
            onClick={() => setShowExercisePlanner(false)}
            className="mt-4"
          >
            Close Exercise Planner
          </Button>
        </div>
      )}
    </div>
  );
}
