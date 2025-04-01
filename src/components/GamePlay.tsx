
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/hooks/use-game-store';
import { HelpCircle } from 'lucide-react';

export const GamePlay = () => {
  const localPlayer = useGameStore(state => state.getLocalPlayer());
  const currentWord = useGameStore(state => state.currentWord);
  const players = useGameStore(state => state.getPlayersArray());
  const startVoting = useGameStore(state => state.startVoting);
  const isSpy = localPlayer?.isSpy || false;
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-game">Game in Progress</h2>
        <p className="text-gray-600 mt-2">
          {isSpy 
            ? "Try to figure out what everyone is talking about!" 
            : "Ask questions and find out who doesn't know the word!"}
        </p>
      </div>
      
      <div className="game-card max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Your Role:</h3>
          <div 
            className={`px-3 py-1 rounded-full text-sm font-medium
              ${isSpy ? 'bg-spy/10 text-spy' : 'bg-game/10 text-game'}`}
          >
            {isSpy ? 'SPY' : 'PLAYER'}
          </div>
        </div>
        
        {!isSpy && (
          <div className="bg-gray-50 rounded-lg p-3 mb-6 text-center">
            <div className="text-sm text-gray-600 mb-1">The word is:</div>
            <div className="text-xl font-semibold text-game">{currentWord}</div>
          </div>
        )}
        
        {isSpy && (
          <div className="bg-spy/5 border border-spy/20 rounded-lg p-3 mb-6">
            <div className="flex items-center gap-2 text-spy mb-1">
              <HelpCircle size={16} />
              <span className="font-medium text-sm">SPY HINT</span>
            </div>
            <p className="text-gray-700 text-sm">
              Listen carefully to figure out the secret word. Don't make it obvious you don't know!
            </p>
          </div>
        )}
        
        <h3 className="font-semibold text-lg mb-3">Players:</h3>
        <ul className="space-y-2 mb-6">
          {players.map(player => (
            <li 
              key={player.id}
              className={`py-2 px-3 rounded flex justify-between items-center
                ${player.id === localPlayer?.id ? 'bg-game/10' : 'bg-gray-50'}`}
            >
              <span>
                {player.name}
                {player.id === localPlayer?.id && (
                  <span className="text-xs text-gray-500 ml-2">(you)</span>
                )}
              </span>
            </li>
          ))}
        </ul>
        
        <Button onClick={startVoting} className="w-full spy-button">
          Start Voting
        </Button>
        
        <p className="text-xs text-gray-500 mt-3 text-center">
          When everyone's ready, start the voting to find the spy!
        </p>
      </div>
    </div>
  );
};
