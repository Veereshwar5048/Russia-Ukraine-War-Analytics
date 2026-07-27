import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn, formatNumber } from '../../utils'
import { SparklineChart } from './SparklineChart'

interface KPICardProps {
  id: string
  label: string
  value: number
  icon: React.ReactNode
  color: 'blue' | 'red' | 'amber' | 'green' | 'purple'
  sparkline: number[]
  trend?: number
  trendLabel?: string
  delay?: number
  loading?: boolean
}

const COLOR_MAP = {
  blue: {
    icon: 'text-accent-blue',
    glow: 'shadow-glow-blue',
    border: 'border-accent-blue/20',
    bg: 'bg-accent-blue/10',
    spark: '#3B82F6',
    badge: 'bg-accent-blue/20 text-accent-blue-light',
  },
  red: {
    icon: 'text-accent-red',
    glow: 'shadow-glow-red',
    border: 'border-accent-red/20',
    bg: 'bg-accent-red/10',
    spark: '#EF4444',
    badge: 'bg-accent-red/20 text-accent-red-light',
  },
  amber: {
    icon: 'text-accent-amber',
    glow: 'shadow-glow-amber',
    border: 'border-accent-amber/20',
    bg: 'bg-accent-amber/10',
    spark: '#F59E0B',
    badge: 'bg-accent-amber/20 text-accent-amber-light',
  },
  green: {
    icon: 'text-accent-green',
    glow: '',
    border: 'border-accent-green/20',
    bg: 'bg-accent-green/10',
    spark: '#10B981',
    badge: 'bg-accent-green/20 text-accent-green',
  },
  purple: {
    icon: 'text-accent-purple',
    glow: '',
    border: 'border-accent-purple/20',
    bg: 'bg-accent-purple/10',
    spark: '#8B5CF6',
    badge: 'bg-accent-purple/20 text-accent-purple',
  },
}

/** Animated counter hook */
function useCounter(target: number, duration = 1000): number {
  const [count, setCount] = useState(0)
  const startTime = useRef<number | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (target === 0) { setCount(0); return }
    startTime.current = null
    const animate = (time: number) => {
      if (!startTime.current) startTime.current = time
      const elapsed = time - startTime.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setCount(Math.floor(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return count
}

export function KPICard({
  id, label, value, icon, color, sparkline, trend, trendLabel, delay = 0, loading = false,
}: KPICardProps) {
  const colors = COLOR_MAP[color]
  const displayValue = useCounter(value)

  if (loading) {
    return (
      <div className="card p-5 space-y-3 h-full flex flex-col justify-between">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-8 w-32 rounded" />
        <div className="skeleton h-10 w-full rounded" />
      </div>
    )
  }

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        'card p-4 sm:p-5 cursor-default group hover:scale-[1.01] transition-transform duration-200 h-full flex flex-col justify-between',
        colors.glow,
      )}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className={cn('p-2 rounded-lg', colors.bg)}>
            <span className={cn('block w-5 h-5', colors.icon)}>{icon}</span>
          </div>
          {trend !== undefined && (
            <div className={cn('flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full', colors.badge)}>
              {trend > 0 ? <TrendingUp size={11} /> : trend < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
              {Math.abs(trend).toFixed(1)}%
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-1">
          <p className="metric-label truncate" title={label}>{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-text-primary tabular-nums mt-1 truncate" title={formatNumber(displayValue)}>
            {formatNumber(displayValue)}
          </p>
          {trendLabel && (
            <p className="text-[11px] text-text-muted mt-0.5 truncate">{trendLabel}</p>
          )}
        </div>
      </div>

      {/* Sparkline */}
      {sparkline && sparkline.length > 0 && (
        <div className="mt-3 h-9 w-full">
          <SparklineChart data={sparkline} color={colors.spark} />
        </div>
      )}
    </motion.div>
  )
}
