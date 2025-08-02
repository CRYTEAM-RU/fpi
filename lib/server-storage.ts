import { promises as fs } from "fs"
import path from "path"

export interface Mod {
  id: string
  title: string
  description: string | null
  author: string
  version: string
  category: string
  fileName: string
  fileSize: number
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

class ServerStorage {
  private readonly DATA_DIR = path.join(process.cwd(), "data")
  private readonly MODS_FILE = path.join(this.DATA_DIR, "mods.json")
  private readonly USERS_FILE = path.join(this.DATA_DIR, "users.json")
  private readonly UPLOADS_DIR = path.join(process.cwd(), "public", "uploads")

  constructor() {
    this.initializeStorage()
  }

  private async initializeStorage() {
    try {
      // Создаём директории если их нет
      await fs.mkdir(this.DATA_DIR, { recursive: true })
      await fs.mkdir(this.UPLOADS_DIR, { recursive: true })

      // Инициализируем файлы данных
      await this.initializeUsers()
      await this.initializeMods()
    } catch (error) {
      console.error("Ошибка инициализации хранилища:", error)
    }
  }

  private async initializeUsers() {
    try {
      await fs.access(this.USERS_FILE)
    } catch {
      const defaultUsers: User[] = [
        {
          id: "1",
          email: "admin@beamng-mods.ru",
          name: "Администратор",
          isAdmin: true,
          createdAt: new Date().toISOString(),
        },
      ]
      await fs.writeFile(this.USERS_FILE, JSON.stringify(defaultUsers, null, 2))
    }
  }

  private async initializeMods() {
    try {
      await fs.access(this.MODS_FILE)
    } catch {
      // Создаём полностью пустой массив модов
      const emptyMods: Mod[] = []
      await fs.writeFile(this.MODS_FILE, JSON.stringify(emptyMods, null, 2))
    }
  }

  // Методы для работы с модами
  async getMods(): Promise<Mod[]> {
    try {
      const data = await fs.readFile(this.MODS_FILE, "utf-8")
      return JSON.parse(data)
    } catch (error) {
      console.error("Ошибка чтения модов:", error)
      return []
    }
  }

  async getModById(id: string): Promise<Mod | null> {
    const mods = await this.getMods()
    return mods.find((mod) => mod.id === id) || null
  }

  async createMod(modData: Omit<Mod, "id" | "createdAt" | "updatedAt" | "downloadCount">): Promise<Mod> {
    const mods = await this.getMods()
    const newMod: Mod = {
      ...modData,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      downloadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mods.unshift(newMod)
    await fs.writeFile(this.MODS_FILE, JSON.stringify(mods, null, 2))
    return newMod
  }

  async updateMod(id: string, updates: Partial<Mod>): Promise<Mod | null> {
    const mods = await this.getMods()
    const index = mods.findIndex((mod) => mod.id === id)
    if (index === -1) return null

    mods[index] = {
      ...mods[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await fs.writeFile(this.MODS_FILE, JSON.stringify(mods, null, 2))
    return mods[index]
  }

  async deleteMod(id: string): Promise<boolean> {
    const mods = await this.getMods()
    const mod = mods.find((m) => m.id === id)
    if (!mod) return false

    // Удаляем файл
    try {
      const filePath = path.join(this.UPLOADS_DIR, mod.fileName)
      await fs.unlink(filePath)
    } catch (error) {
      console.error("Ошибка удаления файла:", error)
    }

    // Удаляем из базы данных
    const filteredMods = mods.filter((m) => m.id !== id)
    await fs.writeFile(this.MODS_FILE, JSON.stringify(filteredMods, null, 2))
    return true
  }

  async incrementDownloadCount(id: string): Promise<void> {
    const mods = await this.getMods()
    const mod = mods.find((m) => m.id === id)
    if (mod) {
      mod.downloadCount++
      await fs.writeFile(this.MODS_FILE, JSON.stringify(mods, null, 2))
    }
  }

  // Методы для работы с пользователями
  async getUsers(): Promise<User[]> {
    try {
      const data = await fs.readFile(this.USERS_FILE, "utf-8")
      return JSON.parse(data)
    } catch (error) {
      console.error("Ошибка чтения пользователей:", error)
      return []
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getUsers()
    return users.find((user) => user.email === email) || null
  }

  // Методы для работы с файлами
  async saveFile(file: File, fileName: string): Promise<string> {
    const filePath = path.join(this.UPLOADS_DIR, fileName)
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buffer)
    return `/uploads/${fileName}`
  }

  async deleteFile(fileName: string): Promise<void> {
    const filePath = path.join(this.UPLOADS_DIR, fileName)
    await fs.unlink(filePath)
  }
}

export const serverStorage = new ServerStorage()
