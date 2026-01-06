import type { CardString, Suit } from "../card-types"
import type { Room, GameTrick, PlayerPosition } from "../room-types"
import { parseCard, isTrumpCard, getCardPoints } from "../card-utils"
import { getNextPosition, advancePhase } from "../game-engine"

export interface PlayResult {
  success: boolean
  room: Room
  message: string
  trickComplete?: boolean
}

/**
 * Get suit from card
 */
function getSuitFromCard(card: CardString): Suit | null {
  if (card.includes("JOKER")) return null
  const parsed = parseCard(card)
  return parsed.suit || null
}

/**
 * Get cards that can follow the lead suit
 */
function canFollowSuit(
  hand: CardString[],
  leadSuit: Suit | null,
  trumpSuit: Suit | null,
  trumpRank: string | null
): CardString[] {
  if (!leadSuit) return hand

  // If lead is trump, must follow trump
  const leadIsTrump = leadSuit === trumpSuit

  if (leadIsTrump) {
    return hand.filter((card) => isTrumpCard(card, trumpSuit!, trumpRank!))
  }

  // Otherwise follow lead suit (excluding trump)
  return hand.filter((card) => {
    if (isTrumpCard(card, trumpSuit || "HEARTS", trumpRank || "2")) return false
    const cardSuit = getSuitFromCard(card)
    return cardSuit === leadSuit
  })
}

/**
 * Get valid cards player can play
 */
export function getValidPlays(
  hand: CardString[],
  currentTrick: GameTrick | null,
  trumpSuit: Suit | null,
  trumpRank: string | null
): CardString[] {
  if (!currentTrick || currentTrick.cardsPlayed.length === 0) {
    // Leading - can play anything
    return hand
  }

  const leadSuit = currentTrick.leadSuit
  const followable = canFollowSuit(hand, leadSuit, trumpSuit, trumpRank)

  // Must follow suit if possible
  if (followable.length > 0) {
    return followable
  }

  // Can play anything if can't follow suit
  return hand
}

/**
 * Evaluate card strength for comparison
 */
