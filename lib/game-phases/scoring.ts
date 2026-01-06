import type { Room } from "../room-types"
import { getCardPoints } from "../card-utils"
import { resetForNextGame } from "../game-engine"

export interface GameResult {
  winner: "ATTACKER" | "DEFENDER"
  attackerPoints: number
  defenderPoints: number
  buriedPoints: number
  totalAttackerPoints: number
  totalDefenderPoints: number
  threshold: number
  rankChange: {
    attackers: number
    defenders: number
  }
}

/**
 * Calculate the final score and determine winner
 */
export function calculateFinalScore(room: Room): GameResult | null {
  if (!room.gameState || room.gameState.phase !== "SCORING") {
    return null
  }

  // Calculate points from buried cards (doubled for attackers)
  const buriedPoints = room.gameState.buriedCards.reduce((sum, card) => {
    return sum + getCardPoints(card)
  }, 0)

  const buriedPointsDoubled = buriedPoints * 2

  // Total points
  const totalAttackerPoints = room.gameState.attackerPoints + buriedPointsDoubled
  const totalDefenderPoints = room.gameState.defenderPoints

  const threshold = room.gameState.pointsThreshold

  // Determine winner and rank changes
  let winner: "ATTACKER" | "DEFENDER"
  let attackerRankChange = 0
  let defenderRankChange = 0

  if (totalAttackerPoints >= threshold) {
    winner = "ATTACKER"

    // Calculate level up based on points
    if (totalAttackerPoints >= 220) {
      attackerRankChange = 4
    } else if (totalAttackerPoints >= 195) {
      attackerRankChange = 3
    } else if (totalAttackerPoints >= 160) {
      attackerRankChange = 2
    } else if (totalAttackerPoints >= 120) {
      attackerRankChange = 1
    } else {
      attackerRankChange = 0 // Just maintain rank
    }
  } else {
    winner = "DEFENDER"
    defenderRankChange = 1 // Defenders level up when attackers fail
  }

  return {
    winner,
    attackerPoints: room.gameState.attackerPoints,
    defenderPoints: room.gameState.defenderPoints,
    buriedPoints,
    totalAttackerPoints,
    totalDefenderPoints,
    threshold,
    rankChange: {
      attackers: attackerRankChange,
      defenders: defenderRankChange,
    },
  }
}

/**
 * Setup the next game
 */
export function setupNextGame(room: Room, result: GameResult): Room {
  // For now, just reset to waiting state
  // In a full implementation, you would:
  // - Rotate dealer
  // - Update player ranks
  // - Maintain game history

  return resetForNextGame(room)
}
