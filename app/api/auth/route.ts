import { type NextRequest, NextResponse } from "next/server"
import { serverStorage } from "@/lib/server-storage"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Простая проверка (в реальном приложении используйте хеширование)
    if (email === "admin@beamng-mods.ru" && password === "admin123") {
      const user = await serverStorage.getUserByEmail(email)
      if (user && user.isAdmin) {
        return NextResponse.json({ user })
      }
    }

    return NextResponse.json({ error: "Неверные учетные данные" }, { status: 401 })
  } catch (error) {
    console.error("Ошибка аутентификации:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
