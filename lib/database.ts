// Простая база данных в памяти (в реальном приложении используйте PostgreSQL/MySQL)
export interface Mod {
  id: string
  title: string
  description: string | null
  author: string
  version: string
  category: string
  driveFileId: string
  fileName: string
  fileSize: number | null
  downloadCount: number
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name: string
  isAdmin: boolean
  createdAt: string
}

class InMemoryDatabase {
  private mods: Mod[] = []
  private users: User[] = [
    {
      id: "1",
      email: "admin@beamng-mods.com",
      name: "Admin",
      isAdmin: true,
      createdAt: new Date().toISOString(),
    },
  ]

  // Mods methods
  async getMods(): Promise<Mod[]> {
    return [...this.mods].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async getModById(id: string): Promise<Mod | null> {
    return this.mods.find((mod) => mod.id === id) || null
  }

  async createMod(modData: Omit<Mod, "id" | "createdAt" | "updatedAt" | "downloadCount">): Promise<Mod> {
    const mod: Mod = {
      ...modData,
      id: Math.random().toString(36).substring(2, 15),
      downloadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.mods.push(mod)
    return mod
  }

  async updateMod(id: string, updates: Partial<Mod>): Promise<Mod | null> {
    const index = this.mods.findIndex((mod) => mod.id === id)
    if (index === -1) return null

    this.mods[index] = {
      ...this.mods[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    return this.mods[index]
  }

  async deleteMod(id: string): Promise<boolean> {
    const index = this.mods.findIndex((mod) => mod.id === id)
    if (index === -1) return false

    this.mods.splice(index, 1)
    return true
  }

  async incrementDownloadCount(id: string): Promise<void> {
    const mod = this.mods.find((m) => m.id === id)
    if (mod) {
      mod.downloadCount++
    }
  }

  // Users methods
  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email === email) || null
  }

  async createUser(userData: Omit<User, "id" | "createdAt">): Promise<User> {
    const user: User = {
      ...userData,
      id: Math.random().toString(36).substring(2, 15),
      createdAt: new Date().toISOString(),
    }

    this.users.push(user)
    return user
  }
}

export const db = new InMemoryDatabase()
