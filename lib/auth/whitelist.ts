/**
 * 白名单和权限管理系统
 * 本地开发：读写 data/whitelist.json
 * 生产环境（Vercel）：读写 Vercel KV（Redis）
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

const KV_KEY = 'beauty_whitelist'
const isProduction = process.env.KV_REST_API_URL !== undefined

// ─── KV (生产环境) ───────────────────────────────────────────────

async function kvLoad(): Promise<Map<string, UserPermissions>> {
  const { kv } = await import('@vercel/kv')
  const data = await kv.get<UserPermissions[]>(KV_KEY)
  const map = new Map<string, UserPermissions>()
  if (data && Array.isArray(data)) {
    data.forEach(user => map.set(user.email.toLowerCase(), user))
  }
  return map
}

async function kvSave(whitelist: Map<string, UserPermissions>): Promise<void> {
  const { kv } = await import('@vercel/kv')
  const users = Array.from(whitelist.values())
  await kv.set(KV_KEY, users)
}

// ─── 本地文件系统（开发环境） ──────────────────────────────────────

async function fileLoad(): Promise<Map<string, UserPermissions>> {
  try {
    const fs = await import('fs')
    const path = await import('path')
    const whitelistPath = path.join(process.cwd(), 'data', 'whitelist.json')
    if (fs.existsSync(whitelistPath)) {
      const data = fs.readFileSync(whitelistPath, 'utf-8')
      const users: UserPermissions[] = JSON.parse(data)
      const map = new Map<string, UserPermissions>()
      users.forEach(user => map.set(user.email.toLowerCase(), user))
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
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  const users = Array.from(whitelist.values())
  fs.writeFileSync(whitelistPath, JSON.stringify(users, null, 2), 'utf-8')
}

// ─── 公共 API ─────────────────────────────────────────────────────

export async function loadWhitelist(): Promise<Map<string, UserPermissions>> {
  return isProduction ? kvLoad() : fileLoad()
}

export async function saveWhitelist(whitelist: Map<string, UserPermissions>): Promise<void> {
  return isProduction ? kvSave(whitelist) : fileSave(whitelist)
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
  whitelist.set(email, {
    ...user,
    email,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  })
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
