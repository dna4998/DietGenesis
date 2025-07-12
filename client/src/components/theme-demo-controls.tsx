import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAdaptiveTheme } from "@/hooks/use-adaptive-theme";
import type { Patient } from "@/../../shared/schema";

interface ThemeDemoControlsProps {
  patient: Patient;
  onPatientUpdate: (updates: Partial<Patient>) => void;
}

export default function ThemeDemoControls({ patient, onPatientUpdate }: ThemeDemoControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const theme = useAdaptiveTheme(patient);

  const handleMetricChange = (field: keyof Patient, value: any) => {
    onPatientUpdate({ [field]: value });
  };

  if (!isExpanded) {
    return (
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: theme.primary }}
              />
              <span className="text-sm font-medium">Current Theme: {theme.statusColor}</span>
              <Badge variant="outline">Score: {theme.healthScore}/100</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
            >
              Adjust Health Metrics
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Theme Demo Controls</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            Minimize
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Weight */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Weight (lbs): {patient.weight || 'Not set'}</label>
            <Slider
              value={[patient.weight || 150]}
              onValueChange={([value]) => handleMetricChange('weight', value)}
              min={100}
              max={300}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>100</span>
              <span>300</span>
            </div>
          </div>

          {/* Body Fat */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Body Fat (%): {patient.bodyFat || 'Not set'}</label>
            <Slider
              value={[patient.bodyFat || 20]}
              onValueChange={([value]) => handleMetricChange('bodyFat', value)}
              min={5}
              max={50}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5%</span>
              <span>50%</span>
            </div>
          </div>

          {/* Blood Pressure */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Blood Pressure</label>
            <Select
              value={patient.bloodPressure || 'normal'}
              onValueChange={(value) => handleMetricChange('bloodPressure', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (Hypotension)</SelectItem>
                <SelectItem value="normal">Normal (120/80)</SelectItem>
                <SelectItem value="elevated">Elevated (120-129/80)</SelectItem>
                <SelectItem value="high-stage1">High Stage 1 (130-139/80-89)</SelectItem>
                <SelectItem value="high-stage2">High Stage 2 (140+/90+)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Insulin Resistance */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Insulin Resistance</label>
            <Select
              value={patient.insulinResistance || 'normal'}
              onValueChange={(value) => handleMetricChange('insulinResistance', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="mild">Mild</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Adherence */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Medication Adherence (%): {patient.adherence || 'Not set'}</label>
            <Slider
              value={[patient.adherence || 85]}
              onValueChange={([value]) => handleMetricChange('adherence', value)}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: theme.primary }}
              />
              <div>
                <p className="text-sm font-medium">Current Theme: {theme.statusColor.replace('-', ' ').toUpperCase()}</p>
                <p className="text-xs text-gray-600">Health Score: {theme.healthScore}/100</p>
              </div>
            </div>
            <Badge 
              variant={theme.statusColor === 'excellent' ? 'default' : 
                     theme.statusColor === 'good' ? 'secondary' : 
                     theme.statusColor === 'fair' ? 'outline' : 'destructive'}
            >
              {theme.statusMessage}
            </Badge>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          <p>💡 The app theme automatically adapts based on health metrics. Try adjusting the values above to see different color schemes!</p>
        </div>
      </CardContent>
    </Card>
  );
}