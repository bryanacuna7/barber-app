interface SparklineChartProps {
  /** Unique string used as SVG gradient ID — must be unique per page */
  id: string
  data: number[]
  color: string
  ariaLabel: string
  /** Fixed viewBox width for math; SVG renders at 100% of container */
  vbWidth?: number
  height?: number
}

export function SparklineChart({
  id,
  data,
  color,
  ariaLabel,
  vbWidth = 80,
  height = 28,
}: SparklineChartProps) {
  if (!data || data.length < 2) return null

  const max = Math.max(...data, 1)
  const min = Math.min(...data)
  const range = max - min || 1
  const pad = 2

  const pts = data
    .map((v, i) => {
      const x = ((i / (data.length - 1)) * vbWidth).toFixed(1)
      const y = (height - pad - ((v - min) / range) * (height - pad * 2)).toFixed(1)
      return `${x},${y}`
    })
    .join(' ')

  const areaPoints = `${pts} ${vbWidth},${height} 0,${height}`
  const gradId = `sg-${id}`

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      width="100%"
      height={height}
      viewBox={`0 0 ${vbWidth} ${height}`}
      preserveAspectRatio="none"
      fill="none"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={areaPoints} fill={`url(#${gradId})`} />
      <polyline
        points={pts}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
