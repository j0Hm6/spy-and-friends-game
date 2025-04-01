
import { useEffect } from 'react';
import { useGameStore } from './use-game-store';
import { toast } from 'sonner';

export const useGameSync = () => {
  const gameStore = useGameStore();

  useEffect(() => {
    // Generate or use existing game ID
    const setupGameId = () => {
      // Check if we're joining an existing game via URL hash
      const hashGameId = window.location.hash.substring(1);
      
      if (hashGameId) {
        // We're joining an existing game
        gameStore.setGameId(hashGameId);
        return hashGameId;
      } 
      else if (gameStore.gameId) {
        // We already have a game ID
        return gameStore.gameId;
      } 
      else {
        // Create a new game ID
        const newGameId = Math.random().toString(36).substring(2, 9);
        gameStore.setGameId(newGameId);
        window.location.hash = newGameId;
        return newGameId;
      }
    };
    
    const gameId = setupGameId();
    
    // Use the channel name where we'll store game state
    const channelName = `game-sync-${gameId}`;
    
    // Set up localStorage synchronization
    const syncInterval = setInterval(() => {
      // Save our current state to localStorage with timestamp
      const currentState = gameStore.getGameState();
      localStorage.setItem(channelName, JSON.stringify(currentState));
      
      // Check for changes from other tabs/windows
      try {
        const storedStateJson = localStorage.getItem(channelName);
        if (storedStateJson) {
          const storedState = JSON.parse(storedStateJson);
          gameStore.syncGameState(storedState);
        }
      } catch (err) {
        console.error('Error syncing game state:', err);
      }
    }, 1000); // Update every second
    
    // Setup BroadcastChannel for same-origin tabs
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      broadcastChannel = new BroadcastChannel(channelName);
      
      broadcastChannel.onmessage = (event) => {
        try {
          const remoteState = event.data;
          if (remoteState) {
            gameStore.syncGameState(remoteState);
          }
        } catch (err) {
          console.error('Error processing broadcast message:', err);
        }
      };
      
      // Initial local player announcement
      if (gameStore.getLocalPlayer()) {
        broadcastChannel.postMessage({
          players: {
            [gameStore.localPlayerId!]: gameStore.getLocalPlayer()
          },
          lastUpdated: Date.now()
        });
      }
      
      // Periodic broadcasts
      const broadcastInterval = setInterval(() => {
        if (broadcastChannel) {
          broadcastChannel.postMessage(gameStore.getGameState());
        }
      }, 2000);
      
      return () => {
        clearInterval(broadcastInterval);
        broadcastChannel?.close();
      };
    } catch (err) {
      console.log('BroadcastChannel not supported');
    }
    
    // Show welcome toast when joining
    if (hashGameId && gameStore.localPlayerId) {
      toast.success("You've joined a game! Waiting for other players...");
    }
    
    return () => {
      clearInterval(syncInterval);
    };
  }, []);
  
  return null;
};
