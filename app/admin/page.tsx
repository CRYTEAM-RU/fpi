"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Upload, List, Trash2, Shield, LogOut, Home, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { BeamNGLogo } from "@/components/beamng-logo"
import { AdminUploadForm } from "@/components/admin-upload-form"
import type { Mod, User } from "@/lib/server-storage"

export default function AdminPage() {
  const [mods, setMods] = useState<Mod[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchMods()
    }
  }, [isAuthenticated])

  const checkAuth = () => {
    const auth = localStorage.getItem("beamng_auth")
    if (auth) {
      try {
        const authData = JSON.parse(auth)
        setIsAuthenticated(true)
        setCurrentUser(authData.user)
      } catch (error) {
        localStorage.removeItem("beamng_auth")
      }
    }
    setLoading(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setIsAuthenticated(true)
        setCurrentUser(data.user)
        localStorage.setItem("beamng_auth", JSON.stringify(data))

        toast({
          title: "Успешно!",
          description: "Добро пожаловать в админ-панель",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error)
      }
    } catch (error: any) {
      toast({
        title: "Ошибка входа",
        description: error.message || "Неверные учетные данные",
        variant: "destructive",
      })
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("beamng_auth")
    setIsAuthenticated(false)
    setCurrentUser(null)
    toast({
      title: "Выход выполнен",
      description: "Вы вышли из админ-панели",
    })
  }

  const fetchMods = async () => {
    try {
      const response = await fetch("/api/mods")
      if (response.ok) {
        const data = await response.json()
        setMods(data)
      }
    } catch (error) {
      console.error("Ошибка загрузки модов:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить моды",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMod = async (mod: Mod) => {
    if (!confirm(`Вы уверены, что хотите удалить мод "${mod.title}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/mods/${mod.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setMods((prevMods) => prevMods.filter((m) => m.id !== mod.id))
        toast({
          title: "Успешно!",
          description: "Мод удалён",
        })
      } else {
        throw new Error("Ошибка удаления")
      }
    } catch (error) {
      console.error("Ошибка удаления мода:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось удалить мод",
        variant: "destructive",
      })
    }
  }

  const handleModUploaded = () => {
    fetchMods()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md bg-card border-border">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto mb-6">
                <BeamNGLogo className="w-16 h-16 mx-auto mb-4" />
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Админ-панель</CardTitle>
              <CardDescription>Войдите для управления модами BeamNG</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Введите email"
                    className="h-11 bg-background"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="font-medium">
                    Пароль
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    className="h-11 bg-background"
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoggingIn} className="w-full h-11 bg-primary hover:bg-primary/90">
                  {isLoggingIn ? "Вход..." : "Войти"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Button asChild variant="outline" size="sm">
                  <a href="/">
                    <Home className="w-4 h-4 mr-2" />
                    На главную
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BeamNGLogo className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">Админ-панель</h1>
                <p className="text-sm text-muted-foreground">Управление модами BeamNG.drive</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Добро пожаловать, {currentUser?.name}</span>
              <Button asChild variant="outline" size="sm">
                <a href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Главная
                </a>
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Серверное хранение:</strong> Все моды сохраняются на сервере в папке uploads. Файлы будут доступны
            всем пользователям для скачивания.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-card">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Загрузить мод
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Управление модами ({mods.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <AdminUploadForm onModUploaded={handleModUploaded} />
          </TabsContent>

          <TabsContent value="manage">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Управление модами</CardTitle>
                <CardDescription>Просмотр и управление загруженными модами</CardDescription>
              </CardHeader>
              <CardContent>
                {mods.length === 0 ? (
                  <div className="text-center py-12">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg mb-2">Моды ещё не загружены</p>
                    <p className="text-muted-foreground text-sm">
                      Загрузите первые моды, чтобы пользователи могли их скачивать
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {mods.map((mod) => (
                      <div
                        key={mod.id}
                        className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary/20 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{mod.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            автор: {mod.author} • {mod.category} • v{mod.version}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {mod.downloadCount} скачиваний • {new Date(mod.createdAt).toLocaleDateString("ru-RU")} •{" "}
                            {(mod.fileSize / (1024 * 1024)).toFixed(1)} МБ
                          </p>
                          {mod.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{mod.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteMod(mod)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
