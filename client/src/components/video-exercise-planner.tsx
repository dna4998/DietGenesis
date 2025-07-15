import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Play, Clock, Target, Calendar, ExternalLink } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
// Type definitions for exercise planner
interface ExerciseVideo {
  name: string;
  description: string;
  duration: string;
  videoUrl: string;
  intensity: string;
  targetMuscles: string[];
  modifications: string[];
}

interface DailyExercise {
  day: string;
  type: string;
  duration: number;
  exercises: ExerciseVideo[];
  warmUp: ExerciseVideo;
  coolDown: ExerciseVideo;
  notes: string;
}

interface VideoExercisePlanResponse {
  plan: {
    summary: string;
    weeklyOverview: string;
    totalDuration: number;
    dailyPlans: DailyExercise[];
    progressionTips: string[];
    safetyGuidelines: string[];
    equipmentList: string[];
  };
}

interface VideoExercisePlannerProps {
  patientId: number;
}

export function VideoExercisePlanner({ patientId }: VideoExercisePlannerProps) {
  const [exercisePreferences, setExercisePreferences] = useState({
    goals: [] as string[],
    intensity: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    timePerSession: 30,
    availableEquipment: [] as string[],
    injuries: [] as string[],
    preferredTime: 'flexible' as 'morning' | 'afternoon' | 'evening' | 'flexible'
  });
  
  const [generatedPlan, setGeneratedPlan] = useState<VideoExercisePlanResponse | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generatePlanMutation = useMutation({
    mutationFn: async () => {
      if (exercisePreferences.goals.length === 0) {
        throw new Error('Please select at least one fitness goal');
      }
      
      return apiRequest(`/api/patients/${patientId}/generate-exercise-plan`, {
        method: 'POST',
        body: { exercisePreferences }
      });
    },
    onSuccess: (data) => {
      setGeneratedPlan(data);
      toast({
        title: "Exercise Plan Generated!",
        description: "Your 7-day exercise plan with video guides is ready.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/patients', patientId] });
    },
    onError: (error: any) => {
      if (error.message === 'AI_CREDITS_NEEDED') {
        toast({
          title: "AI Credits Required",
          description: "Please ensure you have sufficient AI credits to generate exercise plans.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: error.message || "Failed to generate exercise plan. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  const handleGoalChange = (goal: string, checked: boolean) => {
    setExercisePreferences(prev => ({
      ...prev,
      goals: checked 
        ? [...prev.goals, goal]
        : prev.goals.filter(g => g !== goal)
    }));
  };

  const handleEquipmentChange = (equipment: string, checked: boolean) => {
    setExercisePreferences(prev => ({
      ...prev,
      availableEquipment: checked 
        ? [...prev.availableEquipment, equipment]
        : prev.availableEquipment.filter(e => e !== equipment)
    }));
  };

  const VideoCard = ({ video, title }: { video: ExerciseVideo; title: string }) => (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">{title}</h4>
        <Badge variant="outline" className="text-xs">
          {video.intensity}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{video.name}</p>
      <p className="text-xs text-muted-foreground">{video.description}</p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        {video.duration}
        <Target className="h-3 w-3" />
        {video.targetMuscles.join(', ')}
      </div>
      <Button 
        size="sm" 
        variant="outline" 
        className="w-full"
        onClick={() => window.open(video.videoUrl, '_blank')}
      >
        <Play className="h-3 w-3 mr-1" />
        Watch Video
        <ExternalLink className="h-3 w-3 ml-1" />
      </Button>
    </div>
  );

  const DayCard = ({ day }: { day: DailyExercise }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{day.day}</CardTitle>
          <Badge variant={day.type === 'Rest Day' ? 'secondary' : 'default'}>
            {day.type}
          </Badge>
        </div>
        {day.duration > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {day.duration} minutes
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{day.notes}</p>
        
        {day.exercises.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <VideoCard video={day.warmUp} title="Warm-Up" />
              {day.exercises.map((exercise, idx) => (
                <VideoCard key={idx} video={exercise} title="Main Workout" />
              ))}
              <VideoCard video={day.coolDown} title="Cool-Down" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (generatedPlan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">7-Day Exercise Plan</h3>
          <Button 
            variant="outline" 
            onClick={() => setGeneratedPlan(null)}
          >
            Create New Plan
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Plan Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{generatedPlan.plan.summary}</p>
            <p className="text-sm">{generatedPlan.plan.weeklyOverview}</p>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{generatedPlan.plan.totalDuration} min/week</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>7 days</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <h4 className="font-medium">Equipment Needed:</h4>
              <div className="flex flex-wrap gap-2">
                {generatedPlan.plan.equipmentList.map((equipment, idx) => (
                  <Badge key={idx} variant="secondary">{equipment}</Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Safety Guidelines:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {generatedPlan.plan.safetyGuidelines.map((guideline, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    {guideline}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Progression Tips:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {generatedPlan.plan.progressionTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h4 className="font-medium">Daily Workout Schedule</h4>
          {generatedPlan.plan.dailyPlans.map((day, idx) => (
            <DayCard key={idx} day={day} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Generate 7-Day Exercise Plan
        </CardTitle>
        <CardDescription>
          Create a personalized workout plan with YouTube video guides based on your fitness goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Fitness Goals</Label>
            <p className="text-sm text-muted-foreground mb-3">Select your primary fitness objectives</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'weight_loss', label: 'Weight Loss', desc: 'Burn calories and reduce body fat' },
                { id: 'insulin_resistance', label: 'Insulin Resistance', desc: 'Improve glucose metabolism' },
                { id: 'resistance_training', label: 'Resistance Training', desc: 'Build and maintain muscle' },
                { id: 'stationary_bike', label: 'Stationary Bike', desc: 'Cycling-focused cardio workouts' }
              ].map((goal) => (
                <div key={goal.id} className="flex items-start space-x-2 p-3 border rounded-lg">
                  <Checkbox
                    id={goal.id}
                    checked={exercisePreferences.goals.includes(goal.id)}
                    onCheckedChange={(checked) => handleGoalChange(goal.id, checked as boolean)}
                  />
                  <div>
                    <Label htmlFor={goal.id} className="font-medium">{goal.label}</Label>
                    <p className="text-xs text-muted-foreground">{goal.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-medium">Intensity Level</Label>
            <Select value={exercisePreferences.intensity} onValueChange={(value: any) => 
              setExercisePreferences(prev => ({ ...prev, intensity: value }))
            }>
              <SelectTrigger className="w-full mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner - New to exercise</SelectItem>
                <SelectItem value="intermediate">Intermediate - Some experience</SelectItem>
                <SelectItem value="advanced">Advanced - Very experienced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-base font-medium">Session Duration</Label>
            <div className="mt-2 mb-2">
              <Slider
                value={[exercisePreferences.timePerSession]}
                onValueChange={(value) => 
                  setExercisePreferences(prev => ({ ...prev, timePerSession: value[0] }))
                }
                max={60}
                min={15}
                step={5}
                className="w-full"
              />
            </div>
            <p className="text-sm text-muted-foreground">{exercisePreferences.timePerSession} minutes per session</p>
          </div>

          <div>
            <Label className="text-base font-medium">Available Equipment</Label>
            <p className="text-sm text-muted-foreground mb-3">What equipment do you have access to?</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                'None (bodyweight only)',
                'Dumbbells',
                'Resistance bands',
                'Stationary bike',
                'Exercise mat',
                'Pull-up bar'
              ].map((equipment) => (
                <div key={equipment} className="flex items-center space-x-2">
                  <Checkbox
                    id={equipment}
                    checked={exercisePreferences.availableEquipment.includes(equipment)}
                    onCheckedChange={(checked) => handleEquipmentChange(equipment, checked as boolean)}
                  />
                  <Label htmlFor={equipment} className="text-sm">{equipment}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-medium">Preferred Workout Time</Label>
            <Select value={exercisePreferences.preferredTime} onValueChange={(value: any) => 
              setExercisePreferences(prev => ({ ...prev, preferredTime: value }))
            }>
              <SelectTrigger className="w-full mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={() => generatePlanMutation.mutate()}
          disabled={generatePlanMutation.isPending || exercisePreferences.goals.length === 0}
          className="w-full"
        >
          {generatePlanMutation.isPending ? 'Generating Exercise Plan...' : 'Generate 7-Day Exercise Plan'}
        </Button>
        
        {exercisePreferences.goals.length === 0 && (
          <p className="text-sm text-red-500 text-center">Please select at least one fitness goal</p>
        )}
      </CardContent>
    </Card>
  );
}