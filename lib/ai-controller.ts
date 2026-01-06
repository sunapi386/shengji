import type { Room, RoomPlayer } from "./room-types"
import type { CardString } from "./card-types"
import { parseCard, getCardPoints } from "./card-utils"
import { attemptDeclare, passDeclaring } from "./game-phases/declaring"
import { buryCards } from "./game-phases/burying"
import { playCard } from "./game-phases/playing"
import { makeAIDecision } from "./ai-player"

/**
 * Check if AI should act (current turn player is AI)
 */
export function shouldAIAct(room: Room): boolean {
  if (!room.gameState || room.status !== "PLAYING") return false

  const currentPlayer = room.players.find((p) => p.position === room.gameState?.turnToPlay)

  return currentPlayer?.type === "AI"
}

/**
 * Delay helper for realistic AI timing
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * AI logic for declaring phase
 */
function aiDeclareDuringDeclaring(room: Room, aiPlayer: RoomPlayer): Room {
  if (!room.gameState) return room

  const trumpRank = room.gameState.trumpRank!

  // Count trump rank cards
  const trumpRankCards = aiPlayer.cards.filter((card) => {
    const parsed = parseCard(card)
    return !parsed.isJoker && parsed.rank === trumpRank
  })

  // Check for joker pair
  const hasSmallJoker = aiPlayer.cards.includes("SMALL_JOKER")
  const hasBigJoker = aiPlayer.cards.includes("BIG_JOKER")

  if (hasSmallJoker && hasBigJoker) {
    // Declare with joker pair immediately
    const result = attemptDeclare(room, aiPlayer.id, ["SMALL_JOKER", "BIG_JOKER"])
    return result.room
  }

  // Check for pairs of trump rank
  const suitCounts = new Map<string, CardString[]>()
  for (const card of trumpRankCards) {
    const parsed = parseCard(card)
    const suit = parsed.suit || "UNKNOWN"
    const existing = suitCounts.get(suit) || []
    suitCounts.set(suit, [...existing, card])
  }

  // Try to declare with a pair
  for (const [_, cards] of suitCounts) {
    if (cards.length >= 2) {
      const result = attemptDeclare(room, aiPlayer.id, [cards[0], cards[1]])
      if (result.success) return result.room
    }
  }

  // Try to declare with a single card if hand is strong
  if (trumpRankCards.length >= 2) {
    // Have multiple trump rank cards, worth declaring
    const result = attemptDeclare(room, aiPlayer.id, [trumpRankCards[0]])
    if (result.success) return result.room
  }

  // Otherwise pass
  const result = passDeclaring(room, aiPlayer.id)
  return result.room
}

/**
 * AI logic for burying phase
 */
function aiBuryCards(room: Room, aiPlayer: RoomPlayer): Room {
  if (!room.gameState) return room

  const requiredBuryCount = room.maxPlayers === 4 ? 8 : 12
  const trumpRank = room.gameState.trumpRank!

  // Strategy: Bury low-value non-trump cards, avoid burying points if possible
  // Create voids in short suits

  const trumpRankCards = aiPlayer.cards.filter((card) => {
    const parsed = parseCard(card)
    return !parsed.isJoker && parsed.rank === trumpRank
  })

  const nonTrumpRankCards = aiPlayer.cards.filter((card) => {
    const parsed = parseCard(card)
    return parsed.isJoker || parsed.rank !== trumpRank
  })

  // Prefer to bury non-trump-rank cards
  const cardsToBury: CardString[] = []

  // Sort by point value (bury low-point cards first)
  const sorted = nonTrumpRankCards.sort((a, b) => {
    const aPoints = getCardPoints(a)
    const bPoints = getCardPoints(b)
    return aPoints - bPoints
  })

  // Take first N cards
  for (let i = 0; i < Math.min(requiredBuryCount, sorted.length); i++) {
    cardsToBury.push(sorted[i])
  }

  // If not enough, we have a problem (shouldn't happen in valid game)
  if (cardsToBury.length < requiredBuryCount) {
    // This means we only have trump rank cards, which we can't bury
    // This should be validated earlier, but handle gracefully
    return room
  }

  const result = buryCards(room, aiPlayer.id, cardsToBury)
  return result.room
}

/**
 * AI logic for playing phase
 */
function aiPlayCard(room: Room, aiPlayer: RoomPlayer): Room {
  if (!room.gameState) return room

  // Use existing AI decision logic
  const decision = makeAIDecision(
    aiPlayer.cards,
    room.gameState,
    aiPlayer.position,
    aiPlayer.team!
  )

  const result = playCard(room, aiPlayer.id, decision.card)
  return result.room
}

/**
 * Execute AI turn based on current phase
 */
export async function executeAITurn(room: Room): Promise<Room> {
  if (!shouldAIAct(room) || !room.gameState) return room

  const currentPlayer = room.players.find((p) => p.position === room.gameState?.turnToPlay)
  if (!currentPlayer || currentPlayer.type !== "AI") return room

  // Add realistic delay
  await delay(500 + Math.random() * 1000) // 500-1500ms

  let updatedRoom = room

  switch (room.gameState.phase) {
    case "DECLARING":
      updatedRoom = aiDeclareDuringDeclaring(room, currentPlayer)
      break

    case "BURYING":
      updatedRoom = aiBuryCards(room, currentPlayer)
      break

    case "PLAYING":
      updatedRoom = aiPlayCard(room, currentPlayer)
      break

    case "SCORING":
      // AI doesn't act during scoring
      break
  }

  return updatedRoom
}
