"use client"

import { useState } from "react"
import type { Room } from "@/lib/room-types"
import type { CardString } from "@/lib/card-types"
import { getCardPoints } from "@/lib/card-utils"
import { PlayingCard } from "../playing-card"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { cn } from "@/lib/utils"

interface BuryingPhaseProps {
  room: Room
  playerId: string
  onBury: (cards: CardString[]) => void
}

export function BuryingPhase({ room, playerId, onBury }: BuryingPhaseProps) {
  const [selectedCards, setSelectedCards] = useState<CardString[]>([])

  const currentPlayer = room.players.find((p) => p.id === playerId)
  const isDeclaringPlayer = currentPlayer?.position === room.gameState?.declaringPlayer

  if (!room.gameState) return null

  const requiredBuryCount = room.maxPlayers === 4 ? 8 : 12

  const handleCardClick = (card: CardString) => {
    if (!isDeclaringPlayer) return

    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter((c) => c !== card))
    } else {
      // Can select up to required count
      if (selectedCards.length < requiredBuryCount) {
        setSelectedCards([...selectedCards, card])
      }
    }
  }

  const handleBury = () => {
    if (selectedCards.length !== requiredBuryCount) return
    onBury(selectedCards)
    setSelectedCards([])
  }

  const totalPoints = selectedCards.reduce((sum, card) => sum + getCardPoints(card), 0)

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Burying Cards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">
            <strong>Declaring Player:</strong> {room.gameState.declaringPlayer}
            {isDeclaringPlayer && <span className="ml-2 text-primary font-semibold">(You)</span>}
          </div>

          <div className="text-sm">
            Select exactly {requiredBuryCount} cards to bury. Points in buried cards will count
            double for attackers.
          </div>

          {selectedCards.length > 0 && (
            <div className="text-sm">
              <strong>Selected:</strong> {selectedCards.length} / {requiredBuryCount} cards (
              {totalPoints} points, will count as {totalPoints * 2})
            </div>
          )}
        </CardContent>
      </Card>

      {/* Player's Hand */}
      {currentPlayer && isDeclaringPlayer && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {currentPlayer.cards.map((card, index) => {
                const isSelected = selectedCards.includes(card)

                return (
                  <div
                    key={`${card}-${index}`}
                    className={cn("transition-all", isSelected && "ring-2 ring-primary")}
                    onClick={() => handleCardClick(card)}
                  >
                    <PlayingCard
                      card={card}
                      trumpSuit={room.gameState?.trumpSuit || "HEARTS"}
                      trumpRank={room.gameState?.trumpRank || "2"}
                      className="cursor-pointer hover:scale-105"
                    />
                  </div>
                )
              })}
            </div>

            {/* Bury Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleBury}
                disabled={selectedCards.length !== requiredBuryCount}
                variant="default"
                size="lg"
              >
                Confirm Bury ({selectedCards.length}/{requiredBuryCount})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Waiting for declaring player */}
      {!isDeclaringPlayer && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground py-8">
              Waiting for {room.gameState.declaringPlayer} to bury {requiredBuryCount} cards...
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
