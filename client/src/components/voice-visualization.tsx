import { useEffect, useState } from 'react';

interface VoiceVisualizationProps {
  isListening: boolean;
  isSpeaking: boolean;
}

export default function VoiceVisualization({ isListening, isSpeaking }: VoiceVisualizationProps) {
  const [audioLevels, setAudioLevels] = useState<number[]>([0, 0, 0, 0, 0]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isListening || isSpeaking) {
      interval = setInterval(() => {
        // Generate random audio levels for visual effect
        const newLevels = Array.from({ length: 5 }, () => Math.random() * 100);
        setAudioLevels(newLevels);
      }, 100);
    } else {
      setAudioLevels([0, 0, 0, 0, 0]);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening, isSpeaking]);

  const getBarColor = () => {
    if (isListening) return 'bg-blue-500';
    if (isSpeaking) return 'bg-green-500';
    return 'bg-gray-300';
  };

  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {audioLevels.map((level, index) => (
        <div
          key={index}
          className={`w-2 rounded-full transition-all duration-100 ${getBarColor()}`}
          style={{
            height: `${Math.max(8, (level / 100) * 32)}px`,
            opacity: isListening || isSpeaking ? 1 : 0.3
          }}
        />
      ))}
    </div>
  );
}