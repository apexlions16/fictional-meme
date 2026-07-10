import type { View } from '../types/models';

interface SidebarProps {
  view: View;
  onChange: (view: View) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const items: { id: View; icon: string; label: string }[] = [
  { id: 'dashboard', icon: '⌂', label: 'Ana Panel' },
  { id: 'discover', icon: '✦', label: 'Keşfet' },
  { id: 'studio', icon: '✎', label: 'Stüdyo' },
  { id: 'library', icon: '▦', label: 'Kütüphane' },
  { id: 'analytics', icon: '↗', label: 'İstatistikler' },
];

export function Sidebar({ view, onChange, collapsed, onToggle }: SidebarProps) {
  return (
    <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <button className="brand" type="button" onClick={() => onChange('dashboard')} aria-label="Ana panele git">
        <span className="brand-mark">FM</span>
        <span className="brand-copy"><strong>Fictional</strong><small>Meme Studio</small></span>
      </button>

      <nav className="nav-list" aria-label="Ana menü">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${view === item.id ? 'is-active' : ''}`}
            onClick={() => onChange(item.id)}
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-card">
        <span className="sidebar-card-icon">⚡</span>
        <strong>Prototip v1</strong>
        <p>Tarayıcıda çalışır, verilerini cihazında saklar.</p>
      </div>

      <button className="sidebar-toggle" type="button" onClick={onToggle} aria-label="Kenar çubuğunu daralt">
        {collapsed ? '›' : '‹'}
      </button>
    </aside>
  );
}
