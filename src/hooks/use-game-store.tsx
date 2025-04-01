import { create } from 'zustand';

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
}

// Game actions type definition
interface GameActions {
  // Player management
  addPlayer: (name: string) => void;
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
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  players: {},
  gameStage: 'join',
  currentWord: null,
  currentVotes: {},
  localPlayerId: null,
  spyPlayerId: null,
  
  // Player management
  addPlayer: (name) => {
    // Generate a random ID and set local player ID if not set
    const id = Math.random().toString(36).substring(2, 9);
    if (get().localPlayerId === null) {
      set({ localPlayerId: id });
    }
    
    set((state) => ({
      players: {
        ...state.players,
        [id]: {
          id,
          name,
          isReady: true,
          isConnected: true
        }
      }
    }));
  },
  
  removePlayer: (id) => {
    set((state) => {
      const { [id]: removed, ...remaining } = state.players;
      return { players: remaining };
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
      players: Object.fromEntries(
        Object.entries(players).map(([id, player]) => [
          id, 
          { ...player, isSpy: undefined, hasVoted: undefined }
        ])
      )
    });
  },
  
  // Game flow
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
      players: Object.fromEntries(
        Object.entries(state.players).map(([id, player]) => [
          id, 
          { ...player, isSpy: id === spyPlayerId }
        ])
      )
    }));
  },
  
  revealRoles: () => {
    set({ gameStage: 'reveal' });
  },
  
  startGameplay: () => {
    set({ gameStage: 'gameplay' });
  },
  
  startVoting: () => {
    set({ gameStage: 'voting', currentVotes: {} });
  },
  
  // Voting
  submitVote: (targetPlayerId) => {
    const localPlayerId = get().localPlayerId;
    if (!localPlayerId) return;
    
    set((state) => ({
      currentVotes: {
        ...state.currentVotes,
        [localPlayerId]: targetPlayerId
      },
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
      set({ gameStage: 'results' });
    }
  },
  
  // Getters
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
  }
}));
