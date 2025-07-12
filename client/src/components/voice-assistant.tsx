import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, Brain, MessageCircle, Settings } from 'lucide-react';
import VoiceSettings from '@/components/voice-settings';
import VoiceVisualization from '@/components/voice-visualization';
import { useVoiceRecognition } from '@/hooks/use-voice-recognition';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import { useToast } from '@/hooks/use-toast';
import type { Patient } from '@shared/schema';

interface VoiceAssistantProps {
  patient: Patient;
}

interface VoiceCommand {
  patterns: RegExp[];
  handler: (patient: Patient) => string;
  description: string;
}

export default function VoiceAssistant({ patient }: VoiceAssistantProps) {
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: 'user' | 'assistant';
    text: string;
    timestamp: Date;
  }>>([]);
  
  const voiceRecognition = useVoiceRecognition();
  const textToSpeech = useTextToSpeech();
  const { toast } = useToast();

  // Voice commands configuration
  const voiceCommands: VoiceCommand[] = [
    {
      patterns: [
        /how.*weight/i,
        /current.*weight/i,
        /what.*weight/i
      ],
      handler: (patient) => `Your current weight is ${patient.weight} pounds. Your goal is ${patient.weightGoal} pounds, so you have ${patient.weight - patient.weightGoal} pounds to go.`,
      description: "Ask about weight"
    },
    {
      patterns: [
        /progress/i,
        /how.*doing/i,
        /weight.*loss/i
      ],
      handler: (patient) => `You've lost ${patient.weightLoss} pounds so far and your plan adherence is ${patient.adherence}%. ${patient.adherence >= 80 ? "Great job staying on track!" : "Consider reviewing your plan to improve adherence."}`,
      description: "Check progress"
    },
    {
      patterns: [
        /body.*fat/i,
        /fat.*percentage/i
      ],
      handler: (patient) => `Your current body fat is ${patient.bodyFat}% and your goal is ${patient.bodyFatGoal}%. You need to reduce it by ${patient.bodyFat - patient.bodyFatGoal} percentage points.`,
      description: "Body fat information"
    },
    {
      patterns: [
        /diet.*plan/i,
        /what.*eat/i,
        /meal.*plan/i
      ],
      handler: (patient) => patient.dietPlan ? `Your current diet plan is: ${patient.dietPlan}` : "You don't have a diet plan assigned yet. Contact your healthcare provider to get a personalized plan.",
      description: "Diet plan details"
    },
    {
      patterns: [
        /exercise/i,
        /workout/i,
        /fitness/i
      ],
      handler: (patient) => patient.exercisePlan ? `Your exercise plan includes: ${patient.exercisePlan}` : "You don't have an exercise plan assigned yet. Contact your healthcare provider for a personalized fitness routine.",
      description: "Exercise plan"
    },
    {
      patterns: [
        /supplement/i,
        /vitamin/i,
        /pills/i
      ],
      handler: (patient) => {
        if (patient.supplements && patient.supplements.length > 0) {
          return `You're taking these supplements: ${patient.supplements.join(', ')}. Remember to take them as directed.`;
        }
        return "You don't have any supplements assigned yet. Your healthcare provider may recommend some based on your health assessment.";
      },
      description: "Supplement information"
    },
    {
      patterns: [
        /blood.*pressure/i,
        /bp/i,
        /hypertension/i
      ],
      handler: (patient) => `Your blood pressure reading is ${patient.bloodPressure}. ${patient.bloodPressure === 'High' ? 'Continue monitoring and follow your healthcare provider recommendations.' : 'Keep up the good work maintaining healthy blood pressure.'}`,
      description: "Blood pressure status"
    },
    {
      patterns: [
        /blood.*sugar/i,
        /glucose/i,
        /diabetes/i
      ],
      handler: (patient) => `Your blood sugar level is ${patient.bloodSugar}. ${patient.bloodSugar === 'High' ? 'Focus on your diet plan and monitor regularly.' : 'Great job maintaining healthy blood sugar levels.'}`,
      description: "Blood sugar information"
    },
    {
      patterns: [
        /insulin.*resistance/i,
        /insulin/i,
        /metabolic/i
      ],
      handler: (patient) => patient.insulinResistance ? 
        "You have insulin resistance. Focus on low-glycemic foods, regular exercise, and following your meal timing recommendations." :
        "You don't currently show signs of insulin resistance. Keep maintaining your healthy lifestyle.",
      description: "Insulin resistance status"
    },
    {
      patterns: [
        /help/i,
        /what.*can.*do/i,
        /commands/i
      ],
      handler: () => "I can help you with information about your weight, progress, body fat, diet plan, exercise routine, supplements, blood pressure, blood sugar, and insulin resistance. Just ask me naturally!",
      description: "Available commands"
    }
  ];

  // Process voice command
  const processVoiceCommand = (transcript: string): string => {
    const normalizedTranscript = transcript.toLowerCase().trim();
    
    for (const command of voiceCommands) {
      for (const pattern of command.patterns) {
        if (pattern.test(normalizedTranscript)) {
          return command.handler(patient);
        }
      }
    }
    
    return "I'm sorry, I didn't understand that. Try asking about your weight, progress, diet plan, exercise routine, or say 'help' to see what I can do.";
  };

  // Handle voice input
  useEffect(() => {
    if (voiceRecognition.transcript && !voiceRecognition.isListening) {
      const userMessage = voiceRecognition.transcript;
      const response = processVoiceCommand(userMessage);
      
      // Add to conversation history
      setConversationHistory(prev => [
        ...prev,
        { type: 'user', text: userMessage, timestamp: new Date() },
        { type: 'assistant', text: response, timestamp: new Date() }
      ]);
      
      // Speak the response
      textToSpeech.speak(response);
      
      // Reset transcript
      voiceRecognition.resetTranscript();
    }
  }, [voiceRecognition.transcript, voiceRecognition.isListening, textToSpeech, patient]);

  const handleVoiceToggle = () => {
    if (!voiceRecognition.isSupported) {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition. Try using Chrome or Safari.",
        variant: "destructive"
      });
      return;
    }

    // Check for HTTPS requirement
    if (!window.isSecureContext) {
      toast({
        title: "Secure Connection Required",
        description: "Voice recognition requires HTTPS. Please access the app via a secure connection.",
        variant: "destructive"
      });
      return;
    }

    if (voiceRecognition.isListening) {
      voiceRecognition.stopListening();
    } else {
      // Request microphone permission first
      navigator.mediaDevices?.getUserMedia({ audio: true })
        .then(() => {
          voiceRecognition.startListening();
        })
        .catch((error) => {
          console.error('Microphone permission denied:', error);
          toast({
            title: "Microphone Access Required",
            description: "Please allow microphone access to use voice commands.",
            variant: "destructive"
          });
        });
    }
  };

  const handleSpeechToggle = () => {
    if (textToSpeech.isSpeaking) {
      textToSpeech.cancel();
    } else if (!textToSpeech.isSupported) {
      toast({
        title: "Text-to-Speech Not Supported",
        description: "Your browser doesn't support text-to-speech features.",
        variant: "destructive"
      });
    }
  };

  const startDemo = () => {
    const demoMessage = `Hello ${patient.name}! I'm your voice-activated health assistant. You can ask me about your weight, progress, diet plan, exercise routine, supplements, and more. Just click the microphone and start talking!`;
    textToSpeech.speak(demoMessage);
    
    setConversationHistory(prev => [
      ...prev,
      { type: 'assistant', text: demoMessage, timestamp: new Date() }
    ]);
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            Voice Health Assistant
          </CardTitle>
          <div className="flex gap-2">
            <Badge className={`text-xs font-medium ${voiceRecognition.isSupported ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {voiceRecognition.isSupported ? 'Voice Ready' : 'Voice Unsupported'}
            </Badge>
            <Badge className={`text-xs font-medium ${textToSpeech.isSupported ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
              {textToSpeech.isSupported ? 'Speech Ready' : 'Speech Unsupported'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Control Buttons */}
        <div className="flex gap-3 mb-6">
          <Button
            onClick={handleVoiceToggle}
            disabled={!voiceRecognition.isSupported}
            className={`flex items-center gap-2 ${
              voiceRecognition.isListening 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {voiceRecognition.isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Start Listening
              </>
            )}
          </Button>
          
          <Button
            onClick={handleSpeechToggle}
            disabled={!textToSpeech.isSupported}
            variant="outline"
            className="flex items-center gap-2"
          >
            {textToSpeech.isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4" />
                Stop Speaking
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                Speech Ready
              </>
            )}
          </Button>

          <Button
            onClick={startDemo}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            Demo
          </Button>

          <Button
            onClick={() => setShowSettings(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>

        {/* Voice Visualization */}
        {(voiceRecognition.isListening || textToSpeech.isSpeaking) && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {voiceRecognition.isListening && (
                  <>
                    <Mic className="w-4 h-4 text-blue-600 animate-pulse" />
                    <span className="text-sm font-medium text-blue-800">Listening... Speak now!</span>
                  </>
                )}
                {textToSpeech.isSpeaking && (
                  <>
                    <Volume2 className="w-4 h-4 text-green-600 animate-pulse" />
                    <span className="text-sm font-medium text-green-800">Speaking...</span>
                  </>
                )}
              </div>
              <VoiceVisualization 
                isListening={voiceRecognition.isListening} 
                isSpeaking={textToSpeech.isSpeaking} 
              />
            </div>
          </div>
        )}

        {voiceRecognition.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <div className="text-red-600 mt-0.5">⚠️</div>
              <div>
                <p className="text-red-800 text-sm font-medium">Voice Recognition Issue</p>
                <p className="text-red-700 text-sm">{voiceRecognition.error}</p>
                {voiceRecognition.error.includes('not-allowed') && (
                  <p className="text-red-600 text-xs mt-1">
                    1. Click the microphone icon in your browser's address bar<br/>
                    2. Allow microphone access<br/>
                    3. Try again
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Live Transcript */}
        {voiceRecognition.transcript && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-700">
              <strong>You said:</strong> "{voiceRecognition.transcript}"
            </p>
            {voiceRecognition.confidence > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Confidence: {Math.round(voiceRecognition.confidence * 100)}%
              </p>
            )}
          </div>
        )}

        {/* Conversation History */}
        {conversationHistory.length > 0 && (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <h4 className="font-medium text-gray-900 text-sm">Conversation History</h4>
            {conversationHistory.slice(-6).map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg text-sm ${
                  message.type === 'user'
                    ? 'bg-blue-50 border border-blue-200 ml-4'
                    : 'bg-gray-50 border border-gray-200 mr-4'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-medium text-xs ${
                    message.type === 'user' ? 'text-blue-800' : 'text-gray-800'
                  }`}>
                    {message.type === 'user' ? 'You' : 'Assistant'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className={message.type === 'user' ? 'text-blue-700' : 'text-gray-700'}>
                  {message.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Browser Compatibility Info */}
        {!voiceRecognition.isSupported && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <div className="text-yellow-600 mt-0.5">ℹ️</div>
              <div>
                <p className="text-yellow-800 text-sm font-medium">Voice Recognition Not Available</p>
                <p className="text-yellow-700 text-sm mb-2">
                  Voice recognition is only supported in Chrome and Safari browsers.
                </p>
                <p className="text-yellow-600 text-xs">
                  Current browser: {navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                                   navigator.userAgent.includes('Safari') ? 'Safari' : 
                                   navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                                   navigator.userAgent.includes('Edge') ? 'Edge' : 'Unknown'}
                </p>
                <p className="text-yellow-600 text-xs mt-1">
                  Secure context: {window.isSecureContext ? 'Yes' : 'No (HTTPS required)'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Usage Examples */}
        {conversationHistory.length === 0 && voiceRecognition.isSupported && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 text-sm mb-3">Try asking:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {voiceCommands.slice(0, 8).map((command, index) => (
                <div key={index} className="bg-gray-50 rounded p-2">
                  <span className="text-gray-600">"{command.description}"</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voice Settings Modal */}
        {showSettings && (
          <VoiceSettings onClose={() => setShowSettings(false)} />
        )}
      </CardContent>
    </Card>
  );
}