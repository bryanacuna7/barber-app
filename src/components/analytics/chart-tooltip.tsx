'use client'

interface ChartTooltipTone {
  bg: string
  border: string
  text: string
}

interface ChartTooltipProps {
  label: string
  metricLabel: string
  value: string
  tone: ChartTooltipTone
}

export function ChartTooltip({ label, metricLabel, value, tone }: ChartTooltipProps) {
  return (
    <div
      className="rounded-xl border px-3 py-2.5 backdrop-blur-sm shadow-[0_10px_28px_rgba(0,0,0,0.35)]"
      style={{
        backgroundColor: tone.bg,
        borderColor: tone.border,
        color: tone.text,
      }}
    >
      <p className="text-xs font-semibold leading-tight" style={{ color: tone.text }}>
        {label}
      </p>
      <p className="mt-1 text-sm font-medium leading-tight" style={{ color: tone.text }}>
        {metricLabel}: <span className="font-semibold">{value}</span>
      </p>
    </div>
  )
}
