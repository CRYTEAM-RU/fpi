// Локальная система хранения для GitHub Pages
export interface Mod {
  id: string
  title: string
  description: string | null
  author: string
  version: string
  category: string
  fileName: string
  fileSize: number
  fileData: string // base64 encoded file
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

class LocalStorageDB {
  private readonly MODS_KEY = "beamng_mods"
  private readonly USERS_KEY = "beamng_users"
  private readonly AUTH_KEY = "beamng_auth"

  constructor() {
    this.initializeDefaultData()
  }

  private initializeDefaultData() {
    // Initialize default admin user if not exists
    const users = this.getUsers()
    if (users.length === 0) {
      const defaultAdmin: User = {
        id: "1",
        email: "admin@beamng-mods.com",
        name: "Admin",
        isAdmin: true,
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem(this.USERS_KEY, JSON.stringify([defaultAdmin]))
    }

    // Initialize with some demo mods if empty
    const mods = this.getMods()
    if (mods.length === 0) {
      const demoMods: Mod[] = [
        {
          id: "demo-1",
          title: "Demo Vehicle Pack",
          description: "A collection of demo vehicles for BeamNG.drive",
          author: "BeamNG Team",
          version: "1.0",
          category: "vehicles",
          fileName: "demo-vehicles.zip",
          fileSize: 15728640, // 15MB
          fileData: "", // Empty for demo
          downloadCount: 42,
          createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "demo-2",
          title: "Mountain Road Map",
          description: "Beautiful mountain road with scenic views",
          author: "MapMaker",
          version: "2.1",
          category: "maps",
          fileName: "mountain-road.zip",
          fileSize: 52428800, // 50MB
          fileData: "", // Empty for demo
          downloadCount: 128,
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ]
      localStorage.setItem(this.MODS_KEY, JSON.stringify(demoMods))
    }
  }

  // Mods methods
  getMods(): Mod[] {
    try {
      const mods = localStorage.getItem(this.MODS_KEY)
      return mods ? JSON.parse(mods) : []
    } catch (error) {
      console.error("Error loading mods:", error)
      return []
    }
  }

  getModById(id: string): Mod | null {
    const mods = this.getMods()
    return mods.find((mod) => mod.id === id) || null
  }

  createMod(modData: Omit<Mod, "id" | "createdAt" | "updatedAt" | "downloadCount">): Mod {
    const mods = this.getMods()
    const newMod: Mod = {
      ...modData,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      downloadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mods.unshift(newMod) // Add to beginning
    localStorage.setItem(this.MODS_KEY, JSON.stringify(mods))
    return newMod
  }

  updateMod(id: string, updates: Partial<Mod>): Mod | null {
    const mods = this.getMods()
    const index = mods.findIndex((mod) => mod.id === id)
    if (index === -1) return null

    mods[index] = {
      ...mods[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    localStorage.setItem(this.MODS_KEY, JSON.stringify(mods))
    return mods[index]
  }

  deleteMod(id: string): boolean {
    const mods = this.getMods()
    const filteredMods = mods.filter((mod) => mod.id !== id)

    if (filteredMods.length === mods.length) return false

    localStorage.setItem(this.MODS_KEY, JSON.stringify(filteredMods))
    return true
  }

  incrementDownloadCount(id: string): void {
    const mods = this.getMods()
    const mod = mods.find((m) => m.id === id)
    if (mod) {
      mod.downloadCount++
      localStorage.setItem(this.MODS_KEY, JSON.stringify(mods))
    }
  }

  // Users methods
  getUsers(): User[] {
    try {
      const users = localStorage.getItem(this.USERS_KEY)
      return users ? JSON.parse(users) : []
    } catch (error) {
      console.error("Error loading users:", error)
      return []
    }
  }

  getUserByEmail(email: string): User | null {
    const users = this.getUsers()
    return users.find((user) => user.email === email) || null
  }

  // Auth methods
  login(email: string, password: string): User | null {
    // Simple demo authentication
    if (email === "admin@beamng-mods.com" && password === "admin123") {
      const user = this.getUserByEmail(email)
      if (user && user.isAdmin) {
        localStorage.setItem(this.AUTH_KEY, JSON.stringify({ user, timestamp: Date.now() }))
        return user
      }
    }
    return null
  }

  logout(): void {
    localStorage.removeItem(this.AUTH_KEY)
  }

  getCurrentUser(): User | null {
    try {
      const auth = localStorage.getItem(this.AUTH_KEY)
      if (!auth) return null

      const authData = JSON.parse(auth)
      // Check if session is still valid (24 hours)
      if (Date.now() - authData.timestamp > 24 * 60 * 60 * 1000) {
        this.logout()
        return null
      }

      return authData.user
    } catch (error) {
      console.error("Error checking auth:", error)
      return null
    }
  }

  // File handling
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  downloadFile(mod: Mod): void {
    if (!mod.fileData) {
      alert("File data not available for demo mods")
      return
    }

    try {
      // Convert base64 back to blob and download
      const byteCharacters = atob(mod.fileData.split(",")[1])
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray])

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = mod.fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      // Increment download count
      this.incrementDownloadCount(mod.id)
    } catch (error) {
      console.error("Error downloading file:", error)
      alert("Error downloading file")
    }
  }
}

export const localDB = new LocalStorageDB()
