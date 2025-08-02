export function BeamNGLogo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <div className={`${className} relative`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Внешнее кольцо */}
        <circle cx="50" cy="50" r="45" fill="none" stroke="#FF6B35" strokeWidth="6" className="opacity-80" />

        {/* Внутренние элементы */}
        <circle cx="50" cy="50" r="30" fill="none" stroke="#004E98" strokeWidth="4" />

        {/* Центральный элемент */}
        <circle cx="50" cy="50" r="15" fill="#FF6B35" />

        {/* Буква B стилизованная */}
        <path
          d="M42 35 L42 65 L52 65 Q58 65 58 57.5 Q58 50 52 50 L42 50 M42 50 L50 50 Q56 50 56 42.5 Q56 35 50 35 L42 35"
          fill="white"
          strokeWidth="1"
        />
      </svg>
    </div>
  )
}
