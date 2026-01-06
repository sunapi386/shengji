// Card suits and ranks for Shengji
export type Suit = "HEARTS" | "DIAMONDS" | "CLUBS" | "SPADES"
export type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A"
export type JokerType = "SMALL_JOKER" | "BIG_JOKER"

export interface PlayingCard {
  suit: Suit
  rank: Rank
  isTrump?: boolean
  isMainTrump?: boolean
}

export interface JokerCard {
  type: JokerType
  isTrump: true
}

export type Card = PlayingCard | JokerCard

export type CardString = string // Format: "H_K" (Hearts King), "D_10", "BIG_JOKER", etc.

export interface PlayerHand {
  position: "NORTH" | "SOUTH" | "EAST" | "WEST"
  role: "ATTACKER" | "DEFENDER"
  cards: CardString[]
}

export interface GameState {
  trumpSuit: Suit
  trumpRank: Rank
  dealer: "NORTH" | "SOUTH" | "EAST" | "WEST"
  turnToPlay: "NORTH" | "SOUTH" | "EAST" | "WEST"
}

export interface CurrentTrick {
  leadSuit: Suit
  cardsPlayed: {
    player: "NORTH" | "SOUTH" | "EAST" | "WEST"
    card: CardString
  }[]
}

export interface Solution {
  move: CardString
  isCorrect: boolean | "partial"
  feedback: string
}

export interface DrillScenario {
  scenarioId: string
  title: string
  description: string
  gameState: GameState
  players: PlayerHand[]
  currentTrick: CurrentTrick
  solutions: Solution[]
}
