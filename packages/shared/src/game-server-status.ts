export interface GameServerStatus {
  online: boolean;
  players: number;
  maxPlayers: number;
  playerNames: string[];
  ping: number;
  map: string;
}
