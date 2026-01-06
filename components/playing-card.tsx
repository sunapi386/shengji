"use client"

import { cn } from "@/lib/utils"
import type { CardString } from "@/lib/card-types"
import { getCardDisplay } from "@/lib/card-utils"

interface PlayingCardProps {
  card: CardString
  onClick?: () => void
  isSelected?: boolean
  isHighlighted?: boolean
  isDisabled?: boolean
  isTrump?: boolean
  className?: string
  size?: "sm" | "md" | "lg"
}

export function PlayingCard({
  card,
  onClick,
  isSelected = false,
  isHighlighted = false,
  isDisabled = false,
  isTrump = false,
  className,
  size = "md",
}: PlayingCardProps) {
  const { suit, rank, color } = getCardDisplay(card)

  const sizeClasses = {
    sm: "w-12 h-16 text-xs",
    md: "w-16 h-24 text-sm",
    lg: "w-20 h-28 text-base",
  }

  return (
    <button
      onClick={onClick}
      disabled={isDisabled || !onClick}
      className={cn(
        "relative rounded-lg bg-white border-2 shadow-md transition-all duration-200",
        "flex flex-col items-center justify-between p-1.5",
        sizeClasses[size],
        onClick && !isDisabled && "hover:scale-105 hover:-translate-y-1 cursor-pointer",
        isSelected && "ring-2 ring-primary ring-offset-2 -translate-y-2",
        isHighlighted && "ring-2 ring-gold-accent ring-offset-2",
        isDisabled && "opacity-50 cursor-not-allowed",
        isTrump && "border-gold-accent",
        !isDisabled && !isTrump && "border-gray-300",
        className,
      )}
    >
      {isTrump && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold-accent rounded-full flex items-center justify-center">
          <span className="text-[8px] text-white font-bold">★</span>
        </div>
      )}

      <div className={cn("font-bold", color, size === "lg" ? "text-lg" : size === "md" ? "text-base" : "text-xs")}>
        {rank}
      </div>

      <div className={cn("text-2xl", color, size === "sm" && "text-lg")}>{suit}</div>

      <div className={cn("font-bold", color, size === "lg" ? "text-lg" : size === "md" ? "text-base" : "text-xs")}>
        {rank}
      </div>
    </button>
  )
}

export function CardBack({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-12 h-16",
    md: "w-16 h-24",
    lg: "w-20 h-28",
  }

  return (
    <div
      className={cn(
        "rounded-lg bg-gradient-to-br from-primary to-secondary border-2 border-primary-foreground shadow-md",
        "flex items-center justify-center",
        sizeClasses[size],
        className,
      )}
    >
      <div className="text-primary-foreground text-2xl opacity-50">✦</div>
    </div>
  )
}
