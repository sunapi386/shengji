"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Users, Plus, Play, History, Clock, Trophy, Trash2, Database, Check, X } from "lucide-react"
import {
  createRoom,
  getRoomByCode,
  joinRoom,
  getRooms,
  getGameHistory,
  clearGameHistory,
  getOrCreatePlayerId,
} from "@/lib/room-store"
import { getDBConfig, saveDBConfig, clearDBConfig, type DBConfig } from "@/lib/db-config"
import type { GameHistoryEntry, Room } from "@/lib/room-types"
import { useToast } from "@/hooks/use-toast"

function JoinCodeHandler({ onJoinCode }: { onJoinCode: (code: string) => void }) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const joinParam = searchParams.get("join")
    if (joinParam) {
      onJoinCode(joinParam)
    }
  }, [searchParams, onJoinCode])

  return null
}

function MultiplayerContent() {
  const router = useRouter()
  const { toast } = useToast()

  const [playerName, setPlayerName] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [activeTab, setActiveTab] = useState<"lobby" | "history" | "settings">("lobby")
  const [myRooms, setMyRooms] = useState<Room[]>([])
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([])
  const [dbConfig, setDbConfig] = useState<DBConfig>({ isConfigured: false })
  const [postgresUrl, setPostgresUrl] = useState("")
  const [redisUrl, setRedisUrl] = useState("")
  const [isInitializing, setIsInitializing] = useState(false)

  useEffect(() => {
    const savedName = localStorage.getItem("shengji-player-name")
    if (savedName) setPlayerName(savedName)

    const playerId = getOrCreatePlayerId()
    const allRooms = getRooms()
    setMyRooms(allRooms.filter((r) => r.players.some((p) => p.id === playerId)))
    setGameHistory(getGameHistory())

    const config = getDBConfig()
    setDbConfig(config)
    if (config.postgresUrl) setPostgresUrl(config.postgresUrl)
    if (config.redisUrl) setRedisUrl(config.redisUrl)
  }, [])

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      toast({ title: "Enter your name", variant: "destructive" })
      return
    }

    localStorage.setItem("shengji-player-name", playerName)
    const room = createRoom(playerName)
    router.push(`/room/${room.code}`)
  }

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      toast({ title: "Enter your name", variant: "destructive" })
      return
    }
    if (!joinCode.trim()) {
      toast({ title: "Enter room code", variant: "destructive" })
      return
    }

    localStorage.setItem("shengji-player-name", playerName)

    const room = getRoomByCode(joinCode)
    if (!room) {
      toast({ title: "Room not found", variant: "destructive" })
      return
    }

    const joined = joinRoom(room.id, playerName)
    if (!joined) {
      toast({ title: "Could not join room", description: "Room may be full or game started", variant: "destructive" })
      return
    }

    router.push(`/room/${room.code}`)
  }

  const handleSaveDBConfig = async () => {
    setIsInitializing(true)

    saveDBConfig({
      postgresUrl: postgresUrl.trim() || undefined,
      redisUrl: redisUrl.trim() || undefined,
    })

    setDbConfig(getDBConfig())
    setIsInitializing(false)
    toast({ title: "Database configured", description: "Connection settings saved" })
  }

  const handleClearDBConfig = () => {
    clearDBConfig()
    setDbConfig({ isConfigured: false })
    setPostgresUrl("")
    setRedisUrl("")
    toast({ title: "Configuration cleared" })
  }

  const handleClearHistory = () => {
    clearGameHistory()
    setGameHistory([])
    toast({ title: "History cleared" })
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <>
      <Suspense fallback={null}>
        <JoinCodeHandler onJoinCode={setJoinCode} />
      </Suspense>

      <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
        {/* Header */}
        <header className="border-b border-border bg-card px-3 py-3 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0 -ml-2" asChild>
              <Link href="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-sm font-semibold">Multiplayer</h1>
              <p className="text-xs text-muted-foreground">Play with friends or AI</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b h-auto p-0 bg-transparent">
              {[
                { key: "lobby", label: "Lobby", icon: Users },
                { key: "history", label: "History", icon: History },
                { key: "settings", label: "Database", icon: Database },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
                  >
                    <Icon className="w-4 h-4 mr-1.5" />
                    {tab.label}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            <TabsContent value="lobby" className="p-4 space-y-4 mt-0">
              {/* Player Name */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Your Name</label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="h-10"
                />
              </div>

              {/* Create Room */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm mb-2">Create New Room</h3>
                  <p className="text-xs text-muted-foreground mb-3">Start a room and invite friends with a code</p>
                  <Button className="w-full" onClick={handleCreateRoom}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Room
                  </Button>
                </CardContent>
              </Card>

              {/* Join Room */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm mb-2">Join Room</h3>
                  <p className="text-xs text-muted-foreground mb-3">Enter a 6-character room code</p>
                  <div className="flex gap-2">
                    <Input
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="ABC123"
                      className="font-mono uppercase h-10"
                      maxLength={6}
                    />
                    <Button onClick={handleJoinRoom}>
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* My Active Rooms */}
              {myRooms.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm mb-2">Your Active Rooms</h3>
                  <div className="space-y-2">
                    {myRooms.map((room) => (
                      <Link key={room.id} href={`/room/${room.code}`}>
                        <Card className="hover:bg-accent/50 transition-colors">
                          <CardContent className="p-3 flex items-center justify-between">
                            <div>
                              <div className="font-mono font-medium">{room.code}</div>
                              <div className="text-xs text-muted-foreground">
                                {room.players.length}/{room.maxPlayers} players
                              </div>
                            </div>
                            <Badge variant={room.status === "PLAYING" ? "default" : "secondary"}>{room.status}</Badge>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="p-4 space-y-4 mt-0">
              {gameHistory.length === 0 ? (
                <Card className="bg-muted/50">
                  <CardContent className="p-6 text-center">
                    <History className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                    <h3 className="font-medium mb-1">No Games Yet</h3>
                    <p className="text-sm text-muted-foreground">Complete games will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">Game History</h3>
                    <Button variant="ghost" size="sm" onClick={handleClearHistory}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {gameHistory.map((game) => (
                      <Card key={game.id}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Trophy
                                className={`w-4 h-4 ${game.winner === "ATTACKER" ? "text-amber-500" : "text-blue-500"}`}
                              />
                              <span className="font-medium text-sm">
                                {game.winner === "ATTACKER" ? "Attackers" : "Defenders"} Win
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(game.playedAt)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {game.attackerPoints} - {game.defenderPoints}
                            </span>
                            <span>{game.tricksCount} tricks</span>
                            <span>
                              {game.trumpSuit} {game.trumpRank}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="settings" className="p-4 space-y-4 mt-0">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-sm flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Database Configuration
                    </h3>
                    {dbConfig.isConfigured && (
                      <Badge variant="secondary" className="text-xs">
                        <Check className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Optional: Connect a database for persistent room and game history storage across devices.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        PostgreSQL URL (optional)
                      </label>
                      <Input
                        type="password"
                        value={postgresUrl}
                        onChange={(e) => setPostgresUrl(e.target.value)}
                        placeholder="postgres://user:pass@host:5432/db"
                        className="font-mono text-xs h-9"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Redis URL (optional)
                      </label>
                      <Input
                        type="password"
                        value={redisUrl}
                        onChange={(e) => setRedisUrl(e.target.value)}
                        placeholder="redis://user:pass@host:6379"
                        className="font-mono text-xs h-9"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleSaveDBConfig} disabled={isInitializing} className="flex-1" size="sm">
                        {isInitializing ? "Connecting..." : "Save & Initialize"}
                      </Button>
                      {dbConfig.isConfigured && (
                        <Button variant="outline" onClick={handleClearDBConfig} size="sm">
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="text-xs font-medium mb-2">Without Database</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>- Rooms stored in browser localStorage</li>
                    <li>- Works only on same device/browser</li>
                    <li>- Data cleared when browser data cleared</li>
                  </ul>
                  <h4 className="text-xs font-medium mt-3 mb-2">With Database</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>- Real-time sync across all players</li>
                    <li>- Persistent game history</li>
                    <li>- Works across devices</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  )
}

export default function MultiplayerPage() {
  return <MultiplayerContent />
}
