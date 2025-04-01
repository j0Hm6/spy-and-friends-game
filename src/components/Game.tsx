
import { useGameStore } from '@/hooks/use-game-store';
import { PlayerName } from './PlayerName';
import { Lobby } from './Lobby';
import { RoleReveal } from './RoleReveal';
import { GamePlay } from './GamePlay';
import { Voting } from './Voting';
import { Results } from './Results';

export const Game = () => {
  const gameStage = useGameStore(state => state.gameStage);
  const localPlayer = useGameStore(state => state.getLocalPlayer());
  
  // Show name input if player hasn't joined
  if (!localPlayer) {
    return <PlayerName />;
  }
  
  // Show appropriate component based on game stage
  switch (gameStage) {
    case 'join':
    case 'lobby':
      return <Lobby />;
    case 'reveal':
      return <RoleReveal />;
    case 'gameplay':
      return <GamePlay />;
    case 'voting':
      return <Voting />;
    case 'results':
      return <Results />;
    default:
      return <PlayerName />;
  }
};
