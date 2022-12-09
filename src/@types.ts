export interface ExpressError {
  status?: number;
  message?: string;
}

export interface RoomData {
  grid: string[][]
  room: string
  playerId: string
  currentTurn: string
}
