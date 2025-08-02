import { type NextRequest, NextResponse } from "next/server"
import { serverStorage } from "@/lib/server-storage"

export async function GET() {
  try {
    const mods = await serverStorage.getMods()
    return NextResponse.json(mods)
  } catch (error) {
    console.error("Ошибка получения модов:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const author = formData.get("author") as string
    const version = formData.get("version") as string
    const category = formData.get("category") as string

    if (!file || !title || !author || !category) {
      return NextResponse.json({ error: "Отсутствуют обязательные поля" }, { status: 400 })
    }

    // Генерируем уникальное имя файла
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`

    // Сохраняем файл
    await serverStorage.saveFile(file, fileName)

    // Создаём запись о моде
    const mod = await serverStorage.createMod({
      title,
      description: description || null,
      author,
      version: version || "1.0",
      category,
      fileName,
      fileSize: file.size,
    })

    return NextResponse.json(mod)
  } catch (error) {
    console.error("Ошибка создания мода:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
