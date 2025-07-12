import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Volume2, Mic } from 'lucide-react';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';

interface VoiceSettingsProps {
  onClose: () => void;
}

export default function VoiceSettings({ onClose }: VoiceSettingsProps) {
  const textToSpeech = useTextToSpeech();
  const [testText] = useState("This is a test of the voice settings. How do I sound?");
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);

  const testVoice = () => {
    textToSpeech.speak(testText);
  };

  // Filter to English voices for better user experience
  const englishVoices = textToSpeech.voices.filter(voice => 
    voice.lang.startsWith('en-') || voice.lang === 'en'
  );

  const handleVoiceChange = (index: number) => {
    if (englishVoices[index]) {
      textToSpeech.setVoice(englishVoices[index]);
      setSelectedVoiceIndex(index);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Voice Settings
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Voices ({englishVoices.length})
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {englishVoices.map((voice, index) => (
                <button
                  key={voice.voiceURI}
                  onClick={() => handleVoiceChange(index)}
                  className={`w-full text-left p-2 rounded border text-sm ${
                    selectedVoiceIndex === index 
                      ? 'bg-blue-100 border-blue-300 text-blue-800' 
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {voice.name} ({voice.lang})
                </button>
              ))}
            </div>
          </div>

          {/* Simple Controls Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              Voice settings like speed and pitch can be adjusted in your browser's accessibility settings.
            </p>
          </div>

          {/* Test Voice */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              onClick={testVoice}
              className="w-full flex items-center gap-2"
              disabled={!textToSpeech.isSupported}
            >
              <Volume2 className="w-4 h-4" />
              Test Voice
            </Button>
          </div>

          {/* Browser Support Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-800 mb-1">
              <Mic className="w-4 h-4" />
              <span className="text-sm font-medium">Browser Support</span>
            </div>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Voice Recognition: Chrome, Safari</li>
              <li>• Text-to-Speech: All modern browsers</li>
              <li>• Best experience: Chrome on desktop</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}