import type { CardString } from "../card-types"
import type { Room } from "../room-types"
import { parseCard, getCardPoints } from "../card-utils"
import { advancePhase, getNextPosition } from "../game-engine"

export interface BuryResult {
  success: boolean
  room: Room
  message: string
}

/**
 * Validate that a player has the specified cards
 */
function playerHasCards(playerCards: CardString[], cardsToBury: CardString[]): boolean {
  const cardCounts = new Map<CardString, number>()

  // Count player's cards
  for (const card of playerCards) {
    cardCounts.set(card, (cardCounts.get(card) || 0) + 1)
  }

  // Check if player has all the cards to bury
  for (const card of cardsToBury) {
    const count = cardCounts.get(card) || 0
    if (count === 0) return false
    cardCounts.set(card, count - 1)
  }

  return true
}

/**
 * Check if any cards are trump rank cards (usually not allowed to bury)
 */
function containsTrumpRankCards(cards: CardString[], trumpRank: string): boolean {
  for (const card of cards) {
    const parsed = parseCard(card)
    if (!parsed.isJoker && parsed.rank === trumpRank) {
      return true
    }
  }
  return false
}

/**
 * Bury cards and transition to playing phase
 */
export function buryCards(room: Room, playerId: string, cards: CardString[]): BuryResult {
  if (!room.gameState || room.gameState.phase !== "BURYING") {
    return {
      success: false,
      room,
      message: "Cannot bury cards at this time",
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

  // Must be the declaring player
  if (player.position !== room.gameState.declaringPlayer) {
    return {
      success: false,
      room,
      message: "Only the declaring player can bury cards",
    }
  }

  // Must bury exactly 8 cards (or 12 for 6-player game)
  const requiredBuryCount = room.maxPlayers === 4 ? 8 : 12
  if (cards.length !== requiredBuryCount) {
    return {
      success: false,
      room,
      message: `Must bury exactly ${requiredBuryCount} cards`,
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

  // Check for trump rank cards (common rule: can't bury trump rank)
  if (containsTrumpRankCards(cards, room.gameState.trumpRank!)) {
    return {
      success: false,
      room,
      message: "Cannot bury trump rank cards",
    }
  }

  // Calculate points in buried cards (will be doubled at end)
  const buriedPoints = cards.reduce((sum, card) => sum + getCardPoints(card), 0)

  // Remove buried cards from player's hand
  const remainingCards = player.cards.filter((card) => {
    const buryIndex = cards.indexOf(card)
    if (buryIndex >= 0) {
      cards.splice(buryIndex, 1) // Remove one instance
      return false
    }
    return true
  })

  // Update player's hand
  const updatedPlayers = room.players.map((p) => {
    if (p.position === player.position) {
      return {
        ...p,
        cards: remainingCards,
        team: "ATTACKER", // Declaring player's team is attacker
      }
    }

    // Assign teams to other players
    const isPartner =
      (player.position === "NORTH" && p.position === "SOUTH") ||
      (player.position === "SOUTH" && p.position === "NORTH") ||
      (player.position === "EAST" && p.position === "WEST") ||
      (player.position === "WEST" && p.position === "EAST")

    return {
      ...p,
      team: isPartner ? "ATTACKER" : "DEFENDER",
    }
  })

  // Transition to playing phase
  const firstToPlay = getNextPosition(room.gameState.dealer, room.maxPlayers)
  const updatedRoom = advancePhase({
    ...room,
    players: updatedPlayers,
    gameState: {
      ...room.gameState,
      buriedCards: cards,
      attackerPoints: buriedPoints, // Add buried points (will be doubled in scoring)
      turnToPlay: firstToPlay,
      currentRound: 1, // Start trick 1
    },
  })

  return {
    success: true,
    room: {
      ...updatedRoom,
      updatedAt: Date.now(),
    },
    message: `Cards buried. ${buriedPoints} points buried (will count double). Game starting!`,
  }
}
