
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/hooks/use-game-store';
import { useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { useGameSync } from '@/hooks/use-game-sync';
import { Copy, Share2 } from 'lucide-react';

export const Lobby = () => {
  // Get stable selectors from game store
  const players = useGameStore(state => state.getPlayersArray());
  const startGame = useGameStore(state => state.startGame);
  const localPlayer = useGameStore(state => state.getLocalPlayer());
  const isGameReady = useMemo(() => players.length >= 2, [players.length]);

  // Use the game synchronization hook
  useGameSync();
  
  // Share game link function
  const shareGameLink = async () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Spy Game!',
          text: 'Join my Spy Game!',
          url: shareUrl,
        });
      } catch (err) {
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };
  
  // Copy to clipboard helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Game link copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy link. Try sharing manually.");
    });
  };
  
  return (
    <div className="space-y-6 text-center">
      <h2 className="text-3xl font-bold text-game">Game Lobby</h2>
      <p className="text-gray-600">
        Waiting for players... <span className="font-semibold">({players.length} joined)</span>
      </p>
      
      <div className="max-w-md mx-auto game-card">
        <h3 className="font-semibold text-xl mb-3">Players:</h3>
        <ul className="space-y-2 mb-6">
          {players.map(player => (
            <li 
              key={player.id} 
              className="py-2 px-3 bg-gray-50 rounded flex justify-between items-center"
            >
              <span>
                {player.name}
                {player.id === localPlayer?.id && (
                  <span className="text-xs text-gray-500 ml-2">(you)</span>
                )}
              </span>
              <span className="text-sm text-green-600 font-medium">Ready</span>
            </li>
          ))}
        </ul>
        
        <div className="space-y-3">
          <Button
            onClick={shareGameLink}
            className="w-full flex items-center justify-center gap-2 bg-game-secondary"
          >
            <Share2 size={18} />
            Share Game Link
          </Button>
          
          <Button
            onClick={startGame}
            disabled={!isGameReady}
            className="w-full game-button"
          >
            {isGameReady ? 'Start Game' : 'Need at least 2 players'}
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 mt-3">
          Share this page link with friends to play together
        </p>
      </div>
    </div>
  );
};
