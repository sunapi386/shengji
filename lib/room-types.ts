import type { CardString, Suit } from "./card-types"

export type PlayerPosition = "NORTH" | "SOUTH" | "EAST" | "WEST" | "OBSERVER_1" | "OBSERVER_2"
export type PlayerType = "HUMAN" | "AI"
export type RoomStatus = "WAITING" | "PLAYING" | "FINISHED"

export interface RoomPlayer {
  id: string
  name: string
  position: PlayerPosition
  type: PlayerType
  connected: boolean
  cards: CardString[]
  team: "ATTACKER" | "DEFENDER" | null
}

export interface GameTrick {
  leadPlayer: PlayerPosition
  leadSuit: Suit | null
  cardsPlayed: { player: PlayerPosition; card: CardString }[]
  winner: PlayerPosition | null
  pointsWon: number
}

export interface TrumpDeclaration {
  player: PlayerPosition
  cards: CardString[]
  suit: Suit
  count: number
}

export interface RoomGameState {
  trumpSuit: Suit | null
  trumpRank: string | null
  currentTrick: GameTrick | null
  tricksHistory: GameTrick[]
  attackerPoints: number
  defenderPoints: number
  turnToPlay: PlayerPosition | null
  phase: "DECLARING" | "BURYING" | "PLAYING" | "SCORING"
  dealer: PlayerPosition
  declaringPlayer: PlayerPosition | null
  bottomDeck: CardString[]
  trumpDeclarations: TrumpDeclaration[]
  buriedCards: CardString[]
  lastTrickWinner: PlayerPosition | null
  currentRound: number
  pointsThreshold: number
}

export interface Room {
  id: string
  code: string // 6-character join code
  hostId: string
  status: RoomStatus
  players: RoomPlayer[]
  maxPlayers: 4 | 6
  gameState: RoomGameState | null
  createdAt: number
  updatedAt: number
}

export interface GameHistoryEntry {
  id: string
  roomId: string
  roomCode: string
  playerNames: string[]
  attackerPoints: number
  defenderPoints: number
  winner: "ATTACKER" | "DEFENDER"
  trumpSuit: Suit
  trumpRank: string
  tricksCount: number
  playedAt: number
  duration: number // seconds
}
