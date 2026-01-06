import { NextResponse } from "next/server"

// SQL to initialize the database schema
const INIT_SQL = `
-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  host_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'WAITING',
  max_players INTEGER NOT NULL DEFAULT 4,
  game_state JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Room players table
CREATE TABLE IF NOT EXISTS room_players (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  player_type TEXT NOT NULL DEFAULT 'HUMAN',
  connected BOOLEAN NOT NULL DEFAULT TRUE,
  cards JSONB DEFAULT '[]',
  team TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game history table
CREATE TABLE IF NOT EXISTS game_history (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  room_code TEXT NOT NULL,
  player_names JSONB NOT NULL,
  attacker_points INTEGER NOT NULL,
  defender_points INTEGER NOT NULL,
  winner TEXT NOT NULL,
  trump_suit TEXT NOT NULL,
  trump_rank TEXT NOT NULL,
  tricks_count INTEGER NOT NULL,
  played_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_room_players_room_id ON room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_game_history_played_at ON game_history(played_at DESC);
`

export async function POST(request: Request) {
  try {
    const { postgresUrl } = await request.json()

    if (!postgresUrl) {
      return NextResponse.json({ error: "PostgreSQL URL required" }, { status: 400 })
    }

    // Dynamic import to avoid bundling issues
    const { neon } = await import("@neondatabase/serverless")
    const sql = neon(postgresUrl)

    await sql(INIT_SQL)

    return NextResponse.json({ success: true, message: "Database initialized successfully" })
  } catch (error) {
    console.error("Database init error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to initialize database" },
      { status: 500 },
    )
  }
}
