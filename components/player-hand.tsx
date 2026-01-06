"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { CardString } from "@/lib/card-types"
import { PlayingCard } from "./playing-card"

interface PlayerHandProps {
  cards: CardString[]
  onCardClick?: (card: CardString) => void
  disabledCards?: CardString[]
  selectedCard?: CardString
  trumpSuit: string
  trumpRank: string
  className?: string
}

export function PlayerHand({
  cards,
  onCardClick,
  disabledCards = [],
  selectedCard,
  trumpSuit,
  trumpRank,
  className,
}: PlayerHandProps) {
  const [hoveredCard, setHoveredCard] = useState<CardString | null>(null)

  return (
    <div className={cn("flex justify-center items-end gap-1", className)}>
      {cards.map((card, index) => {
        const isDisabled = disabledCards.includes(card)
        const isSelected = selectedCard === card
        const isHovered = hoveredCard === card

        return (
          <div
            key={`${card}-${index}`}
            className={cn("transition-all duration-200", isHovered && !isDisabled && "z-10")}
            onMouseEnter={() => setHoveredCard(card)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              marginLeft: index === 0 ? 0 : -32,
            }}
          >
            <PlayingCard
              card={card}
              onClick={onCardClick ? () => onCardClick(card) : undefined}
              isSelected={isSelected}
              isDisabled={isDisabled}
              size="md"
            />
          </div>
        )
      })}
    </div>
  )
}
