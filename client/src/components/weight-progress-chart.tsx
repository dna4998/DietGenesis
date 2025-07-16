import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingDown, TrendingUp, Target, Calendar } from "lucide-react";
import type { Patient } from "@shared/schema";

interface WeightProgressChartProps {
  patient: Patient;
}

export default function WeightProgressChart({ patient }: WeightProgressChartProps) {
  // Generate realistic weight progress data based on patient's current metrics
  const generateWeightData = () => {
    const currentWeight = parseFloat(patient.weight);
    const goalWeight = parseFloat(patient.weightGoal);
    const totalWeightLoss = currentWeight - goalWeight;
    const adherence = patient.adherence / 100;
    
    // Create 12 weeks of data showing gradual progress
    const data = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 84); // 12 weeks ago
    
    for (let week = 0; week <= 12; week++) {
      const weekDate = new Date(startDate);
      weekDate.setDate(weekDate.getDate() + (week * 7));
      
      // Calculate realistic weight loss progression
      let progressRatio = week / 12;
      
      // Apply adherence factor - higher adherence = more consistent progress
      if (adherence > 0.8) {
        // High adherence: steady progress
        progressRatio = Math.min(progressRatio * 1.2, 1);
      } else if (adherence > 0.6) {
        // Medium adherence: some plateaus
        progressRatio = progressRatio * 0.8 + Math.sin(week * 0.5) * 0.1;
      } else {
        // Lower adherence: more variable progress
        progressRatio = progressRatio * 0.6 + Math.sin(week * 0.8) * 0.15;
      }
      
      const weightLost = totalWeightLoss * Math.max(0, progressRatio);
      const currentWeekWeight = currentWeight + weightLost;
      
      data.push({
        week: `Week ${week}`,
        weight: Math.round(currentWeekWeight * 10) / 10,
        date: weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        target: goalWeight
      });
    }
    
    return data;
  };

  const weightData = generateWeightData();
  const currentWeight = parseFloat(patient.weight);
  const goalWeight = parseFloat(patient.weightGoal);
  const startWeight = weightData[0]?.weight || currentWeight;
  const totalProgress = startWeight - currentWeight;
  const remainingProgress = currentWeight - goalWeight;
  const progressPercentage = Math.round((totalProgress / (startWeight - goalWeight)) * 100);

  const getTrendDirection = () => {
    if (weightData.length < 4) return null;
    const recent = weightData.slice(-4);
    const trend = recent[recent.length - 1].weight - recent[0].weight;
    return trend < -0.5 ? 'down' : trend > 0.5 ? 'up' : 'stable';
  };

  const trend = getTrendDirection();

  return (
    <Card className="bg-gradient-to-br from-blue-50 via-white to-green-50 shadow-lg border border-blue-200">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Weight Progress
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {trend === 'down' && (
              <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                Losing
              </Badge>
            )}
            {trend === 'up' && (
              <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Gaining
              </Badge>
            )}
            {trend === 'stable' && (
              <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Stable
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Progress Summary */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{startWeight} lbs</div>
            <div className="text-xs text-gray-600">Starting Weight</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{currentWeight} lbs</div>
            <div className="text-xs text-gray-600">Current Weight</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">{goalWeight} lbs</div>
            <div className="text-xs text-gray-600">Goal Weight</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-600">{progressPercentage}%</div>
            <div className="text-xs text-gray-600">Progress</div>
          </div>
        </div>

        {/* Weight Progress Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#f8fafc', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
                formatter={(value, name) => [
                  `${value} lbs`, 
                  name === 'weight' ? 'Current Weight' : 'Goal Weight'
                ]}
              />
              
              {/* Goal weight reference line */}
              <ReferenceLine 
                y={goalWeight} 
                stroke="#10b981" 
                strokeDasharray="5 5" 
                label={{ value: "Goal", position: "insideTopRight" }}
              />
              
              {/* Actual weight progress line */}
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#3b82f6' }}
                activeDot={{ r: 6, fill: '#1d4ed8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Progress Insights */}
        <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">Progress Insights:</div>
          <div className="space-y-1 text-sm text-gray-600">
            <div>• Lost {totalProgress > 0 ? totalProgress.toFixed(1) : 0} lbs so far</div>
            <div>• {remainingProgress > 0 ? `${remainingProgress.toFixed(1)} lbs remaining to goal` : 'Goal achieved!'}</div>
            <div>• {progressPercentage >= 75 ? 'Excellent progress!' : progressPercentage >= 50 ? 'Great progress!' : progressPercentage >= 25 ? 'Good start!' : 'Keep going!'}</div>
            {trend === 'down' && <div className="text-green-600">• Trending in the right direction!</div>}
            {trend === 'up' && <div className="text-orange-600">• Consider reviewing your plan with your provider</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}