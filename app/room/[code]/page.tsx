"use client"

import { use, useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Users,
  Bot,
  Play,
  Copy,
  Check,
  Crown,
  Wifi,
  WifiOff,
  Share2,
  Settings,
  RotateCcw,
} from "lucide-react"
import { getRoomByCode, getOrCreatePlayerId, addAIPlayer, removePlayer, updateRoom, type Room } from "@/lib/room-store"
import type { PlayerPosition } from "@/lib/room-types"
import type { CardString } from "@/lib/card-types"
import { useToast } from "@/hooks/use-toast"
import { initializeGame } from "@/lib/game-engine"
import { attemptDeclare, passDeclaring } from "@/lib/game-phases/declaring"
import { buryCards } from "@/lib/game-phases/burying"
import { playCard } from "@/lib/game-phases/playing"
import { calculateFinalScore, setupNextGame } from "@/lib/game-phases/scoring"
import { shouldAIAct, executeAITurn } from "@/lib/ai-controller"
import { DeclaringPhase } from "@/components/game-phases/declaring-phase"
import { BuryingPhase } from "@/components/game-phases/burying-phase"
import { PlayingPhase } from "@/components/game-phases/playing-phase"
import { ScoringPhase } from "@/components/game-phases/scoring-phase"

interface RoomPageProps {
  params: Promise<{ code: string }>
}

