"use client"

import { Download, Calendar, User, Tag, HardDrive } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Mod } from "@/lib/supabase"

interface ModCardProps {
  mod: Mod
  onDownload: (mod: Mod) => void
}

export function ModCard({ mod, onDownload }: ModCardProps) {
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Неизвестно"
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} МБ`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU")
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
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{mod.title}</CardTitle>
            <CardDescription className="mt-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-3 w-3" />
                {mod.author}
                <Badge variant="secondary" className="ml-2">
                  v{mod.version}
                </Badge>
              </div>
            </CardDescription>
          </div>
          <Badge variant="outline">
            <Tag className="h-3 w-3 mr-1" />
            {getCategoryLabel(mod.category)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3">{mod.description || "Описание отсутствует"}</p>

        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <HardDrive className="h-3 w-3" />
            {formatFileSize(mod.file_size)}
          </div>
          <div className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            {mod.download_count}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(mod.created_at)}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={() => onDownload(mod)} className="w-full" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Скачать
        </Button>
      </CardFooter>
    </Card>
  )
}
