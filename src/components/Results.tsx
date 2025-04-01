
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/hooks/use-game-store';
import { Award, Rotate } from 'lucide-react';

export const Results = () => {
  const mostVotedPlayer = useGameStore(state => state.getMostVotedPlayer());
  const spyPlayerId = useGameStore(state => state.spyPlayerId);
  const currentWord = useGameStore(state => state.currentWord);
  const players = useGameStore(state => state.getPlayersArray());
  const resetGame = useGameStore(state => state.resetGame);
  
  const isSpyCaught = mostVotedPlayer?.id === spyPlayerId;
  const spy = players.find(player => player.id === spyPlayerId);
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-game">Game Results</h2>
      </div>
      
      <div className="game-card max-w-md mx-auto">
        <div className="flex justify-center mb-6">
          {isSpyCaught ? (
            <div className="p-4 rounded-full bg-green-100 text-green-600">
              <Award size={48} />
            </div>
          ) : (
            <div className="p-4 rounded-full bg-spy/10 text-spy">
              <Award size={48} />
            </div>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-center mb-4">
          {isSpyCaught 
            ? "The Spy Was Caught!" 
            : "The Spy Got Away!"}
        </h3>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-600 mb-1">Secret Word</div>
              <div className="font-semibold text-game">{currentWord}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600 mb-1">Spy Player</div>
              <div className="font-semibold text-spy">{spy?.name}</div>
            </div>
          </div>
        </div>
        
        <h4 className="font-medium mb-2">Voting Results</h4>
        <ul className="mb-6 space-y-2">
          {players.map(player => (
            <li 
              key={player.id} 
              className={`py-2 px-3 rounded flex justify-between items-center
                ${player.id === mostVotedPlayer?.id ? 'bg-game/10' : 'bg-gray-50'}`}
            >
              <div className="flex items-center">
                <span>{player.name}</span>
                {player.id === spyPlayerId && (
                  <span className="ml-2 text-xs bg-spy/20 text-spy px-2 py-0.5 rounded">
                    Spy
                  </span>
                )}
              </div>
              {player.id === mostVotedPlayer?.id && (
                <span className="text-sm font-medium">Most Voted</span>
              )}
            </li>
          ))}
        </ul>
        
        <Button onClick={resetGame} className="w-full game-button flex items-center justify-center gap-2">
          <Rotate size={18} />
          <span>Play Again</span>
        </Button>
      </div>
    </div>
  );
};
