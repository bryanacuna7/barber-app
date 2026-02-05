/**
 * LoyaltyRing Component
 *
 * Circular progress indicator for client loyalty
 * Based on demo-fusion.html design
 */

interface LoyaltyRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function LoyaltyRing({
  percentage,
  size = 120,
  strokeWidth = 8,
  className = '',
}: LoyaltyRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  // Color based on percentage
  const getColor = () => {
    if (percentage >= 80) return 'stroke-green-500'
    if (percentage >= 50) return 'stroke-blue-500'
    if (percentage >= 30) return 'stroke-amber-500'
    return 'stroke-zinc-400'
  }

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-zinc-200 dark:stroke-zinc-700 fill-none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={`${getColor()} fill-none transition-all duration-700 ease-out`}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-zinc-900 dark:text-white">
          {Math.round(percentage)}%
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">Lealtad</span>
      </div>
    </div>
  )
}
