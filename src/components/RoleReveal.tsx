
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/hooks/use-game-store';
import { Eye, EyeOff } from 'lucide-react';

export const RoleReveal = () => {
  const [revealed, setRevealed] = useState(false);
  const localPlayer = useGameStore(state => state.getLocalPlayer());
  const currentWord = useGameStore(state => state.currentWord);
  const startGameplay = useGameStore(state => state.startGameplay);
  const isSpy = localPlayer?.isSpy || false;
  
  // Auto-continue after a delay
  useEffect(() => {
    if (revealed) {
      const timer = setTimeout(() => {
        startGameplay();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [revealed, startGameplay]);
  
  return (
    <div className="space-y-8 text-center">
      <h2 className="text-3xl font-bold text-game">Your Secret Role</h2>
      <p className="text-gray-600">
        Tap to reveal your role. Don't show your screen to others!
      </p>
      
      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="w-64 h-64 mx-auto game-card flex flex-col items-center justify-center gap-4 hover:bg-gray-50 transition-colors"
        >
          <Eye size={48} className="text-gray-400" />
          <span className="font-medium text-gray-500">Tap to reveal</span>
        </button>
      ) : (
        <motion.div 
          initial={{ rotateY: 180, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`w-64 h-64 mx-auto game-card flex flex-col items-center justify-center gap-3
            ${isSpy ? 'bg-spy/10' : 'bg-game/10'}`}
        >
          {isSpy ? (
            <>
              <div className="text-spy text-5xl font-bold mb-2">SPY</div>
              <p className="text-gray-700">Try to guess the secret word!</p>
            </>
          ) : (
            <>
              <div className="text-game text-sm font-medium mb-1">The word is:</div>
              <div className="text-game text-4xl font-bold">{currentWord}</div>
              <p className="text-sm text-gray-600 mt-3">Find out who's the spy!</p>
            </>
          )}
        </motion.div>
      )}
      
      {revealed && (
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-2">Continuing in a moment...</p>
          <Button onClick={startGameplay} className="game-button">
            Continue
          </Button>
          <div className="mt-4 flex justify-center">
            <EyeOff size={18} className="text-gray-400 mr-2" />
            <span className="text-sm text-gray-500">
              Don't show your screen to other players
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
