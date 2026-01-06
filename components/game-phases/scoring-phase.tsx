"use client"

import type { Room } from "@/lib/room-types"
import type { GameResult } from "@/lib/game-phases/scoring"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Trophy, TrendingUp } from "lucide-react"

interface ScoringPhaseProps {
  room: Room
  result: GameResult | null
  onPlayAgain: () => void
}

export function ScoringPhase({ room, result, onPlayAgain }: ScoringPhaseProps) {
  if (!result) return null

  const isHost = room.players.some((p) => p.id === room.hostId)

  return (
    <div className="space-y-4">
      {/* Winner Announcement */}
      <Card className="border-4 border-primary">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Trophy className="w-16 h-16 mx-auto text-amber-500" />
            <div>
              <h2 className="text-3xl font-bold">
                {result.winner === "ATTACKER" ? "Attackers Win!" : "Defenders Win!"}
              </h2>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Attackers (Regular Points)</span>
              <Badge variant="default">{result.attackerPoints}</Badge>
            </div>

            <div className="flex justify-between items-center">
              <span>Buried Cards (Doubled)</span>
              <Badge variant="default">
                {result.buriedPoints} × 2 = {result.buriedPoints * 2}
              </Badge>
            </div>

            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total Attacker Points</span>
              <Badge variant="default" className="text-lg px-4">
                {result.totalAttackerPoints}
              </Badge>
            </div>

            <div className="border-t pt-2 mt-2" />

            <div className="flex justify-between items-center">
              <span>Defender Points</span>
              <Badge variant="secondary">{result.defenderPoints}</Badge>
            </div>

            <div className="border-t pt-2 mt-2" />

            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Threshold</span>
              <span>{result.threshold}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rank Changes */}
      <Card>
        <CardHeader>
          <CardTitle>Rank Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {result.rankChange.attackers > 0 && (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span>
                  Attackers level up: <strong>+{result.rankChange.attackers}</strong>
                </span>
              </div>
            )}

            {result.rankChange.attackers === 0 && result.winner === "ATTACKER" && (
              <div className="flex items-center gap-2">
                <span>Attackers maintain rank (80-119 points)</span>
              </div>
            )}

            {result.rankChange.defenders > 0 && (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span>
                  Defenders level up: <strong>+{result.rankChange.defenders}</strong>
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Game Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Game Statistics</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <div>
            <strong>Tricks Played:</strong> {room.gameState?.tricksHistory.length || 0}
          </div>
          <div>
            <strong>Trump:</strong> {room.gameState?.trumpRank} of{" "}
            {room.gameState?.trumpSuit || "No Suit"}
          </div>
          <div>
            <strong>Declaring Player:</strong> {room.gameState?.declaringPlayer}
          </div>
        </CardContent>
      </Card>

      {/* Play Again Button */}
      {isHost && (
        <div className="flex justify-center">
          <Button onClick={onPlayAgain} size="lg" className="w-full max-w-md">
            Play Again
          </Button>
        </div>
      )}

      {!isHost && (
        <div className="text-center text-sm text-muted-foreground">
          Waiting for host to start next game...
        </div>
      )}
    </div>
  )
}
