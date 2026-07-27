import { motion } from 'framer-motion'
import { Shield, Database, Info, ExternalLink } from 'lucide-react'

export function SettingsPage() {
  return (
    <div className="page-transition space-y-5">
      <div>
        <h2 className="text-base font-semibold text-text-primary">Settings & About</h2>
        <p className="text-xs text-text-muted mt-0.5">Configuration and information about this dashboard</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-accent-blue" />
            <h3 className="text-sm font-semibold text-text-primary">About This Dashboard</h3>
          </div>
          <div className="space-y-3 text-xs text-text-muted leading-relaxed">
            <p>
              The <strong className="text-text-secondary">Russia–Ukraine War Analytics Dashboard</strong> is a
              professional conflict intelligence tool built on the ACLED (Armed Conflict Location & Event Data)
              dataset.
            </p>
            <p>
              All data is loaded locally from cleaned CSV files — no live API calls to ACLED are made.
              The dataset covers <strong className="text-text-secondary">191,954 conflict incidents</strong> from
              February 24, 2022 through March 2025.
            </p>
            <p>
              Built with React 19, Vite, TypeScript, Tailwind CSS, Recharts, and Leaflet.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['React 19', 'TypeScript', 'Vite', 'Tailwind CSS', 'Recharts', 'Leaflet', 'PapaParse', 'Framer Motion'].map((t) => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-accent-blue/10 text-accent-blue border border-accent-blue/20">{t}</span>
            ))}
          </div>
        </motion.div>

        {/* Data info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Database size={16} className="text-accent-green" />
            <h3 className="text-sm font-semibold text-text-primary">Dataset Information</h3>
          </div>
          <div className="space-y-2">
            {[
              ['Source', 'ACLED (Armed Conflict Location & Event Data)'],
              ['Coverage', 'Russia–Ukraine War, Feb 2022 – Mar 2025'],
              ['Conflict Incidents', '191,954'],
              ['Lives Lost', '174,289'],
              ['Columns', '27 attributes per incident'],
              ['Supplementary', 'Monthly summary with equipment losses, refugee data, sanctions'],
              ['Last Cleaned', new Date().toLocaleDateString()],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-start py-1.5 border-b border-border last:border-0">
                <span className="text-xs text-text-muted">{label}</span>
                <span className="text-xs text-text-primary font-medium text-right max-w-[55%]">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Keyboard shortcuts */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Info size={16} className="text-accent-amber" />
            <h3 className="text-sm font-semibold text-text-primary">Keyboard Shortcuts</h3>
          </div>
          <div className="space-y-2">
            {[
              ['D', 'Go to Dashboard'],
              ['M', 'Go to Map'],
              ['T', 'Go to Timeline'],
              ['E', 'Go to Equipment Losses'],
              ['R', 'Go to Regions'],
              ['/', 'Focus global search'],
              ['Esc', 'Close menus'],
            ].map(([key, action]) => (
              <div key={key} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-xs text-text-muted">{action}</span>
                <kbd className="text-[10px] px-2 py-0.5 rounded bg-bg-primary border border-border text-text-secondary font-mono">{key}</kbd>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Links */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <ExternalLink size={16} className="text-accent-purple" />
            <h3 className="text-sm font-semibold text-text-primary">Resources</h3>
          </div>
          <div className="space-y-2">
            {[
              ['ACLED Website', 'https://acleddata.com'],
              ['ACLED Conflict Monitor', 'https://acleddata.com/conflict-monitor'],
              ['Ukraine Crisis Media Center', 'https://uacrisis.org'],
            ].map(([label, url]) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-2 border-b border-border last:border-0 group"
              >
                <span className="text-xs text-text-secondary group-hover:text-accent-blue transition-colors">{label}</span>
                <ExternalLink size={10} className="text-text-muted group-hover:text-accent-blue transition-colors" />
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
