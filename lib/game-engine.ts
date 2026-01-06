import type { CardString, Suit } from "./card-types"
import type { Room, RoomGameState, PlayerPosition } from "./room-types"

const SUITS: Suit[] = ["HEARTS", "DIAMONDS", "CLUBS", "SPADES"]
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]
const JOKERS: CardString[] = ["SMALL_JOKER", "BIG_JOKER"]

/**
 * Generate a full 108-card deck (2 standard decks + 4 jokers)
 */
function generateDeck(): CardString[] {
  const deck: CardString[] = []

  // Two decks of standard cards
  for (let deckNum = 0; deckNum < 2; deckNum++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push(`${suit[0]}_${rank}` as CardString)
      }
    }
    // Add 2 jokers per deck
    deck.push(...JOKERS)
  }

  return deck
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Deal cards to players
 * For 4 players: 25 cards each, 8 cards in bottom deck
 * For 6 players: 16 cards each, 12 cards in bottom deck
 */
export function dealCards(
  playerCount: 4 | 6
): {
  playerHands: Map<PlayerPosition, CardString[]>
  bottomDeck: CardString[]
} {
  const deck = shuffleArray(generateDeck())
  const playerHands = new Map<PlayerPosition, CardString[]>()

  const positions: PlayerPosition[] =
    playerCount === 4
      ? ["NORTH", "SOUTH", "EAST", "WEST"]
      : ["NORTH", "SOUTH", "EAST", "WEST", "OBSERVER_1", "OBSERVER_2"]

  const cardsPerPlayer = playerCount === 4 ? 25 : 16
  const bottomDeckSize = playerCount === 4 ? 8 : 12

  // Deal cards to each player
  let cardIndex = 0
  for (const position of positions) {
    const hand = deck.slice(cardIndex, cardIndex + cardsPerPlayer)
    playerHands.set(position, hand)
    cardIndex += cardsPerPlayer
  }

  // Remaining cards go to bottom deck
  const bottomDeck = deck.slice(cardIndex, cardIndex + bottomDeckSize)

  return { playerHands, bottomDeck }
}

/**
 * Get the next player position in turn order
 */
export function getNextPosition(
  current: PlayerPosition,
  playerCount: 4 | 6
): PlayerPosition {
  const positions: PlayerPosition[] =
    playerCount === 4
      ? ["NORTH", "EAST", "SOUTH", "WEST"]
      : ["NORTH", "EAST", "SOUTH", "WEST", "OBSERVER_1", "OBSERVER_2"]

  const currentIndex = positions.indexOf(current)
  const nextIndex = (currentIndex + 1) % positions.length
  return positions[nextIndex]
}

/**
 * Get player's partner position
 */
export function getPartnerPosition(position: PlayerPosition): PlayerPosition | null {
  switch (position) {
    case "NORTH":
      return "SOUTH"
    case "SOUTH":
      return "NORTH"
    case "EAST":
      return "WEST"
    case "WEST":
      return "EAST"
    default:
      return null // Observers don't have partners
  }
}

/**
 * Initialize game state when "Start Game" is clicked
 */
export function initializeGame(room: Room): Room {
  const playerCount = room.maxPlayers
  const { playerHands, bottomDeck } = dealCards(playerCount)

  // Determine dealer (for now, default to SOUTH, later can rotate based on history)
  const dealer: PlayerPosition = "SOUTH"
  const firstToAct = getNextPosition(dealer, playerCount)

  // Deal cards to players
  const updatedPlayers = room.players.map((player) => {
    const hand = playerHands.get(player.position) || []
    return {
      ...player,
      cards: hand,
      team: null, // Teams assigned after declaring phase
    }
  })

  // Initialize game state
  const gameState: RoomGameState = {
    trumpSuit: null, // Will be set during declaring
    trumpRank: "2", // Starting rank, can be configured later
    currentTrick: null,
    tricksHistory: [],
    attackerPoints: 0,
    defenderPoints: 0,
    turnToPlay: firstToAct,
    phase: "DECLARING",
    dealer,
    declaringPlayer: null,
    bottomDeck,
    trumpDeclarations: [],
    buriedCards: [],
    lastTrickWinner: null,
    currentRound: 0,
    pointsThreshold: 80, // Default threshold
  }

  return {
    ...room,
    status: "PLAYING",
    players: updatedPlayers,
    gameState,
    updatedAt: Date.now(),
  }
}

/**
 * Advance to the next phase
 */
export function advancePhase(room: Room): Room {
  if (!room.gameState) return room

  let nextPhase: RoomGameState["phase"]

  switch (room.gameState.phase) {
    case "DECLARING":
      nextPhase = "BURYING"
      break
    case "BURYING":
      nextPhase = "PLAYING"
      break
    case "PLAYING":
      nextPhase = "SCORING"
      break
    case "SCORING":
      // Game ended, handled separately
      return room
    default:
      return room
  }

  return {
    ...room,
    gameState: {
      ...room.gameState,
      phase: nextPhase,
    },
    updatedAt: Date.now(),
  }
}

/**
 * Reset game state for next round
 */
export function resetForNextGame(room: Room): Room {
  const oldDealer = room.gameState?.dealer || "SOUTH"
  const newDealer = getNextPosition(oldDealer, room.maxPlayers)

  return {
    ...room,
    status: "WAITING",
    players: room.players.map((p) => ({
      ...p,
      cards: [],
      team: null,
    })),
    gameState: null,
    updatedAt: Date.now(),
  }
}
