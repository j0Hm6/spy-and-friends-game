
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/hooks/use-game-store';

export const Voting = () => {
  const players = useGameStore(state => state.getPlayersArray());
  const localPlayer = useGameStore(state => state.getLocalPlayer());
  const submitVote = useGameStore(state => state.submitVote);
  const currentVotes = useGameStore(state => state.currentVotes);
  
  const hasVoted = localPlayer?.hasVoted || false;
  const localPlayerId = localPlayer?.id || '';
  
  const handleVote = (targetId: string) => {
    submitVote(targetId);
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-game">Vote for the Spy</h2>
        <p className="text-gray-600 mt-2">
          Who do you think is the spy?
        </p>
      </div>
      
      <div className="game-card max-w-md mx-auto">
        {!hasVoted ? (
          <>
            <h3 className="font-semibold text-lg mb-4">Select a player to vote:</h3>
            <ul className="space-y-3 mb-4">
              {players
                .filter(player => player.id !== localPlayerId)
                .map(player => (
                  <li key={player.id}>
                    <Button 
                      onClick={() => handleVote(player.id)}
                      className="w-full justify-start text-left py-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 shadow-sm"
                      variant="outline"
                    >
                      {player.name}
                    </Button>
                  </li>
                ))}
            </ul>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="text-2xl mb-3">✓</div>
            <h3 className="font-medium text-gray-800">Your vote has been cast</h3>
            <p className="text-gray-600 text-sm mt-2">
              Waiting for other players to vote...
            </p>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Voting Status:</h4>
          {players.map(player => (
            <div key={player.id} className="flex justify-between text-sm py-1">
              <span>{player.name}</span>
              <span>
                {player.hasVoted ? (
                  <span className="text-green-600">Voted</span>
                ) : (
                  <span className="text-gray-400">Waiting...</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
