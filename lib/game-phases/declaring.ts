import type { CardString, Suit } from "../card-types"
import type { Room, PlayerPosition, TrumpDeclaration } from "../room-types"
import { parseCard } from "../card-utils"
import { getNextPosition, advancePhase } from "../game-engine"

export interface DeclareResult {
  success: boolean
  room: Room
  message: string
}

/**
 * Validate that a player has the specified cards
 */
function playerHasCards(playerCards: CardString[], cardsToCheck: CardString[]): boolean {
  const cardCounts = new Map<CardString, number>()

  // Count player's cards
  for (const card of playerCards) {
    cardCounts.set(card, (cardCounts.get(card) || 0) + 1)
  }

  // Check if player has all the cards to declare
  for (const card of cardsToCheck) {
    const count = cardCounts.get(card) || 0
    if (count === 0) return false
    cardCounts.set(card, count - 1)
  }

  return true
}

/**
 * Get the strength of a declaration
 * Returns: { type: "single" | "pair" | "joker-pair", value: number }
 */
function getDeclarationStrength(cards: CardString[], trumpRank: string): {
  type: "single" | "pair" | "joker-pair"
  suit: Suit | null
  value: number
} | null {
  // Check for joker pair
  if (cards.length === 2) {
    const hasSmallJoker = cards.includes("SMALL_JOKER")
    const hasBigJoker = cards.includes("BIG_JOKER")

    if (hasSmallJoker && hasBigJoker) {
      return { type: "joker-pair", suit: null, value: 1000 } // Unbeatable
    }
  }

  // Check for pair of trump rank
  if (cards.length === 2) {
    const parsed1 = parseCard(cards[0])
    const parsed2 = parseCard(cards[1])

    if (
      !parsed1.isJoker &&
      !parsed2.isJoker &&
      parsed1.rank === trumpRank &&
      parsed2.rank === trumpRank &&
      parsed1.suit === parsed2.suit
    ) {
      return { type: "pair", suit: parsed1.suit!, value: 100 }
    }
  }

  // Check for single trump rank card
  if (cards.length === 1) {
    const parsed = parseCard(cards[0])
    if (!parsed.isJoker && parsed.rank === trumpRank) {
      return { type: "single", suit: parsed.suit!, value: 10 }
    }
  }

  return null // Invalid declaration
}

/**
 * Attempt to declare trump
 */
export function attemptDeclare(
  room: Room,
  playerId: string,
  cards: CardString[]
): DeclareResult {
  if (!room.gameState || room.gameState.phase !== "DECLARING") {
    return {
      success: false,
      room,
      message: "Cannot declare trump at this time",
    }
  }

  // Find the player
  const player = room.players.find((p) => p.id === playerId)
  if (!player) {
    return {
      success: false,
      room,
      message: "Player not found",
    }
  }

  // Validate player has these cards
  if (!playerHasCards(player.cards, cards)) {
    return {
      success: false,
      room,
      message: "You don't have these cards",
    }
  }

  // Get declaration strength
  const strength = getDeclarationStrength(cards, room.gameState.trumpRank!)
  if (!strength) {
    return {
      success: false,
      room,
      message: "Invalid declaration - must use trump rank cards",
    }
  }

  // Check if this beats the current declaration
  const currentDeclaration = room.gameState.trumpDeclarations[room.gameState.trumpDeclarations.length - 1]
  if (currentDeclaration) {
    const currentStrength = currentDeclaration.count
    if (strength.value <= currentStrength) {
      return {
        success: false,
        room,
        message: "Declaration must be stronger than current declaration",
      }
    }
  }

  // Valid declaration!
  const declaration: TrumpDeclaration = {
    player: player.position,
    cards: [...cards],
    suit: strength.suit!,
    count: strength.value,
  }

  const updatedGameState = {
    ...room.gameState,
    trumpSuit: strength.suit,
    declaringPlayer: player.position,
    trumpDeclarations: [...room.gameState.trumpDeclarations, declaration],
    turnToPlay: getNextPosition(player.position, room.maxPlayers),
  }

  // If joker pair, immediately finish declaring
  if (strength.type === "joker-pair") {
    return finishDeclaring({
      ...room,
      gameState: {
        ...updatedGameState,
        trumpSuit: null, // No trump suit with joker pair
      },
      updatedAt: Date.now(),
    })
  }

  return {
    success: true,
    room: {
      ...room,
      gameState: updatedGameState,
      updatedAt: Date.now(),
    },
    message: `Trump declared: ${strength.type === "pair" ? "Pair" : "Single"} of ${strength.suit}`,
  }
}

/**
 * Pass on declaring
 */
export function passDeclaring(room: Room, playerId: string): DeclareResult {
  if (!room.gameState || room.gameState.phase !== "DECLARING") {
    return {
      success: false,
      room,
      message: "Cannot pass at this time",
    }
  }

  const player = room.players.find((p) => p.id === playerId)
  if (!player) {
    return {
      success: false,
      room,
      message: "Player not found",
    }
  }

  // Move to next player
  const nextPlayer = getNextPosition(player.position, room.maxPlayers)

  // If we've gone full circle and someone has declared, finish declaring
  const hasDeclaration = room.gameState.trumpDeclarations.length > 0
  const isBackToDeclaringPlayer =
    hasDeclaration &&
    nextPlayer === room.gameState.trumpDeclarations[room.gameState.trumpDeclarations.length - 1].player

  if (isBackToDeclaringPlayer) {
    return finishDeclaring(room)
  }

  return {
    success: true,
    room: {
      ...room,
      gameState: {
        ...room.gameState,
        turnToPlay: nextPlayer,
      },
      updatedAt: Date.now(),
    },
    message: "Passed",
  }
}

/**
 * Finish declaring phase and move to burying
 */
export function finishDeclaring(room: Room): DeclareResult {
  if (!room.gameState || !room.gameState.declaringPlayer) {
    return {
      success: false,
      room,
      message: "No trump declaration found",
    }
  }

  // Award bottom deck to declaring player
  const updatedPlayers = room.players.map((p) => {
    if (p.position === room.gameState!.declaringPlayer) {
      return {
        ...p,
        cards: [...p.cards, ...room.gameState!.bottomDeck],
      }
    }
    return p
  })

  // Transition to burying phase
  const updatedRoom = advancePhase({
    ...room,
    players: updatedPlayers,
    gameState: {
      ...room.gameState,
      turnToPlay: room.gameState.declaringPlayer,
      bottomDeck: [], // Bottom deck now in declaring player's hand
    },
  })

  return {
    success: true,
    room: {
      ...updatedRoom,
      updatedAt: Date.now(),
    },
    message: "Declaring phase complete. Burying phase started.",
  }
}
