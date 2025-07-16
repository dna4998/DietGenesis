import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Target, TrendingUp, Heart, Zap, Star, Award, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  type: 'weight_loss' | 'body_fat_reduction' | 'consistency' | 'milestone' | 'streak' | 'improvement';
  title: string;
  description: string;
  value: number;
  target?: number;
  icon: typeof Trophy;
  color: string;
  emoji: string;
}

interface ProgressCelebrationProps {
  patient: {
    name: string;
    weight: number;
    weightGoal: number;
    bodyFat: number;
    bodyFatGoal: number;
    adherence: number;
  };
  onClose?: () => void;
  autoShow?: boolean;
}

const celebrationVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.3, 
    rotate: -180,
    y: 100 
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    rotate: 0,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
      duration: 0.8
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.3, 
    rotate: 180,
    y: -100,
    transition: {
      duration: 0.5
    }
  }
};

const confettiVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const confettiPieceVariants = {
  hidden: { 
    opacity: 0, 
    y: -50, 
    rotate: 0 
  },
  visible: { 
    opacity: [0, 1, 1, 0], 
    y: [0, -20, 100, 200], 
    rotate: [0, 180, 360, 540],
    transition: {
      duration: 2,
      ease: "easeOut"
    }
  }
};

const pulseVariants = {
  pulse: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 1,
      repeat: 2,
      ease: "easeInOut"
    }
  }
};

export default function ProgressCelebration({ patient, onClose, autoShow = true }: ProgressCelebrationProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [achievementIndex, setAchievementIndex] = useState(0);

  // Calculate achievements based on patient progress
  const calculateAchievements = (): Achievement[] => {
    const achievements: Achievement[] = [];
    
    // Weight loss achievements
    const weightLoss = patient.weight - patient.weightGoal;
    const weightProgress = Math.max(0, Math.min(100, ((patient.weight - patient.weightGoal) / patient.weight) * 100));
    
    if (weightProgress >= 25) {
      achievements.push({
        id: 'weight_quarter',
        type: 'weight_loss',
        title: 'Quarter Way There!',
        description: `Lost ${weightLoss.toFixed(1)} lbs - 25% to goal!`,
        value: 25,
        icon: Target,
        color: 'text-blue-500',
        emoji: '🎯'
      });
    }
    
    if (weightProgress >= 50) {
      achievements.push({
        id: 'weight_half',
        type: 'weight_loss',
        title: 'Halfway Hero!',
        description: `Amazing progress - 50% to your weight goal!`,
        value: 50,
        icon: Trophy,
        color: 'text-yellow-500',
        emoji: '🏆'
      });
    }
    
    if (weightProgress >= 75) {
      achievements.push({
        id: 'weight_three_quarter',
        type: 'weight_loss',
        title: 'Nearly There!',
        description: `Incredible! 75% of the way to your goal!`,
        value: 75,
        icon: Star,
        color: 'text-purple-500',
        emoji: '⭐'
      });
    }
    
    // Body fat achievements
    const bodyFatProgress = Math.max(0, Math.min(100, ((patient.bodyFat - patient.bodyFatGoal) / patient.bodyFat) * 100));
    
    if (bodyFatProgress >= 30) {
      achievements.push({
        id: 'bodyfat_improvement',
        type: 'body_fat_reduction',
        title: 'Body Composition Champion!',
        description: `Great body fat reduction progress!`,
        value: bodyFatProgress,
        icon: Zap,
        color: 'text-green-500',
        emoji: '⚡'
      });
    }
    
    // Adherence achievements
    if (patient.adherence >= 80) {
      achievements.push({
        id: 'consistency_master',
        type: 'consistency',
        title: 'Consistency Master!',
        description: `${patient.adherence}% adherence - You're crushing it!`,
        value: patient.adherence,
        icon: CheckCircle2,
        color: 'text-emerald-500',
        emoji: '✅'
      });
    }
    
    if (patient.adherence >= 95) {
      achievements.push({
        id: 'perfectionist',
        type: 'streak',
        title: 'Perfectionist!',
        description: `${patient.adherence}% adherence - Nearly perfect!`,
        value: patient.adherence,
        icon: Award,
        color: 'text-pink-500',
        emoji: '🏅'
      });
    }
    
    // Health improvement achievements
    const healthScore = (weightProgress + bodyFatProgress + patient.adherence) / 3;
    if (healthScore >= 70) {
      achievements.push({
        id: 'health_warrior',
        type: 'improvement',
        title: 'Health Warrior!',
        description: `Outstanding overall health improvement!`,
        value: healthScore,
        icon: Heart,
        color: 'text-red-500',
        emoji: '❤️'
      });
    }
    
    return achievements;
  };

  useEffect(() => {
    const newAchievements = calculateAchievements();
    setAchievements(newAchievements);
    
    if (autoShow && newAchievements.length > 0) {
      setCurrentAchievement(newAchievements[0]);
      setShowCelebration(true);
    }
  }, [patient, autoShow]);

  const showNextAchievement = () => {
    if (achievementIndex < achievements.length - 1) {
      setAchievementIndex(prev => prev + 1);
      setCurrentAchievement(achievements[achievementIndex + 1]);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setShowCelebration(false);
    setTimeout(() => {
      setCurrentAchievement(null);
      setAchievementIndex(0);
      onClose?.();
    }, 500);
  };

  if (!currentAchievement || !showCelebration) return null;

  const Icon = currentAchievement.icon;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        {/* Confetti Background */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          variants={confettiVariants}
          initial="hidden"
          animate="visible"
        >
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "absolute w-3 h-3 rounded-full",
                i % 4 === 0 && "bg-yellow-400",
                i % 4 === 1 && "bg-blue-400", 
                i % 4 === 2 && "bg-green-400",
                i % 4 === 3 && "bg-pink-400"
              )}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 20}%`,
              }}
              variants={confettiPieceVariants}
            />
          ))}
        </motion.div>

        {/* Achievement Card */}
        <motion.div
          variants={celebrationVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          className="relative"
        >
          <Card className="w-full max-w-lg mx-auto bg-gradient-to-br from-white via-blue-50 to-purple-50 border-2 border-blue-200 shadow-2xl">
            <CardContent className="p-8 text-center">
              {/* Achievement Icon */}
              <motion.div
                className={cn(
                  "mx-auto mb-6 w-24 h-24 rounded-full flex items-center justify-center",
                  "bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 shadow-lg"
                )}
                variants={pulseVariants}
                animate="pulse"
              >
                <Icon className="h-12 w-12 text-white" />
              </motion.div>

              {/* Achievement Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-4xl mb-4">{currentAchievement.emoji}</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {currentAchievement.title}
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  {currentAchievement.description}
                </p>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, currentAchievement.value)}%` }}
                    transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
                  />
                </div>
                
                <p className="text-sm text-gray-500 mb-8">
                  Keep up the amazing work, {patient.name}! 🌟
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                className="flex gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                {achievementIndex < achievements.length - 1 ? (
                  <Button
                    onClick={showNextAchievement}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg"
                  >
                    Next Achievement →
                  </Button>
                ) : (
                  <Button
                    onClick={handleClose}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg"
                  >
                    Continue Journey! 🚀
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="px-6 py-3 rounded-full"
                >
                  Close
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook for triggering celebrations
export function useProgressCelebration() {
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<any>(null);

  const triggerCelebration = (patient: any) => {
    setCelebrationData(patient);
    setShowCelebration(true);
  };

  const closeCelebration = () => {
    setShowCelebration(false);
    setCelebrationData(null);
  };

  return {
    showCelebration,
    celebrationData,
    triggerCelebration,
    closeCelebration
  };
}