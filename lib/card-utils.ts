import type { CardString, Suit } from "./card-types"

export function parseCard(cardString: CardString): { suit?: Suit; rank?: string; isJoker: boolean } {
  if (cardString === "BIG_JOKER" || cardString === "SMALL_JOKER") {
    return { isJoker: true }
  }

  const parts = cardString.split("_")
  if (parts.length !== 2) {
    return { isJoker: false }
  }

  const suitMap: Record<string, Suit> = {
    H: "HEARTS",
    D: "DIAMONDS",
    C: "CLUBS",
    S: "SPADES",
  }

  return {
    suit: suitMap[parts[0]],
    rank: parts[1],
    isJoker: false,
  }
}

export function getCardDisplay(cardString: CardString): { suit: string; rank: string; color: string } {
  const parsed = parseCard(cardString)

  if (parsed.isJoker) {
    return {
      suit: cardString === "BIG_JOKER" ? "★" : "☆",
      rank: cardString === "BIG_JOKER" ? "Big" : "Small",
      color: cardString === "BIG_JOKER" ? "text-red-600" : "text-gray-700",
    }
  }

  const suitSymbols: Record<string, string> = {
    HEARTS: "♥",
    DIAMONDS: "♦",
    CLUBS: "♣",
    SPADES: "♠",
  }

  const color = parsed.suit === "HEARTS" || parsed.suit === "DIAMONDS" ? "text-red-600" : "text-gray-900"

  return {
    suit: suitSymbols[parsed.suit || "SPADES"],
    rank: parsed.rank || "",
    color,
  }
}

export function getCardPoints(cardString: CardString): number {
  const parsed = parseCard(cardString)
  if (parsed.isJoker) return 0

  switch (parsed.rank) {
    case "5":
      return 5
    case "10":
      return 10
    case "K":
      return 10
    default:
      return 0
  }
}

export function isTrumpCard(cardString: CardString, trumpSuit: Suit, trumpRank: string): boolean {
  const parsed = parseCard(cardString)

  // Jokers are always trump
  if (parsed.isJoker) return true

  // Cards of the trump suit are trump
  if (parsed.suit === trumpSuit) return true

  // Cards of the trump rank are trump
  if (parsed.rank === trumpRank) return true

  return false
}
