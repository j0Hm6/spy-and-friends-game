
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameStore } from '@/hooks/use-game-store';

export const PlayerName = () => {
  const [name, setName] = useState('');
  const addPlayer = useGameStore(state => state.addPlayer);
  
  const handleJoin = () => {
    if (name.trim()) {
      addPlayer(name.trim());
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoin();
    }
  };
  
  return (
    <div className="space-y-6 text-center">
      <h1 className="text-4xl font-bold tracking-tighter text-game">Spy Game</h1>
      <p className="text-lg text-gray-600">Enter your name to join the game</p>
      
      <div className="flex flex-col sm:flex-row gap-3 max-w-xs mx-auto">
        <Input 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Your name" 
          className="flex-1"
          autoFocus
        />
        <Button 
          onClick={handleJoin}
          disabled={!name.trim()} 
          className="game-button"
        >
          Join Game
        </Button>
      </div>
    </div>
  );
};
