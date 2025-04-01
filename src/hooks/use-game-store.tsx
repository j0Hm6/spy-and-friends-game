import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Available words for the game
const GAME_WORDS = ["S3", "Shayka", "Kaldırım"];

// Player type definition
export interface Player {
  id: string;
  name: string;
  isReady: boolean;
  isConnected: boolean;
  isSpy?: boolean;
  hasVoted?: boolean;
}

// Game state type definition
interface GameState {
  players: Record<string, Player>;
  gameStage: 'join' | 'lobby' | 'reveal' | 'gameplay' | 'voting' | 'results';
  currentWord: string | null;
  currentVotes: Record<string, string>; // Key: voter ID, Value: voted player ID
  localPlayerId: string | null;
  spyPlayerId: string | null;
  gameId: string | null;
  lastUpdated: number;
}

// Game actions type definition
interface GameActions {
  // Player management
  addPlayer: (name: string, id?: string) => void;
  removePlayer: (id: string) => void;
  resetGame: () => void;
  
  // Game flow control
  startGame: () => void;
  revealRoles: () => void;
  startGameplay: () => void;
  startVoting: () => void;
  
  // Voting actions
  submitVote: (targetPlayerId: string) => void;
  
  // Getters
  getLocalPlayer: () => Player | null;
  getPlayersArray: () => Player[];
  getMostVotedPlayer: () => Player | null;
  isGameReady: () => boolean;
  isVotingComplete: () => boolean;
  
  // Sync
  setGameId: (id: string) => void;
  syncGameState: (remoteState: Partial<GameState>) => void;
  getGameState: () => Partial<GameState>;
}

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      players: {},
      gameStage: 'join',
      currentWord: null,
      currentVotes: {},
      localPlayerId: null,
      spyPlayerId: null,
      gameId: null,
      lastUpdated: Date.now(),
      
      // Player management
      addPlayer: (name, id) => {
        // Generate a random ID or use provided ID
        const playerId = id || Math.random().toString(36).substring(2, 9);
        
        // Set local player ID if not set
        if (get().localPlayerId === null) {
          set({ localPlayerId: playerId });
        }
        
        set((state) => ({
          players: {
            ...state.players,
            [playerId]: {
              id: playerId,
              name,
              isReady: true,
              isConnected: true
            }
          },
          lastUpdated: Date.now()
        }));
      },
      
      removePlayer: (id) => {
        set((state) => {
          const { [id]: removed, ...remaining } = state.players;
          return { 
            players: remaining,
            lastUpdated: Date.now()
          };
        });
      },
      
      resetGame: () => {
        const localPlayerId = get().localPlayerId;
        const players = get().players;
        
        // Reset to lobby stage but keep all players
        set({
          gameStage: 'lobby',
          currentWord: null,
          currentVotes: {},
          spyPlayerId: null,
          lastUpdated: Date.now(),
          players: Object.fromEntries(
            Object.entries(players).map(([id, player]) => [
              id, 
              { ...player, isSpy: undefined, hasVoted: undefined }
            ])
          )
        });
      },
      
      startGame: () => {
        const players = Object.values(get().players);
        if (players.length < 2) return;
        
        // Pick a random spy
        const randomIndex = Math.floor(Math.random() * players.length);
        const spyPlayerId = players[randomIndex].id;
        
        // Pick a random word
        const randomWord = GAME_WORDS[Math.floor(Math.random() * GAME_WORDS.length)];
        
        set((state) => ({
          spyPlayerId,
          currentWord: randomWord,
          gameStage: 'reveal',
          lastUpdated: Date.now(),
          players: Object.fromEntries(
            Object.entries(state.players).map(([id, player]) => [
              id, 
              { ...player, isSpy: id === spyPlayerId }
            ])
          )
        }));
      },
      
      revealRoles: () => {
        set({ 
          gameStage: 'reveal',
          lastUpdated: Date.now()
        });
      },
      
      startGameplay: () => {
        set({ 
          gameStage: 'gameplay',
          lastUpdated: Date.now()
        });
      },
      
      startVoting: () => {
        set({ 
          gameStage: 'voting', 
          currentVotes: {},
          lastUpdated: Date.now()
        });
      },
      
      submitVote: (targetPlayerId) => {
        const localPlayerId = get().localPlayerId;
        if (!localPlayerId) return;
        
        set((state) => ({
          currentVotes: {
            ...state.currentVotes,
            [localPlayerId]: targetPlayerId
          },
          lastUpdated: Date.now(),
          players: {
            ...state.players,
            [localPlayerId]: {
              ...state.players[localPlayerId],
              hasVoted: true
            }
          }
        }));
        
        // If everyone has voted, show results
        if (get().isVotingComplete()) {
          set({ 
            gameStage: 'results',
            lastUpdated: Date.now()
          });
        }
      },
      
      getLocalPlayer: () => {
        const localPlayerId = get().localPlayerId;
        return localPlayerId ? get().players[localPlayerId] : null;
      },
      
      getPlayersArray: () => {
        return Object.values(get().players);
      },
      
      getMostVotedPlayer: () => {
        const votes = get().currentVotes;
        const voteCounts: Record<string, number> = {};
        
        // Count votes for each player
        Object.values(votes).forEach(targetId => {
          voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
        });
        
        // Find the player with the most votes
        let maxVotes = 0;
        let mostVotedId = null;
        
        Object.entries(voteCounts).forEach(([playerId, count]) => {
          if (count > maxVotes) {
            maxVotes = count;
            mostVotedId = playerId;
          }
        });
        
        return mostVotedId ? get().players[mostVotedId] : null;
      },
      
      isGameReady: () => {
        return Object.values(get().players).length >= 2;
      },
      
      isVotingComplete: () => {
        const players = Object.values(get().players);
        return players.every(player => player.hasVoted);
      },
      
      setGameId: (id) => {
        set({ 
          gameId: id,
          lastUpdated: Date.now()
        });
      },
      
      syncGameState: (remoteState) => {
        // Only sync if the remote state is newer than our current state
        if (!remoteState.lastUpdated || remoteState.lastUpdated <= get().lastUpdated) {
          return;
        }
        
        const localPlayerId = get().localPlayerId;
        
        // Merge remote players with local players
        const mergedPlayers = { ...get().players };
        if (remoteState.players) {
          Object.entries(remoteState.players).forEach(([id, player]) => {
            // Don't override local player data
            if (id !== localPlayerId) {
              mergedPlayers[id] = player;
            }
          });
        }
        
        set({
          players: mergedPlayers,
          gameStage: remoteState.gameStage || get().gameStage,
          currentWord: remoteState.currentWord || get().currentWord,
          currentVotes: remoteState.currentVotes || get().currentVotes,
          spyPlayerId: remoteState.spyPlayerId || get().spyPlayerId,
          lastUpdated: remoteState.lastUpdated
        });
      },
      
      getGameState: () => {
        const {
          players,
          gameStage,
          currentWord,
          currentVotes,
          spyPlayerId,
          lastUpdated
        } = get();
        
        return {
          players,
          gameStage,
          currentWord,
          currentVotes,
          spyPlayerId,
          lastUpdated
        };
      }
    }),
    {
      name: 'spy-game-storage',
      partialize: (state) => ({
        localPlayerId: state.localPlayerId,
        gameId: state.gameId
      })
    }
  )
);
