
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/hooks/use-game-store';
import { useMemo } from 'react';

export const Lobby = () => {
  // Use stable selectors to avoid unnecessary rerenders
  const players = useGameStore(state => state.players);
  const startGame = useGameStore(state => state.startGame);
  
  // Derive players array and game ready state from the players object
  const playersArray = useMemo(() => Object.values(players), [players]);
  const isGameReady = useMemo(() => {
    return playersArray.length >= 2;
  }, [playersArray.length]);
  
  return (
    <div className="space-y-6 text-center">
      <h2 className="text-3xl font-bold text-game">Game Lobby</h2>
      <p className="text-gray-600">Waiting for players... ({playersArray.length} joined)</p>
      
      <div className="max-w-md mx-auto game-card">
        <h3 className="font-semibold text-xl mb-3">Players:</h3>
        <ul className="space-y-2 mb-6">
          {playersArray.map(player => (
            <li 
              key={player.id} 
              className="py-2 px-3 bg-gray-50 rounded flex justify-between items-center"
            >
              <span>{player.name}</span>
              <span className="text-sm text-green-600 font-medium">Ready</span>
            </li>
          ))}
        </ul>
        
        <Button
          onClick={startGame}
          disabled={!isGameReady}
          className="w-full game-button"
        >
          {isGameReady ? 'Start Game' : 'Need at least 2 players'}
        </Button>
        
        <p className="text-xs text-gray-500 mt-3">
          Share this page link with friends to play together
        </p>
      </div>
    </div>
  );
};
