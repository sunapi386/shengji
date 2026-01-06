"use client"

import { cn } from "@/lib/utils"
import type { CardString } from "@/lib/card-types"
import { PlayingCard, CardBack } from "./playing-card"

interface PlayerPosition {
  position: "NORTH" | "SOUTH" | "EAST" | "WEST"
  label: string
  role?: "ATTACKER" | "DEFENDER"
  cardCount?: number
  playedCard?: CardString
}

interface CardTableProps {
  players: PlayerPosition[]
  currentTrick: {
    player: string
    card: CardString
  }[]
  trumpSuit: string
  trumpRank: string
  className?: string
}

export function CardTable({ players, currentTrick, trumpSuit, trumpRank, className }: CardTableProps) {
  const getPlayerPosition = (position: string) => {
    switch (position) {
      case "NORTH":
        return "top-4 left-1/2 -translate-x-1/2"
      case "SOUTH":
        return "bottom-4 left-1/2 -translate-x-1/2"
      case "EAST":
        return "right-4 top-1/2 -translate-y-1/2"
      case "WEST":
        return "left-4 top-1/2 -translate-y-1/2"
      default:
        return ""
    }
  }

  const getTrickCardPosition = (position: string) => {
    switch (position) {
      case "NORTH":
        return "top-1/4 left-1/2 -translate-x-1/2"
      case "SOUTH":
        return "bottom-1/4 left-1/2 -translate-x-1/2"
      case "EAST":
        return "right-1/4 top-1/2 -translate-y-1/2"
      case "WEST":
        return "left-1/4 top-1/2 -translate-y-1/2"
      default:
        return ""
    }
  }

  return (
    <div
      className={cn(
        "relative w-full aspect-[4/3] rounded-2xl",
        "bg-gradient-to-br from-felt-green to-felt-dark",
        "shadow-2xl border-4 border-secondary",
        className,
      )}
    >
      {/* Player positions */}
      {players.map((player) => (
        <div key={player.position} className={cn("absolute", getPlayerPosition(player.position))}>
          <div className="flex flex-col items-center gap-2">
            <div className="bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md border border-border">
              <p className="text-xs font-medium text-card-foreground">{player.label}</p>
              <p className="text-[10px] text-muted-foreground">
                {player.role} {player.cardCount && `• ${player.cardCount} cards`}
              </p>
            </div>
            {player.cardCount && player.position !== "SOUTH" && (
              <div className="flex gap-0.5">
                {Array.from({ length: Math.min(player.cardCount, 8) }).map((_, i) => (
                  <CardBack key={i} size="sm" className="-ml-6 first:ml-0" />
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Trick cards in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        {currentTrick.map((trick, index) => {
          const player = players.find((p) => p.position === trick.player)
          if (!player) return null

          return (
            <div
              key={index}
              className={cn("absolute transition-all duration-300", getTrickCardPosition(trick.player))}
              style={{
                zIndex: 10 + index,
              }}
            >
              <PlayingCard card={trick.card} size="md" />
            </div>
          )
        })}

        {currentTrick.length === 0 && (
          <div className="text-primary-foreground/30 text-sm font-medium">Waiting for cards...</div>
        )}
      </div>

      {/* Trump indicator */}
      <div className="absolute top-2 right-2 bg-gold-accent text-primary-foreground px-3 py-1.5 rounded-lg shadow-lg">
        <p className="text-xs font-bold">
          Trump: {trumpSuit} {trumpRank}
        </p>
      </div>
    </div>
  )
}
