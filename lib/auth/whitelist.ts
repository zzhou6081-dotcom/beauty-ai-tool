/**
 * 白名单和权限管理系统
 * 本地开发：读写 data/whitelist.json
 * 生产环境：读写 Redis（REDIS_URL）
 */

export interface UserPermissions {
  email: string
  name: string
  password?: string
  modules: {
    ipAssistant: boolean
    imageGeneration: boolean
    workflow: boolean
    assets: boolean
  }
  credits: number
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}

const WHITELIST_KEY = 'beauty_whitelist'
const isProduction = !!process.env.REDIS_URL

// ─── Redis（生产） ────────────────────────────────────────────────

async function getRedisClient() {
  const { createClient } = await import('redis')
  const client = createClient({ url: process.env.REDIS_URL })
  await client.connect()
  return client
}

async function redisLoad(): Promise<Map<string, UserPermissions>> {
  const client = await getRedisClient()
  try {
    const raw = await client.get(WHITELIST_KEY)
    const map = new Map<string, UserPermissions>()
    if (raw) {
      const users: UserPermissions[] = JSON.parse(raw)
      users.forEach(u => map.set(u.email.toLowerCase(), u))
    }
    return map
  } finally {
    await client.disconnect()
  }
}

async function redisSave(whitelist: Map<string, UserPermissions>): Promise<void> {
  const client = await getRedisClient()
  try {
    const users = Array.from(whitelist.values())
    await client.set(WHITELIST_KEY, JSON.stringify(users))
  } finally {
    await client.disconnect()
  }
}

// ─── 本地文件系统（开发） ──────────────────────────────────────────

async function fileLoad(): Promise<Map<string, UserPermissions>> {
  try {
    const fs = await import('fs')
    const path = await import('path')
    const whitelistPath = path.join(process.cwd(), 'data', 'whitelist.json')
    if (fs.existsSync(whitelistPath)) {
      const data = fs.readFileSync(whitelistPath, 'utf-8')
      const users: UserPermissions[] = JSON.parse(data)
      const map = new Map<string, UserPermissions>()
      users.forEach(u => map.set(u.email.toLowerCase(), u))
      return map
    }
  } catch (error) {
    console.error('[Whitelist] Failed to load from file:', error)
  }
  return new Map()
}

async function fileSave(whitelist: Map<string, UserPermissions>): Promise<void> {
  const fs = await import('fs')
  const path = await import('path')
  const dataDir = path.join(process.cwd(), 'data')
  const whitelistPath = path.join(dataDir, 'whitelist.json')
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  const users = Array.from(whitelist.values())
  fs.writeFileSync(whitelistPath, JSON.stringify(users, null, 2), 'utf-8')
}

// ─── 公共 API ─────────────────────────────────────────────────────

export async function loadWhitelist(): Promise<Map<string, UserPermissions>> {
  return isProduction ? redisLoad() : fileLoad()
}

export async function saveWhitelist(whitelist: Map<string, UserPermissions>): Promise<void> {
  return isProduction ? redisSave(whitelist) : fileSave(whitelist)
}

export async function checkWhitelist(email: string): Promise<UserPermissions | null> {
  const whitelist = await loadWhitelist()
  const user = whitelist.get(email.toLowerCase())
  if (!user) return null
  if (user.expiresAt && new Date(user.expiresAt) < new Date()) return null
  return user
}

export async function hasModulePermission(
  email: string,
  module: keyof UserPermissions['modules']
): Promise<boolean> {
  const user = await checkWhitelist(email)
  if (!user) return false
  return user.modules[module]
}

export async function upsertUser(user: Omit<UserPermissions, 'createdAt' | 'updatedAt'>): Promise<void> {
  const whitelist = await loadWhitelist()
  const email = user.email.toLowerCase()
  const existing = whitelist.get(email)
  const now = new Date().toISOString()
  whitelist.set(email, { ...user, email, createdAt: existing?.createdAt || now, updatedAt: now })
  await saveWhitelist(whitelist)
}

export async function deleteUser(email: string): Promise<void> {
  const whitelist = await loadWhitelist()
  whitelist.delete(email.toLowerCase())
  await saveWhitelist(whitelist)
}

export async function getAllUsers(): Promise<UserPermissions[]> {
  const whitelist = await loadWhitelist()
  return Array.from(whitelist.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}
