import type { CardString, Suit } from "./card-types"
import type { RoomGameState, GameTrick, PlayerPosition } from "./room-types"
import { parseCard, isTrumpCard, getCardPoints } from "./card-utils"

interface AIDecision {
  card: CardString
  reasoning: string
}

function getSuitFromCard(card: CardString): Suit | null {
  if (card.includes("JOKER")) return null
  const prefix = card.split("_")[0]
  const suitMap: Record<string, Suit> = { H: "HEARTS", D: "DIAMONDS", C: "CLUBS", S: "SPADES" }
  return suitMap[prefix] || null
}

function canFollowSuit(hand: CardString[], leadSuit: Suit | null, trumpSuit: Suit | null): CardString[] {
  if (!leadSuit) return hand

  return hand.filter((card) => {
    const cardSuit = getSuitFromCard(card)
    return cardSuit === leadSuit
  })
}

function getValidPlays(
  hand: CardString[],
  currentTrick: GameTrick | null,
  trumpSuit: Suit | null,
  trumpRank: string | null,
): CardString[] {
  if (!currentTrick || currentTrick.cardsPlayed.length === 0) {
    // Leading - can play anything
    return hand
  }

  const leadSuit = currentTrick.leadSuit
  const followable = canFollowSuit(hand, leadSuit, trumpSuit)

  // Must follow suit if possible
  if (followable.length > 0) {
    return followable
  }

  // Can play anything if can't follow suit
  return hand
}

function evaluateCardStrength(card: CardString, trumpSuit: Suit | null, trumpRank: string | null): number {
  const parsed = parseCard(card)

  // Jokers are highest
  if (card === "BIG_JOKER") return 100
  if (card === "SMALL_JOKER") return 99

  const isTrump = trumpSuit && isTrumpCard(card, trumpSuit, trumpRank || "2")

  // Trump rank cards
  if (parsed.rank === trumpRank) {
    if (getSuitFromCard(card) === trumpSuit) return 98 // Main trump rank
    return 97 // Off-suit trump rank
  }

  const rankValues: Record<string, number> = {
    A: 14,
    K: 13,
    Q: 12,
    J: 11,
    "10": 10,
    "9": 9,
    "8": 8,
    "7": 7,
    "6": 6,
    "5": 5,
    "4": 4,
    "3": 3,
    "2": 2,
  }

  const baseValue = rankValues[parsed.rank || "2"] || 2

  // Trump cards are stronger
  if (isTrump) return baseValue + 50

  return baseValue
}

function isCurrentlyWinning(
  card: CardString,
  currentTrick: GameTrick,
  trumpSuit: Suit | null,
  trumpRank: string | null,
): boolean {
  const myStrength = evaluateCardStrength(card, trumpSuit, trumpRank)

  for (const play of currentTrick.cardsPlayed) {
    const playedStrength = evaluateCardStrength(play.card, trumpSuit, trumpRank)
    if (playedStrength > myStrength) return false
  }

  return true
}

export function makeAIDecision(
  hand: CardString[],
  gameState: RoomGameState,
  position: PlayerPosition,
  team: "ATTACKER" | "DEFENDER",
): AIDecision {
  const { trumpSuit, trumpRank, currentTrick } = gameState

  const validPlays = getValidPlays(hand, currentTrick, trumpSuit, trumpRank)

  if (validPlays.length === 0) {
    return { card: hand[0], reasoning: "No valid plays, playing first card" }
  }

  if (validPlays.length === 1) {
    return { card: validPlays[0], reasoning: "Only one valid play" }
  }

  // Leading the trick
  if (!currentTrick || currentTrick.cardsPlayed.length === 0) {
    // As attacker, lead with strong cards to establish control
    // As defender, lead from long suits

    // Simple strategy: lead lowest non-point card
    const nonPointCards = validPlays.filter((c) => getCardPoints(c) === 0)
    if (nonPointCards.length > 0) {
      const sorted = nonPointCards.sort(
        (a, b) => evaluateCardStrength(a, trumpSuit, trumpRank) - evaluateCardStrength(b, trumpSuit, trumpRank),
      )
      return { card: sorted[0], reasoning: "Leading with low non-point card" }
    }

    // Lead lowest card
    const sorted = validPlays.sort(
      (a, b) => evaluateCardStrength(a, trumpSuit, trumpRank) - evaluateCardStrength(b, trumpSuit, trumpRank),
    )
    return { card: sorted[0], reasoning: "Leading with lowest card" }
  }

  // Following the trick
  const pointsOnTable = currentTrick.cardsPlayed.reduce((sum, p) => sum + getCardPoints(p.card), 0)

  // Check if partner is winning
  const partnerPositions: Record<PlayerPosition, PlayerPosition | null> = {
    SOUTH: "NORTH",
    NORTH: "SOUTH",
    EAST: "WEST",
    WEST: "EAST",
    OBSERVER_1: null,
    OBSERVER_2: null,
  }
  const partnerPos = partnerPositions[position]
  const partnerPlay = partnerPos ? currentTrick.cardsPlayed.find((p) => p.player === partnerPos) : null
  const partnerWinning = partnerPlay && isCurrentlyWinning(partnerPlay.card, currentTrick, trumpSuit, trumpRank)

  if (partnerWinning) {
    // Partner is winning - throw points if possible
    const pointCards = validPlays.filter((c) => getCardPoints(c) > 0)
    if (pointCards.length > 0 && pointsOnTable < 30) {
      return { card: pointCards[0], reasoning: "Adding points for partner" }
    }
    // Otherwise play lowest card
    const sorted = validPlays.sort(
      (a, b) => evaluateCardStrength(a, trumpSuit, trumpRank) - evaluateCardStrength(b, trumpSuit, trumpRank),
    )
    return { card: sorted[0], reasoning: "Partner winning, playing low" }
  }

  // Need to try to win
  if (pointsOnTable >= 20) {
    // Worth trying to win
    const winningCards = validPlays.filter((c) => isCurrentlyWinning(c, currentTrick, trumpSuit, trumpRank))

    if (winningCards.length > 0) {
      // Win with lowest winning card
      const sorted = winningCards.sort(
        (a, b) => evaluateCardStrength(a, trumpSuit, trumpRank) - evaluateCardStrength(b, trumpSuit, trumpRank),
      )
      return { card: sorted[0], reasoning: `Winning ${pointsOnTable} points with lowest winning card` }
    }
  }

  // Can't win or not worth it - play lowest
  const sorted = validPlays.sort(
    (a, b) => evaluateCardStrength(a, trumpSuit, trumpRank) - evaluateCardStrength(b, trumpSuit, trumpRank),
  )
  return { card: sorted[0], reasoning: "Cannot win profitably, playing lowest" }
}
