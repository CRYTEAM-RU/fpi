const fs = require("fs")
const path = require("path")

// Создаём необходимые директории
const directories = ["data", "public/uploads"]

const defaultUsers = [
  {
    id: "1",
    email: "admin@beamng-mods.ru",
    name: "Администратор",
    isAdmin: true,
    createdAt: new Date().toISOString(),
  },
]

// Полностью пустой массив модов
const emptyMods = []

console.log("🚀 Инициализация хранилища данных...\n")

// Создаём директории
directories.forEach((dir) => {
  const fullPath = path.join(process.cwd(), dir)

  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true })
    console.log(`✅ Создана папка: ${dir}`)
  } else {
    console.log(`📁 Папка уже существует: ${dir}`)
  }
})

// Создаём файл с пользователями
const usersPath = path.join(process.cwd(), "data", "users.json")
if (!fs.existsSync(usersPath)) {
  fs.writeFileSync(usersPath, JSON.stringify(defaultUsers, null, 2))
  console.log("✅ Создан файл: data/users.json")
} else {
  console.log("📄 Файл уже существует: data/users.json")
}

// Создаём полностью пустой файл с модами
const modsPath = path.join(process.cwd(), "data", "mods.json")
if (!fs.existsSync(modsPath)) {
  fs.writeFileSync(modsPath, JSON.stringify(emptyMods, null, 2))
  console.log("✅ Создан файл: data/mods.json (пустой массив)")
} else {
  console.log("📄 Файл уже существует: data/mods.json")
}

// Создаём .gitkeep файлы для пустых папок
const gitkeepPath = path.join(process.cwd(), "public", "uploads", ".gitkeep")
if (!fs.existsSync(gitkeepPath)) {
  fs.writeFileSync(gitkeepPath, "# Эта папка для загруженных файлов модов\n")
  console.log("✅ Создан файл: public/uploads/.gitkeep")
}

console.log("\n🎉 Инициализация завершена!")
console.log("\n📋 Структура проекта:")
console.log("├── data/")
console.log("│   ├── users.json    # Только админ пользователь")
console.log("│   └── mods.json     # Полностью пустой массив")
console.log("└── public/uploads/   # Пустая папка для файлов модов")
console.log("\n💡 Следующие шаги:")
console.log("   1. Запустить сервер: npm run dev")
console.log("   2. Перейти на /admin")
console.log("   3. Войти как администратор")
console.log("   4. Загрузить первые моды")
console.log("\n🔒 Обычные пользователи смогут только скачивать загруженные моды")