export default function RoomPage({ params }: RoomPageProps) {
  const { code } = use(params)
  const { toast } = useToast()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const playerId = getOrCreatePlayerId()

  const loadRoom = useCallback(() => {
    const foundRoom = getRoomByCode(code)
    setRoom(foundRoom)
    setLoading(false)
  }, [code])

  useEffect(() => {
    loadRoom()

    // AI turn handler
    const handleAITurn = async () => {
      const currentRoom = getRoomByCode(code)
      if (currentRoom && shouldAIAct(currentRoom)) {
        const updatedRoom = await executeAITurn(currentRoom)
        updateRoom(updatedRoom)
        setRoom(updatedRoom)
      }
    }

    handleAITurn() // Check immediately
    const interval = setInterval(() => {
      loadRoom()
      handleAITurn()
    }, 2000)

    return () => clearInterval(interval)
  }, [loadRoom, code])

  const handleCopyCode = async () => {
    if (!room) return

    const url = `${window.location.origin}/room/${room.code}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast({ title: "Copied!", description: "Room link copied to clipboard" })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddAI = (position: PlayerPosition) => {
    if (!room) return
    const updated = addAIPlayer(room.id, position)
    if (updated) setRoom(updated)
  }

  const handleRemovePlayer = (targetId: string) => {
    if (!room) return
    const updated = removePlayer(room.id, targetId)
    setRoom(updated)
  }

  const handleStartGame = () => {
    if (!room || room.players.length < 4) {
      toast({
        title: "Not enough players",
        description: "Need at least 4 players to start",
        variant: "destructive",
      })
      return
    }

    const updatedRoom = initializeGame(room)
    updateRoom(updatedRoom)
    setRoom(updatedRoom)
    toast({ title: "Game Started!", description: "Good luck!" })
  }

  // Phase-specific handlers
  const handleDeclare = (cards: CardString[]) => {
    if (!room) return
    const result = attemptDeclare(room, playerId, cards)
    if (result.success) {
      updateRoom(result.room)
      setRoom(result.room)
      toast({ title: "Success", description: result.message })
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" })
    }
  }

  const handlePass = () => {
    if (!room) return
    const result = passDeclaring(room, playerId)
    if (result.success) {
      updateRoom(result.room)
      setRoom(result.room)
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" })
    }
  }

  const handleBury = (cards: CardString[]) => {
    if (!room) return
    const result = buryCards(room, playerId, cards)
    if (result.success) {
      updateRoom(result.room)
      setRoom(result.room)
      toast({ title: "Success", description: result.message })
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" })
    }
  }

  const handlePlayCard = (card: CardString) => {
    if (!room) return
    const result = playCard(room, playerId, card)
    if (result.success) {
      updateRoom(result.room)
      setRoom(result.room)
      if (result.trickComplete) {
        toast({ title: "Trick Complete", description: result.message })
      }
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" })
    }
  }

  const handlePlayAgain = () => {
    if (!room || !isHost) return
    const result = calculateFinalScore(room)
    if (result) {
      const nextRoom = setupNextGame(room, result)
      updateRoom(nextRoom)
      setRoom(nextRoom)
      toast({ title: "Game Reset", description: "Ready for next game!" })
    }
  }

  const isHost = room?.hostId === playerId
  const currentPlayer = room?.players.find((p) => p.id === playerId)

  // Position layout for display
  const positions: PlayerPosition[] =
    room?.maxPlayers === 6
      ? ["NORTH", "EAST", "SOUTH", "WEST", "OBSERVER_1", "OBSERVER_2"]
      : ["NORTH", "EAST", "SOUTH", "WEST"]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 max-w-lg mx-auto">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Room Not Found</h1>
          <p className="text-muted-foreground text-sm mb-4">This room may have expired or the code is invalid.</p>
          <Button asChild>
            <Link href="/multiplayer">Back to Lobby</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-2 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="shrink-0" asChild>
              <Link href="/multiplayer">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-sm font-semibold">Room {room.code}</h1>
                <p className="text-xs text-muted-foreground">
                  {room.players.length}/{room.maxPlayers} players
                </p>
              </div>
              {room.status === "PLAYING" && room.gameState && (
                <Badge variant="outline" className="text-xs">
                  {room.gameState.phase}
                </Badge>
              )}
            </div>
          </div>
          {room.status === "WAITING" && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCopyCode}>
                {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                <span className="hidden sm:inline">Copy Invite</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className={room.status === "PLAYING" ? "max-w-7xl mx-auto p-6" : "max-w-lg mx-auto p-4"}>
          <div className="space-y-4">
            {/* Room Code Display - Only show when waiting */}
            {room.status === "WAITING" && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Share this code to invite players</p>
                  <div className="text-3xl font-mono font-bold tracking-widest text-primary">{room.code}</div>
                  <Button variant="outline" size="sm" className="mt-3 bg-transparent" onClick={handleCopyCode}>
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    Copy Invite Link
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Players Grid - Only show when waiting */}
            {room.status === "WAITING" && (
              <div>
                <h2 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Players
                </h2>
          <div className="grid grid-cols-2 gap-2">
            {positions.map((position) => {
              const player = room.players.find((p) => p.position === position)

              if (player) {
                const isCurrentUser = player.id === playerId
                const isAI = player.type === "AI"
                const isRoomHost = player.id === room.hostId

                return (
                  <Card key={position} className={`${isCurrentUser ? "border-primary bg-primary/5" : ""}`}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          {isAI ? (
                            <Bot className="w-4 h-4 text-muted-foreground shrink-0" />
                          ) : player.connected ? (
                            <Wifi className="w-4 h-4 text-green-500 shrink-0" />
                          ) : (
                            <WifiOff className="w-4 h-4 text-red-500 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium truncate">{player.name}</span>
                              {isRoomHost && <Crown className="w-3 h-3 text-amber-500 shrink-0" />}
                            </div>
                            <span className="text-[10px] text-muted-foreground">{position}</span>
                          </div>
                        </div>
                        {isHost && !isCurrentUser && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => handleRemovePlayer(player.id)}
                          >
                            <RotateCcw className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              }

              // Empty slot
              return (
                <Card key={position} className="border-dashed">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">{position}</div>
                      {isHost && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs bg-transparent"
                          onClick={() => handleAddAI(position)}
                        >
                          <Bot className="w-3 h-3 mr-1" />
                          Add AI
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
              </div>
            )}

            {/* Game Settings (Host Only) */}
            {isHost && room.status === "WAITING" && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Game Settings
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Max Players</span>
                      <Badge variant="secondary">{room.maxPlayers}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Starting Rank</span>
                      <Badge variant="secondary">2</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status Messages */}
            {!currentPlayer && (
              <Card className="bg-amber-500/10 border-amber-500/20">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-amber-700">You are not in this room</p>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent" asChild>
                    <Link href={`/multiplayer?join=${room.code}`}>Join Room</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Game Phases */}
            {room.status === "PLAYING" && room.gameState && (
              <>
                {room.gameState.phase === "DECLARING" && (
                  <DeclaringPhase
                    room={room}
                    playerId={playerId}
                    onDeclare={handleDeclare}
                    onPass={handlePass}
                  />
                )}

                {room.gameState.phase === "BURYING" && (
                  <BuryingPhase room={room} playerId={playerId} onBury={handleBury} />
                )}

                {room.gameState.phase === "PLAYING" && (
                  <PlayingPhase room={room} playerId={playerId} onPlayCard={handlePlayCard} />
                )}

                {room.gameState.phase === "SCORING" && (
                  <ScoringPhase
                    room={room}
                    result={calculateFinalScore(room)}
                    onPlayAgain={handlePlayAgain}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Start Game Button (Host Only) */}
      {isHost && room.status === "WAITING" && (
        <div className="p-4 border-t border-border bg-card safe-area-bottom">
          <div className="max-w-lg mx-auto">
            <Button className="w-full" size="lg" onClick={handleStartGame} disabled={room.players.length < 4}>
              <Play className="w-5 h-5 mr-2" />
              Start Game ({room.players.length}/4 minimum)
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
