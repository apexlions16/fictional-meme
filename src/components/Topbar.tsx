interface TopbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onCreate: () => void;
}

export function Topbar({ theme, onToggleTheme, onCreate }: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Hayal gücü motoru çevrimiçi</p>
        <h1>Fictional Meme Studio</h1>
      </div>
      <div className="topbar-actions">
        <span className="status-chip"><i /> Yerel kayıt açık</span>
        <button className="icon-button" type="button" onClick={onToggleTheme} title="Temayı değiştir">
          {theme === 'dark' ? '☀' : '☾'}
        </button>
        <button className="primary-button" type="button" onClick={onCreate}>＋ Yeni meme</button>
      </div>
    </header>
  );
}
