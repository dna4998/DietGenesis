import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Patient } from "@shared/schema";

interface DietPlanCardProps {
  patient: Patient;
}

interface Message {
  id: number;
  patientId: number;
  providerId: number;
  content: string;
  messageType: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
  isRead: boolean;
}

export default function DietPlanCard({ patient }: DietPlanCardProps) {
  // Fetch messages to find the latest diet plan
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['/api/patients', patient.id, 'messages'],
    refetchInterval: 30000,
  });

  // Find the latest diet plan message from provider
  const latestDietPlan = messages
    .filter(msg => msg.content.includes('Diet Plan') && msg.messageType === 'pdf')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  const dietPlanContent = latestDietPlan ? 
    latestDietPlan.content.split('\n\n')[1] || "Your personalized diet plan has been created by your provider." :
    patient.dietPlan || "No custom diet plan assigned yet. Your provider will create a personalized plan based on your health profile.";

  const hasDietPlan = latestDietPlan || patient.dietPlan;

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Custom Diet Plan</CardTitle>
          <Badge className={`text-xs font-medium ${hasDietPlan ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            {hasDietPlan ? 'Active' : 'Pending'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`border rounded-lg p-4 mb-4 ${hasDietPlan ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          <p className="text-gray-700 text-sm leading-relaxed">{dietPlanContent}</p>
        </div>
        
        {latestDietPlan && latestDietPlan.fileUrl && (
          <div className="mb-4">
            <Button 
              onClick={() => window.open(latestDietPlan.fileUrl, '_blank')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Complete Diet Plan PDF
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Nutritional Guidelines:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Maintain 20-30g net carbs daily</li>
            <li>• Consume 1.2g protein per kg body weight</li>
            <li>• Include healthy fats: avocado, olive oil, nuts</li>
            <li>• Hydrate with 8-10 glasses of water daily</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
