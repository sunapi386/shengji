"use client"

import type { Room } from "@/lib/room-types"
import type { CardString } from "@/lib/card-types"
import { CardTable } from "../card-table"
import { PlayerHand } from "../player-hand"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { getValidPlays } from "@/lib/game-phases/playing"

interface PlayingPhaseProps {
  room: Room
  playerId: string
  onPlayCard: (card: CardString) => void
}

export function PlayingPhase({ room, playerId, onPlayCard }: PlayingPhaseProps) {
  const currentPlayer = room.players.find((p) => p.id === playerId)
  const isMyTurn = currentPlayer?.position === room.gameState?.turnToPlay

  if (!room.gameState) return null

  // Prepare players for CardTable
  const tablePlayers = room.players
    .filter((p) => p.team !== null)
    .map((p) => ({
      position: p.position as "NORTH" | "SOUTH" | "EAST" | "WEST",
      label: p.name,
      role: p.team,
      cardCount: p.cards.length,
    }))

  // Prepare current trick for CardTable
  const trickCards = room.gameState.currentTrick?.cardsPlayed || []

  // Get valid plays for current player
  const validPlays = currentPlayer
    ? getValidPlays(
        currentPlayer.cards,
        room.gameState.currentTrick,
        room.gameState.trumpSuit,
        room.gameState.trumpRank
      )
    : []

  const disabledCards = currentPlayer?.cards.filter((card) => !validPlays.includes(card)) || []

  return (
    <div className="space-y-4">
      {/* Score Display */}
      <div className="flex justify-between items-center gap-4">
        <Badge variant="default" className="px-4 py-2 text-lg">
          Attackers: {room.gameState.attackerPoints}
        </Badge>

        <div className="text-sm text-muted-foreground">
          <div>Round {room.gameState.currentRound} / 25</div>
          <div>Trump: {room.gameState.trumpRank} of {room.gameState.trumpSuit || "No Suit"}</div>
        </div>

        <Badge variant="secondary" className="px-4 py-2 text-lg">
          Defenders: {room.gameState.defenderPoints}
        </Badge>
      </div>

      {/* Card Table */}
      <CardTable
        players={tablePlayers}
        currentTrick={trickCards}
        trumpSuit={room.gameState.trumpSuit || "HEARTS"}
        trumpRank={room.gameState.trumpRank || "2"}
      />

      {/* Current Player's Hand */}
      {currentPlayer && (
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 text-center">
              {isMyTurn ? (
                <p className="text-sm font-semibold text-primary">Your turn!</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Waiting for {room.gameState.turnToPlay}...
                </p>
              )}
            </div>

            <PlayerHand
              cards={currentPlayer.cards}
              onCardClick={isMyTurn ? onPlayCard : undefined}
              disabledCards={disabledCards}
              trumpSuit={room.gameState.trumpSuit || "HEARTS"}
              trumpRank={room.gameState.trumpRank || "2"}
            />

            {isMyTurn && disabledCards.length > 0 && (
              <div className="text-xs text-muted-foreground text-center mt-2">
                You must follow suit if able
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Last Trick Info */}
      {room.gameState.lastTrickWinner && (
        <div className="text-sm text-center text-muted-foreground">
          Last trick won by: {room.gameState.lastTrickWinner}
        </div>
      )}
    </div>
  )
}
