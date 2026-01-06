// Database configuration utilities - all connections are optional
// Users can configure via UI by entering connection strings

export interface DBConfig {
  postgresUrl?: string
  redisUrl?: string
  isConfigured: boolean
}

const DB_CONFIG_KEY = "shengji-db-config"

export function getDBConfig(): DBConfig {
  if (typeof window === "undefined") return { isConfigured: false }

  try {
    const stored = localStorage.getItem(DB_CONFIG_KEY)
    if (stored) {
      const config = JSON.parse(stored)
      return {
        ...config,
        isConfigured: !!(config.postgresUrl || config.redisUrl),
      }
    }
  } catch {}

  return { isConfigured: false }
}

export function saveDBConfig(config: Partial<DBConfig>): void {
  if (typeof window === "undefined") return

  const current = getDBConfig()
  const newConfig = { ...current, ...config }
  localStorage.setItem(DB_CONFIG_KEY, JSON.stringify(newConfig))
}

export function clearDBConfig(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(DB_CONFIG_KEY)
}
