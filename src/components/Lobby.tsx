
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/hooks/use-game-store';
import { useMemo, useEffect } from 'react';
import { toast } from 'sonner';

export const Lobby = () => {
  // Use stable selectors to avoid unnecessary rerenders
  const players = useGameStore(state => state.players);
  const startGame = useGameStore(state => state.startGame);
  const addPlayer = useGameStore(state => state.addPlayer);
  const localPlayerId = useGameStore(state => state.localPlayerId);
  
  // Derive players array and game ready state from the players object
  const playersArray = useMemo(() => Object.values(players), [players]);
  const isGameReady = useMemo(() => {
    return playersArray.length >= 2;
  }, [playersArray.length]);
  
  // Effect to synchronize players between clients using URL hash
  useEffect(() => {
    // Only the first player to join a game should set the game ID
    if (playersArray.length === 1 && window.location.hash === '') {
      const gameId = Math.random().toString(36).substring(2, 9);
      window.location.hash = gameId;
      localStorage.setItem('gameId', gameId);
    }
    
    // If joining an existing game (via shared link with hash)
    if (window.location.hash && playersArray.length === 1) {
      const gameId = window.location.hash.substring(1);
      localStorage.setItem('gameId', gameId);
      
      // Show a toast when joining an existing game
      toast.success("You've joined an existing game lobby!");
    }
    
    // Create a function to sync the local player to the URL for other clients to detect
    const syncPlayerToUrl = () => {
      if (localPlayerId) {
        const playerData = players[localPlayerId];
        if (playerData) {
          const playerParam = `player=${encodeURIComponent(JSON.stringify(playerData))}`;
          const url = new URL(window.location.href);
          url.searchParams.set(localPlayerId, playerParam);
          window.history.replaceState({}, '', url);
        }
      }
    };
    
    // Initial sync of player data
    syncPlayerToUrl();
    
    // Poll URL parameters to detect new players from other clients
    const pollInterval = setInterval(() => {
      // Get other client players from URL parameters
      const url = new URL(window.location.href);
      url.searchParams.forEach((value, key) => {
        if (key !== localPlayerId && value.startsWith('player=')) {
          try {
            const playerData = JSON.parse(decodeURIComponent(value.substring(7)));
            // Add player if not already in the store
            if (playerData.id && !players[playerData.id]) {
              addPlayer(playerData.name, playerData.id);
            }
          } catch (e) {
            console.error('Error parsing player data:', e);
          }
        }
      });
      
      // Update our player in the URL
      syncPlayerToUrl();
    }, 2000); // Check every 2 seconds
    
    return () => clearInterval(pollInterval);
  }, [players, localPlayerId, playersArray.length, addPlayer]);
  
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
