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

  const hasDietPlan = latestDietPlan || patient.dietPlan;

  // Sample meal options when no provider plan exists
  const sampleMeals = {
    breakfast: [
      { name: "Avocado & Spinach Omelet", description: "Protein-rich start with healthy fats", calories: "320 cal" },
      { name: "Greek Yogurt Berry Bowl", description: "Probiotic-rich with antioxidants", calories: "280 cal" },
      { name: "Almond Flour Pancakes", description: "Low-carb alternative with berries", calories: "250 cal" }
    ],
    lunch: [
      { name: "Grilled Chicken Salad", description: "Lean protein with mixed greens", calories: "400 cal" },
      { name: "Salmon & Quinoa Bowl", description: "Omega-3 rich with complete protein", calories: "450 cal" },
      { name: "Turkey Lettuce Wraps", description: "Light, refreshing, and satisfying", calories: "300 cal" }
    ],
    dinner: [
      { name: "Herb-Crusted Cod", description: "Light fish with roasted vegetables", calories: "380 cal" },
      { name: "Lean Beef Stir-Fry", description: "Protein with colorful vegetables", calories: "420 cal" },
      { name: "Zucchini Noodle Bolognese", description: "Low-carb pasta alternative", calories: "350 cal" }
    ]
  };

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
      <CardContent className="space-y-6">
        {latestDietPlan ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-gray-700 text-sm leading-relaxed mb-3">
              {latestDietPlan.content.split('\n\n')[1] || "Your personalized diet plan has been created by your provider."}
            </p>
            <Button 
              onClick={() => window.open(latestDietPlan.fileUrl, '_blank')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Complete Diet Plan PDF
            </Button>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-700 text-sm leading-relaxed">
              No custom diet plan assigned yet. Your provider will create a personalized plan based on your health profile. Below are sample meal ideas based on general nutritional guidelines.
            </p>
          </div>
        )}

        {/* Breakfast Section */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 flex items-center">
            🍳 Breakfast Options
          </h4>
          <div className="grid gap-3">
            {sampleMeals.breakfast.map((meal, index) => (
              <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-gray-900 text-sm">{meal.name}</h5>
                    <p className="text-gray-600 text-xs mt-1">{meal.description}</p>
                  </div>
                  <span className="text-orange-600 text-xs font-medium">{meal.calories}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lunch Section */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 flex items-center">
            🥗 Lunch Options
          </h4>
          <div className="grid gap-3">
            {sampleMeals.lunch.map((meal, index) => (
              <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-gray-900 text-sm">{meal.name}</h5>
                    <p className="text-gray-600 text-xs mt-1">{meal.description}</p>
                  </div>
                  <span className="text-yellow-600 text-xs font-medium">{meal.calories}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dinner Section */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 flex items-center">
            🍽️ Dinner Options
          </h4>
          <div className="grid gap-3">
            {sampleMeals.dinner.map((meal, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-gray-900 text-sm">{meal.name}</h5>
                    <p className="text-gray-600 text-xs mt-1">{meal.description}</p>
                  </div>
                  <span className="text-blue-600 text-xs font-medium">{meal.calories}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nutritional Guidelines */}
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900">Daily Guidelines:</h4>
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