export function evaluateCardStrength(
  card: CardString,
  trumpSuit: Suit | null,
  trumpRank: string | null,
  leadSuit: Suit | null
): number {
  const parsed = parseCard(card)

  // Jokers are highest
  if (card === "BIG_JOKER") return 100
  if (card === "SMALL_JOKER") return 99

  const cardSuit = getSuitFromCard(card)
  const isTrump = isTrumpCard(card, trumpSuit || "HEARTS", trumpRank || "2")

  // Trump rank cards
  if (parsed.rank === trumpRank) {
    if (cardSuit === trumpSuit) return 98 // Main trump rank in trump suit
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

  // Trump cards beat non-trump
  if (isTrump) return baseValue + 50

  // Non-trump, non-lead suit cards are weak
  if (leadSuit && cardSuit !== leadSuit) return 0

  return baseValue
}

/**
 * Determine the winner of a trick
 */
export function determineTrickWinner(
  trick: GameTrick,
  trumpSuit: Suit | null,
  trumpRank: string | null
): { winner: PlayerPosition; points: number } {
  if (trick.cardsPlayed.length === 0) {
    throw new Error("Cannot determine winner of empty trick")
  }

  let winningPlay = trick.cardsPlayed[0]
  let winningStrength = evaluateCardStrength(
    winningPlay.card,
    trumpSuit,
    trumpRank,
    trick.leadSuit
  )

  // Find the strongest card
  for (let i = 1; i < trick.cardsPlayed.length; i++) {
    const play = trick.cardsPlayed[i]
    const strength = evaluateCardStrength(play.card, trumpSuit, trumpRank, trick.leadSuit)

    if (strength > winningStrength) {
      winningPlay = play
      winningStrength = strength
    }
  }

  // Calculate points in trick
  const points = trick.cardsPlayed.reduce((sum, play) => {
    return sum + getCardPoints(play.card)
  }, 0)

  return {
    winner: winningPlay.player,
    points,
  }
}

/**
 * Validate if a card play is legal
 */
export function isValidPlay(
  card: CardString,
  hand: CardString[],
  currentTrick: GameTrick | null,
  trumpSuit: Suit | null,
  trumpRank: string | null
): boolean {
  // Must have the card
  if (!hand.includes(card)) return false

  // Get valid plays
  const validPlays = getValidPlays(hand, currentTrick, trumpSuit, trumpRank)

  return validPlays.includes(card)
}

/**
 * Play a card to the current trick
 */
export function playCard(room: Room, playerId: string, card: CardString): PlayResult {
  if (!room.gameState || room.gameState.phase !== "PLAYING") {
    return {
      success: false,
      room,
      message: "Cannot play cards at this time",
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

  // Check if it's player's turn
  if (player.position !== room.gameState.turnToPlay) {
    return {
      success: false,
      room,
      message: "Not your turn",
    }
  }

  // Validate the play
  if (
    !isValidPlay(
      card,
      player.cards,
      room.gameState.currentTrick,
      room.gameState.trumpSuit,
      room.gameState.trumpRank
    )
  ) {
    return {
      success: false,
      room,
      message: "Invalid card play - must follow suit if able",
    }
  }

  // Initialize trick if first card
  let currentTrick = room.gameState.currentTrick
  if (!currentTrick) {
    const cardSuit = getSuitFromCard(card)
    const isLeadTrump = isTrumpCard(
      card,
      room.gameState.trumpSuit || "HEARTS",
      room.gameState.trumpRank || "2"
    )

    currentTrick = {
      leadPlayer: player.position,
      leadSuit: isLeadTrump ? room.gameState.trumpSuit : cardSuit,
      cardsPlayed: [],
      winner: null,
      pointsWon: 0,
    }
  }

  // Add card to trick
  currentTrick = {
    ...currentTrick,
    cardsPlayed: [...currentTrick.cardsPlayed, { player: player.position, card }],
  }

  // Remove card from player's hand
  const updatedPlayers = room.players.map((p) => {
    if (p.id === playerId) {
      return {
        ...p,
        cards: p.cards.filter((c) => c !== card),
      }
    }
    return p
  })

  // Check if trick is complete (all 4 or 6 players played)
  const playingPlayerCount = room.players.filter((p) => p.team !== null).length
  const trickComplete = currentTrick.cardsPlayed.length === playingPlayerCount

  if (trickComplete) {
    return completeTrick({
      ...room,
      players: updatedPlayers,
      gameState: {
        ...room.gameState,
        currentTrick,
      },
    })
  }

  // Move to next player
  const nextPlayer = getNextPosition(player.position, room.maxPlayers)

  return {
    success: true,
    room: {
      ...room,
      players: updatedPlayers,
      gameState: {
        ...room.gameState,
        currentTrick,
        turnToPlay: nextPlayer,
      },
      updatedAt: Date.now(),
    },
    message: "Card played",
    trickComplete: false,
  }
}

/**
 * Complete a trick and determine winner
 */
export function completeTrick(room: Room): PlayResult {
  if (!room.gameState || !room.gameState.currentTrick) {
    return {
      success: false,
      room,
      message: "No trick in progress",
    }
  }

  const trick = room.gameState.currentTrick

  // Determine winner
  const { winner, points } = determineTrickWinner(
    trick,
    room.gameState.trumpSuit,
    room.gameState.trumpRank
  )

  // Find winner's team
  const winningPlayer = room.players.find((p) => p.position === winner)
  const winningTeam = winningPlayer?.team

  // Award points
  let updatedAttackerPoints = room.gameState.attackerPoints
  let updatedDefenderPoints = room.gameState.defenderPoints

  if (winningTeam === "ATTACKER") {
    updatedAttackerPoints += points
  } else if (winningTeam === "DEFENDER") {
    updatedDefenderPoints += points
  }

  // Complete trick
  const completedTrick: GameTrick = {
    ...trick,
    winner,
    pointsWon: points,
  }

  // Add to history
  const tricksHistory = [...room.gameState.tricksHistory, completedTrick]

  // Check if game is over (all cards played)
  const maxTricks = room.maxPlayers === 4 ? 25 : 16
  const gameOver = tricksHistory.length >= maxTricks

  if (gameOver) {
    // Transition to scoring phase
    const scoringRoom = advancePhase({
      ...room,
      gameState: {
        ...room.gameState,
        currentTrick: null,
        tricksHistory,
        attackerPoints: updatedAttackerPoints,
        defenderPoints: updatedDefenderPoints,
        lastTrickWinner: winner,
      },
    })

    return {
      success: true,
      room: {
        ...scoringRoom,
        updatedAt: Date.now(),
      },
      message: `Trick won by ${winner}. Game complete!`,
      trickComplete: true,
    }
  }

  // Next trick - winner leads
  return {
    success: true,
    room: {
      ...room,
      gameState: {
        ...room.gameState,
        currentTrick: null,
        tricksHistory,
        attackerPoints: updatedAttackerPoints,
        defenderPoints: updatedDefenderPoints,
        turnToPlay: winner,
        lastTrickWinner: winner,
        currentRound: room.gameState.currentRound + 1,
      },
      updatedAt: Date.now(),
    },
    message: `Trick won by ${winner} for ${points} points`,
    trickComplete: true,
  }
}
