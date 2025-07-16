import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trophy, Zap, Target, Star } from "lucide-react";
import { FloatingIcon } from "./micro-animations";
import type { Patient } from "@shared/schema";

interface CelebrationTriggerProps {
  patient: Patient;
  onCelebrationTriggered?: (type: string) => void;
}

interface AchievementTrigger {
  id: string;
  threshold: number;
  message: string;
  icon: typeof Trophy;
  color: string;
}

const achievementTriggers: AchievementTrigger[] = [
  {
    id: 'adherence_80',
    threshold: 80,
    message: 'Great consistency!',
    icon: Target,
    color: 'text-blue-500'
  },
  {
    id: 'adherence_90',
    threshold: 90,
    message: 'Outstanding adherence!',
    icon: Star,
    color: 'text-yellow-500'
  },
  {
    id: 'adherence_95',
    threshold: 95,
    message: 'Nearly perfect!',
    icon: Trophy,
    color: 'text-gold-500'
  }
];

export default function CelebrationTrigger({ patient, onCelebrationTriggered }: CelebrationTriggerProps) {
  const [triggeredAchievements, setTriggeredAchievements] = useState<string[]>([]);
  const [activeFloatingIcons, setActiveFloatingIcons] = useState<Array<{
    id: string;
    icon: JSX.Element;
    position: { x: number; y: number };
  }>>([]);

  useEffect(() => {
    // Check for new achievements
    achievementTriggers.forEach(trigger => {
      if (!triggeredAchievements.includes(trigger.id)) {
        // Check adherence milestones
        if (trigger.id.startsWith('adherence_') && patient.adherence >= trigger.threshold) {
          handleAchievementTriggered(trigger);
        }
        
        // Check weight loss milestones
        const weightProgress = Math.max(0, Math.min(100, ((patient.weight - patient.weightGoal) / patient.weight) * 100));
        if (trigger.id.startsWith('weight_') && weightProgress >= trigger.threshold) {
          handleAchievementTriggered(trigger);
        }
        
        // Check body fat milestones
        const bodyFatProgress = Math.max(0, Math.min(100, ((patient.bodyFat - patient.bodyFatGoal) / patient.bodyFat) * 100));
        if (trigger.id.startsWith('bodyfat_') && bodyFatProgress >= trigger.threshold) {
          handleAchievementTriggered(trigger);
        }
      }
    });
  }, [patient, triggeredAchievements]);

  const handleAchievementTriggered = (trigger: AchievementTrigger) => {
    // Mark as triggered
    setTriggeredAchievements(prev => [...prev, trigger.id]);
    
    // Add floating icon
    const newIcon = {
      id: `${trigger.id}_${Date.now()}`,
      icon: <trigger.icon className={`h-6 w-6 ${trigger.color}`} />,
      position: {
        x: Math.random() * 300,
        y: Math.random() * 200
      }
    };
    
    setActiveFloatingIcons(prev => [...prev, newIcon]);
    
    // Remove floating icon after animation
    setTimeout(() => {
      setActiveFloatingIcons(prev => prev.filter(icon => icon.id !== newIcon.id));
    }, 3000);
    
    // Notify parent component
    onCelebrationTriggered?.(trigger.id);
    
    // Create sparkle burst effect
    createSparkleBurst();
  };

  const createSparkleBurst = () => {
    const sparkles = Array.from({ length: 8 }).map((_, i) => ({
      id: `sparkle_${Date.now()}_${i}`,
      icon: <Sparkles className="h-4 w-4 text-yellow-400" />,
      position: {
        x: 150 + (Math.cos((i / 8) * 2 * Math.PI) * 80),
        y: 100 + (Math.sin((i / 8) * 2 * Math.PI) * 80)
      }
    }));
    
    setActiveFloatingIcons(prev => [...prev, ...sparkles]);
    
    // Remove sparkles
    setTimeout(() => {
      sparkles.forEach(sparkle => {
        setActiveFloatingIcons(prev => prev.filter(icon => icon.id !== sparkle.id));
      });
    }, 2000);
  };

  // Auto-trigger celebration for high performers
  useEffect(() => {
    const shouldAutoTrigger = () => {
      const weightProgress = Math.max(0, Math.min(100, ((patient.weight - patient.weightGoal) / patient.weight) * 100));
      const bodyFatProgress = Math.max(0, Math.min(100, ((patient.bodyFat - patient.bodyFatGoal) / patient.bodyFat) * 100));
      
      return (
        (patient.adherence >= 85 && weightProgress >= 30) ||
        (bodyFatProgress >= 40 && patient.adherence >= 80) ||
        (weightProgress >= 50 && bodyFatProgress >= 30)
      );
    };

    if (shouldAutoTrigger() && !triggeredAchievements.includes('auto_celebration')) {
      setTimeout(() => {
        handleAchievementTriggered({
          id: 'auto_celebration',
          threshold: 0,
          message: 'Amazing overall progress!',
          icon: Trophy,
          color: 'text-purple-500'
        });
      }, 2000);
    }
  }, [patient, triggeredAchievements]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {activeFloatingIcons.map(({ id, icon, position }) => (
          <FloatingIcon
            key={id}
            icon={icon}
            className="absolute"
            style={{
              left: position.x,
              top: position.y
            }}
            duration={3}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for easy integration
export function useCelebrationTrigger(patient: Patient) {
  const [lastTriggeredAchievement, setLastTriggeredAchievement] = useState<string | null>(null);
  
  const handleCelebrationTriggered = (type: string) => {
    setLastTriggeredAchievement(type);
    
    // Create a browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Achievement Unlocked!', {
        body: `Great progress in your health journey!`,
        icon: '/logo.png'
      });
    }
  };
  
  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };
  
  return {
    lastTriggeredAchievement,
    handleCelebrationTriggered,
    requestNotificationPermission
  };
}