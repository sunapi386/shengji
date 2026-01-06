import type { Room, GameHistoryEntry, PlayerPosition } from "./room-types"

const ROOMS_KEY = "shengji-rooms"
const HISTORY_KEY = "shengji-game-history"
const PLAYER_ID_KEY = "shengji-player-id"

// Generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Avoiding confusable characters
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// Player ID management
export function getOrCreatePlayerId(): string {
  if (typeof window === "undefined") return ""

  let id = localStorage.getItem(PLAYER_ID_KEY)
  if (!id) {
    id = generateId()
    localStorage.setItem(PLAYER_ID_KEY, id)
  }
  return id
}

// Room management
export function getRooms(): Room[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(ROOMS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveRooms(rooms: Room[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms))
}

export function createRoom(hostName: string, maxPlayers: 4 | 6 = 4): Room {
  const playerId = getOrCreatePlayerId()
  const room: Room = {
    id: generateId(),
    code: generateRoomCode(),
    hostId: playerId,
    status: "WAITING",
    maxPlayers,
    players: [
      {
        id: playerId,
        name: hostName,
        position: "SOUTH",
        type: "HUMAN",
        connected: true,
        cards: [],
        team: null,
      },
    ],
    gameState: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  const rooms = getRooms()
  rooms.push(room)
  saveRooms(rooms)

  return room
}

export function getRoomByCode(code: string): Room | null {
  const rooms = getRooms()
  return rooms.find((r) => r.code.toUpperCase() === code.toUpperCase()) || null
}

export function getRoomById(id: string): Room | null {
  const rooms = getRooms()
  return rooms.find((r) => r.id === id) || null
}

export function joinRoom(roomId: string, playerName: string): Room | null {
  const rooms = getRooms()
  const roomIndex = rooms.findIndex((r) => r.id === roomId)

  if (roomIndex === -1) return null

  const room = rooms[roomIndex]
  if (room.players.length >= room.maxPlayers) return null
  if (room.status !== "WAITING") return null

  const playerId = getOrCreatePlayerId()

  // Check if already in room
  if (room.players.some((p) => p.id === playerId)) {
    return room
  }

  // Find next available position
  const positions: PlayerPosition[] =
    room.maxPlayers === 4
      ? ["SOUTH", "WEST", "NORTH", "EAST"]
      : ["SOUTH", "WEST", "NORTH", "EAST", "OBSERVER_1", "OBSERVER_2"]
  const takenPositions = room.players.map((p) => p.position)
  const availablePosition = positions.find((p) => !takenPositions.includes(p))

  if (!availablePosition) return null

  room.players.push({
    id: playerId,
    name: playerName,
    position: availablePosition,
    type: "HUMAN",
    connected: true,
    cards: [],
    team: null,
  })
  room.updatedAt = Date.now()

  saveRooms(rooms)
  return room
}

export function addAIPlayer(roomId: string, position: PlayerPosition): Room | null {
  const rooms = getRooms()
  const roomIndex = rooms.findIndex((r) => r.id === roomId)

  if (roomIndex === -1) return null

  const room = rooms[roomIndex]
  if (room.players.some((p) => p.position === position)) return null

  const aiNames = ["Bot Alpha", "Bot Beta", "Bot Gamma", "Bot Delta", "Bot Epsilon"]
  const usedNames = room.players.filter((p) => p.type === "AI").map((p) => p.name)
  const availableName = aiNames.find((n) => !usedNames.includes(n)) || `AI ${Date.now()}`

  room.players.push({
    id: `ai-${generateId()}`,
    name: availableName,
    position,
    type: "AI",
    connected: true,
    cards: [],
    team: null,
  })
  room.updatedAt = Date.now()

  saveRooms(rooms)
  return room
}

export function removePlayer(roomId: string, playerId: string): Room | null {
  const rooms = getRooms()
  const roomIndex = rooms.findIndex((r) => r.id === roomId)

  if (roomIndex === -1) return null

  const room = rooms[roomIndex]
  room.players = room.players.filter((p) => p.id !== playerId)
  room.updatedAt = Date.now()

  if (room.players.length === 0) {
    rooms.splice(roomIndex, 1)
  }

  saveRooms(rooms)
  return room.players.length > 0 ? room : null
}

export function updateRoom(room: Room): void {
  const rooms = getRooms()
  const roomIndex = rooms.findIndex((r) => r.id === room.id)

  if (roomIndex !== -1) {
    rooms[roomIndex] = { ...room, updatedAt: Date.now() }
    saveRooms(rooms)
  }
}

// Game history
export function getGameHistory(): GameHistoryEntry[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function saveGameToHistory(entry: Omit<GameHistoryEntry, "id">): void {
  if (typeof window === "undefined") return

  const history = getGameHistory()
  history.unshift({ ...entry, id: generateId() })

  // Keep only last 100 games
  if (history.length > 100) {
    history.splice(100)
  }

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function clearGameHistory(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(HISTORY_KEY)
}
