"use client"

import { useState, useEffect } from "react"
import { Search, Download, Calendar, HardDrive, Settings, LogIn } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { BeamNGLogo } from "@/components/beamng-logo"
import type { Mod } from "@/lib/server-storage"

const categories = [
  { value: "all", label: "Все категории" },
  { value: "vehicles", label: "Автомобили" },
  { value: "maps", label: "Карты" },
  { value: "parts", label: "Запчасти" },
  { value: "skins", label: "Скины" },
  { value: "sounds", label: "Звуки" },
  { value: "other", label: "Прочее" },
]

export default function HomePage() {
  const [mods, setMods] = useState<Mod[]>([])
  const [filteredMods, setFilteredMods] = useState<Mod[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchMods()
    checkAuth()
  }, [])

  useEffect(() => {
    filterMods()
  }, [mods, searchQuery, selectedCategory])

  const checkAuth = () => {
    const auth = localStorage.getItem("beamng_auth")
    if (auth) {
      try {
        const authData = JSON.parse(auth)
        setCurrentUser(authData.user)
      } catch (error) {
        localStorage.removeItem("beamng_auth")
      }
    }
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
    } finally {
      setLoading(false)
    }
  }

  const filterMods = () => {
    let filtered = mods

    if (selectedCategory !== "all") {
      filtered = filtered.filter((mod) => mod.category === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (mod) =>
          mod.title.toLowerCase().includes(query) ||
          mod.author.toLowerCase().includes(query) ||
          (mod.description && mod.description.toLowerCase().includes(query)),
      )
    }

    setFilteredMods(filtered)
  }

  const handleDownload = async (mod: Mod) => {
    try {
      // Увеличиваем счётчик скачиваний
      await fetch(`/api/mods/${mod.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "increment_download" }),
      })

      // Открываем файл для скачивания
      window.open(`/uploads/${mod.fileName}`, "_blank")

      // Обновляем локальное состояние
      setMods((prevMods) => prevMods.map((m) => (m.id === mod.id ? { ...m, downloadCount: m.downloadCount + 1 } : m)))

      toast({
        title: "Скачивание началось",
        description: `Мод "${mod.title}" скачивается`,
      })
    } catch (error) {
      console.error("Ошибка скачивания:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось скачать мод",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка модов...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BeamNGLogo className="w-8 h-8" />
              <span className="text-xl font-bold">BeamNG Моды</span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <a href="#mods" className="text-muted-foreground hover:text-foreground transition-colors">
                Найти моды
              </a>
              <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
                О проекте
              </a>
            </nav>

            <div className="flex items-center gap-3">
              {currentUser?.isAdmin ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Добро пожаловать, {currentUser.name}</span>
                  <Button asChild size="sm">
                    <a href="/admin">
                      <Settings className="w-4 h-4 mr-2" />
                      Админ-панель
                    </a>
                  </Button>
                </div>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <a href="/admin">
                    <LogIn className="w-4 h-4 mr-2" />
                    Админ
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <BeamNGLogo className="w-24 h-24 mx-auto mb-8" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Скачивайте моды для <span className="text-primary">BeamNG.drive</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Большая коллекция модификаций BeamNG.drive. Скачивайте бесплатно и наслаждайтесь игрой!
            </p>
            <div className="flex justify-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90"
                onClick={() => document.getElementById("mods")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Download className="w-5 h-5 mr-2" />
                Найти моды
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section id="mods" className="py-8 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Поиск модов..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-lg bg-background"
                  />
                </div>
              </div>
              <div className="md:w-64">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-12 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Всего модов</p>
                  <p className="text-2xl font-bold">{mods.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Search className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Найдено</p>
                  <p className="text-2xl font-bold">{filteredMods.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Download className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Скачиваний</p>
                  <p className="text-2xl font-bold">{mods.reduce((total, mod) => total + mod.downloadCount, 0)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mods Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredMods.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-muted-foreground mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">
                {mods.length === 0 ? "Моды ещё не загружены" : "Моды не найдены"}
              </h3>
              <p className="text-muted-foreground text-lg">
                {mods.length === 0
                  ? "Администратор ещё не добавил моды на сайт"
                  : searchQuery || selectedCategory !== "all"
                    ? "Попробуйте изменить параметры поиска"
                    : "Моды отсутствуют"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filteredMods.map((mod) => (
                <ModCard key={mod.id} mod={mod} onDownload={handleDownload} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">О проекте BeamNG Моды</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Это платформа для скачивания модификаций BeamNG.drive. Все моды проверены и безопасны для использования.
              Скачивайте бесплатно и наслаждайтесь новым контентом!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Бесплатные моды</h3>
                <p className="text-sm text-muted-foreground">Все моды доступны для бесплатного скачивания</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <HardDrive className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-semibold mb-2">Быстрые загрузки</h3>
                <p className="text-sm text-muted-foreground">Прямые ссылки на скачивание без ожидания</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-semibold mb-2">Проверенный контент</h3>
                <p className="text-sm text-muted-foreground">Все моды проверены администрацией</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <BeamNGLogo className="w-8 h-8" />
              <span className="text-xl font-bold">BeamNG Моды</span>
            </div>
            <p className="text-muted-foreground">© 2024 BeamNG Моды. Платформа для скачивания модов.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function ModCard({ mod, onDownload }: { mod: Mod; onDownload: (mod: Mod) => void }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} МБ`
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      vehicles: "Автомобили",
      maps: "Карты",
      parts: "Запчасти",
      skins: "Скины",
      sounds: "Звуки",
      other: "Прочее",
    }
    return labels[category] || category
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border hover:border-primary/20 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
              {mod.title}
            </CardTitle>
            <CardDescription className="mt-1">автор: {mod.author}</CardDescription>
          </div>
          <Badge variant="secondary" className="ml-2">
            {getCategoryLabel(mod.category)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{mod.description || "Описание отсутствует"}</p>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(mod.createdAt)}
          </div>
          <div className="flex items-center gap-1">
            <HardDrive className="h-3 w-3" />
            {formatFileSize(mod.fileSize)}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Download className="h-3 w-3" />
            {mod.downloadCount} скачиваний
          </div>
          <Button size="sm" onClick={() => onDownload(mod)} className="bg-primary hover:bg-primary/90">
            <Download className="h-3 w-3 mr-1" />
            Скачать
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
