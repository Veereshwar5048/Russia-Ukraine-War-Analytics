import { motion } from 'framer-motion'
import {
  LayoutDashboard, Map, Clock, Crosshair, Users,
  Globe, FileText, Settings, Shield, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { cn } from '../../utils'
import type { Page } from '../../types'

interface SidebarItem {
  id: Page
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'map', label: 'Map', icon: <Map size={18} /> },
  { id: 'timeline', label: 'Timeline', icon: <Clock size={18} /> },
  { id: 'equipment', label: 'Equipment Losses', icon: <Crosshair size={18} /> },
  { id: 'civilian', label: 'Civilian Impact', icon: <Users size={18} /> },
  { id: 'regions', label: 'Regions', icon: <Globe size={18} /> },
  { id: 'reports', label: 'Reports', icon: <FileText size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
]

interface SidebarProps {
  activePage: Page
  onNavigate: (page: Page) => void
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ activePage, onNavigate, collapsed, onToggle }: SidebarProps) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative flex flex-col bg-bg-card border-r border-border h-full z-20 overflow-hidden"
    >
      {/* Logo / Brand */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-border',
        collapsed && 'justify-center px-0',
      )}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent-blue/20 border border-accent-blue/40 flex items-center justify-center">
          <Shield size={16} className="text-accent-blue" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <p className="text-xs font-bold text-text-primary leading-tight">WAR ANALYTICS</p>
            <p className="text-[10px] text-text-muted leading-tight">Russia–Ukraine</p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.id
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-accent-blue/15 text-accent-blue-light border border-accent-blue/25'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5',
                collapsed && 'justify-center px-0',
              )}
            >
              <span className={cn('flex-shrink-0', isActive ? 'text-accent-blue' : '')}>{item.icon}</span>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        id="sidebar-toggle"
        onClick={onToggle}
        className="m-2 p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors flex items-center justify-center"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </motion.aside>
  )
}
