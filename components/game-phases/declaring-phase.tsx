"use client"

import { useState } from "react"
import type { Room } from "@/lib/room-types"
import type { CardString } from "@/lib/card-types"
import { PlayerHand } from "../player-hand"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

interface DeclaringPhaseProps {
  room: Room
  playerId: string
  onDeclare: (cards: CardString[]) => void
  onPass: () => void
}

export function DeclaringPhase({ room, playerId, onDeclare, onPass }: DeclaringPhaseProps) {
  const [selectedCards, setSelectedCards] = useState<CardString[]>([])

  const currentPlayer = room.players.find((p) => p.id === playerId)
  const isMyTurn = currentPlayer?.position === room.gameState?.turnToPlay

  if (!room.gameState) return null

  const handleCardClick = (card: CardString) => {
    if (!isMyTurn) return

    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter((c) => c !== card))
    } else {
      // Can only select up to 2 cards
      if (selectedCards.length < 2) {
        setSelectedCards([...selectedCards, card])
      }
    }
  }

  const handleDeclare = () => {
    if (selectedCards.length === 0) return
    onDeclare(selectedCards)
    setSelectedCards([])
  }

  const handlePass = () => {
    onPass()
    setSelectedCards([])
  }

  const lastDeclaration = room.gameState.trumpDeclarations[room.gameState.trumpDeclarations.length - 1]

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Declaring Trump</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">
            <strong>Trump Rank:</strong> {room.gameState.trumpRank}
          </div>

          {lastDeclaration && (
            <div className="text-sm">
              <strong>Current Declaration:</strong> {lastDeclaration.player} declared with{" "}
              {lastDeclaration.cards.length === 2 ? "a pair" : "a single card"}
              {lastDeclaration.suit && ` of ${lastDeclaration.suit}`}
            </div>
          )}

          {!lastDeclaration && (
            <div className="text-sm text-muted-foreground">
              No trump declared yet. Use trump rank cards to declare.
            </div>
          )}

          <div className="text-sm">
            <strong>Turn:</strong> {room.gameState.turnToPlay}
            {isMyTurn && <span className="ml-2 text-primary font-semibold">(Your turn)</span>}
          </div>
        </CardContent>
      </Card>

      {/* Player's Hand */}
      {currentPlayer && (
        <Card>
          <CardContent className="pt-6">
            <PlayerHand
              cards={currentPlayer.cards}
              onCardClick={handleCardClick}
              selectedCard={selectedCards[0]}
              trumpSuit={room.gameState.trumpSuit || "HEARTS"}
              trumpRank={room.gameState.trumpRank || "2"}
              className="mb-4"
            />

            {/* Show selected cards */}
            {selectedCards.length > 0 && (
              <div className="text-center text-sm text-muted-foreground mb-4">
                Selected: {selectedCards.length} card{selectedCards.length > 1 ? "s" : ""}
              </div>
            )}

            {/* Action Buttons */}
            {isMyTurn && (
              <div className="flex justify-center gap-4">
                <Button
                  onClick={handleDeclare}
                  disabled={selectedCards.length === 0}
                  variant="default"
                >
                  Declare Trump
                </Button>
                <Button onClick={handlePass} variant="outline">
                  Pass
                </Button>
              </div>
            )}

            {!isMyTurn && (
              <div className="text-center text-sm text-muted-foreground">
                Waiting for {room.gameState.turnToPlay} to act...
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Other Players */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Other Players</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {room.players
              .filter((p) => p.id !== playerId)
              .map((player) => (
                <div key={player.id} className="text-sm">
                  <strong>{player.position}:</strong> {player.cards.length} cards
                  {player.type === "AI" && " (AI)"}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
