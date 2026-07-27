import { motion } from 'framer-motion'
import {
  AlertTriangle, Target, Calendar, Skull, TrendingUp, BarChart2
} from 'lucide-react'
import type { ACLEDEvent } from '../../types'
import { monthLabel, formatNumber, truncate } from '../../utils'
import { getEventTypeColor } from '../../utils/constants'

interface InsightsPanelProps {
  insights: ReturnType<typeof import('../../hooks/useData').useInsights>
}

interface InsightCardProps {
  icon: React.ReactNode
  title: string
  value: string
  sub?: string
  color: string
  delay: number
}

function InsightCard({ icon, title, value, sub, color, delay }: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className="flex items-start gap-3 p-3 rounded-lg bg-bg-primary border border-border hover:border-border-subtle transition-colors"
    >
      <div className={`p-1.5 rounded-lg flex-shrink-0`} style={{ background: `${color}20` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">{title}</p>
        <p className="text-sm font-semibold text-text-primary truncate">{value}</p>
        {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  )
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  if (!insights) {
    return (
      <div className="card p-5">
        <p className="text-text-muted text-sm">No data available</p>
      </div>
    )
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={14} className="text-accent-amber" />
        <h3 className="text-sm font-semibold text-text-primary">Auto-Generated Insights</h3>
      </div>

      <div className="space-y-2">
        {insights.mostAffectedRegion && (
          <InsightCard
            icon={<Target size={14} />}
            title="Most Affected Region"
            value={insights.mostAffectedRegion.region}
            sub={`${formatNumber(insights.mostAffectedRegion.count)} conflict incidents`}
            color="#EF4444"
            delay={0.05}
          />
        )}

        {insights.mostActiveActor && (
          <InsightCard
            icon={<BarChart2 size={14} />}
            title="Most Active Actor"
            value={truncate(insights.mostActiveActor.actor, 30)}
            sub={`${formatNumber(insights.mostActiveActor.count)} conflict incidents`}
            color="#3B82F6"
            delay={0.1}
          />
        )}

        {insights.deadliestMonth && (
          <InsightCard
            icon={<Calendar size={14} />}
            title="Deadliest Month"
            value={monthLabel(insights.deadliestMonth.month)}
            sub={`${formatNumber(insights.deadliestMonth.fatalities)} lives lost`}
            color="#F97316"
            delay={0.15}
          />
        )}

        {insights.highestFatalityEvent && (
          <InsightCard
            icon={<Skull size={14} />}
            title="Highest Lives Lost Incident"
            value={`${insights.highestFatalityEvent.fatalities} killed`}
            sub={`${insights.highestFatalityEvent.event_date} · ${insights.highestFatalityEvent.admin_lvl1}`}
            color="#A855F7"
            delay={0.2}
          />
        )}

        {insights.largestIncrease.month && (
          <InsightCard
            icon={<TrendingUp size={14} />}
            title="Largest Fatality Surge"
            value={monthLabel(insights.largestIncrease.month)}
            sub={`+${formatNumber(insights.largestIncrease.change)} vs previous month`}
            color="#F59E0B"
            delay={0.25}
          />
        )}

        {insights.mostCommonEventType && (
          <InsightCard
            icon={<BarChart2 size={14} />}
            title="Most Common Incident"
            value={insights.mostCommonEventType.type}
            sub={`${formatNumber(insights.mostCommonEventType.count)} conflict incidents`}
            color={getEventTypeColor(insights.mostCommonEventType.type)}
            delay={0.3}
          />
        )}
      </div>
    </div>
  )
}
