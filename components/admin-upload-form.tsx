"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Loader2, AlertCircle, HardDrive } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

const categories = [
  { value: "vehicles", label: "Автомобили" },
  { value: "maps", label: "Карты" },
  { value: "parts", label: "Запчасти" },
  { value: "skins", label: "Скины" },
  { value: "sounds", label: "Звуки" },
  { value: "other", label: "Прочее" },
]

interface AdminUploadFormProps {
  onModUploaded?: () => void
}

export function AdminUploadForm({ onModUploaded }: AdminUploadFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    author: "",
    version: "1.0",
    category: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Проверяем размер файла (максимум 100MB)
      if (selectedFile.size > 100 * 1024 * 1024) {
        toast({
          title: "Файл слишком большой",
          description: "Размер файла не должен превышать 100MB",
          variant: "destructive",
        })
        return
      }
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || !formData.title || !formData.author || !formData.category) {
      toast({
        title: "Недостаточно данных",
        description: "Заполните все обязательные поля и выберите файл",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("file", file)
      formDataToSend.append("title", formData.title)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("author", formData.author)
      formDataToSend.append("version", formData.version)
      formDataToSend.append("category", formData.category)

      const response = await fetch("/api/mods", {
        method: "POST",
        body: formDataToSend,
      })

      if (response.ok) {
        toast({
          title: "Успешно!",
          description: "Мод загружен на сервер",
        })

        // Сбрасываем форму
        setFormData({
          title: "",
          description: "",
          author: "",
          version: "1.0",
          category: "",
        })
        setFile(null)

        // Очищаем input файла
        const fileInput = document.getElementById("file-upload") as HTMLInputElement
        if (fileInput) fileInput.value = ""

        // Уведомляем родительский компонент
        if (onModUploaded) {
          onModUploaded()
        }
      } else {
        const error = await response.json()
        throw new Error(error.error)
      }
    } catch (error: any) {
      console.error("Ошибка загрузки мода:", error)
      toast({
        title: "Ошибка загрузки",
        description: error.message || "Не удалось загрузить мод. Попробуйте ещё раз.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Загрузить новый мод</CardTitle>
        <CardDescription>Заполните информацию о моде и загрузите файл на сервер</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <HardDrive className="h-4 w-4" />
          <AlertDescription>
            <strong>Серверное хранение:</strong> Файлы загружаются на сервер и будут доступны всем пользователям.
            Максимальный размер файла: 100MB.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-medium">
                Название мода *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Введите название мода"
                className="h-11 bg-background"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author" className="font-medium">
                Автор *
              </Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => handleInputChange("author", e.target.value)}
                placeholder="Имя автора"
                className="h-11 bg-background"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="version" className="font-medium">
                Версия
              </Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => handleInputChange("version", e.target.value)}
                placeholder="1.0"
                className="h-11 bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="font-medium">
                Категория *
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger className="h-11 bg-background">
                  <SelectValue placeholder="Выберите категорию" />
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

          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium">
              Описание
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Описание мода (необязательно)"
              rows={4}
              className="resize-none bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload" className="font-medium">
              Файл мода * (Макс. 100MB)
            </Label>
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              accept=".zip,.rar,.7z"
              className="h-11 bg-background"
              required
            />
            {file && (
              <div className="p-4 bg-background rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Размер: {(file.size / (1024 * 1024)).toFixed(1)} МБ • Тип: {file.type || "Неизвестно"}
                    </p>
                  </div>
                  {file.size > 100 * 1024 * 1024 && (
                    <div className="text-red-500">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isUploading || (file && file.size > 100 * 1024 * 1024)}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Загрузка на сервер...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Загрузить мод
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
