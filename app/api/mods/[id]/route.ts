import { type NextRequest, NextResponse } from "next/server"
import { serverStorage } from "@/lib/server-storage"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await serverStorage.deleteMod(params.id)
    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Мод не найден" }, { status: 404 })
    }
  } catch (error) {
    console.error("Ошибка удаления мода:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { action } = await request.json()

    if (action === "increment_download") {
      await serverStorage.incrementDownloadCount(params.id)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 })
  } catch (error) {
    console.error("Ошибка обновления мода:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
