import { StatCard } from './StatCard';
import { TemplateCard } from './TemplateCard';
import { templates } from '../data/templates';
import { getTemplate } from '../data/templates';
import type { AppData, MemeDocument, MemeTemplate } from '../types/models';

interface DashboardProps {
  data: AppData;
  onUseTemplate: (template: MemeTemplate) => void;
  onOpenDocument: (document: MemeDocument) => void;
  onNavigateDiscover: () => void;
}

export function Dashboard({ data, onUseTemplate, onOpenDocument, onNavigateDiscover }: DashboardProps) {
  const recent = [...data.documents].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);
  const favoriteCount = data.documents.filter((item) => item.favorite).length;

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="hero-badge">✦ Fictional Engine 1.0</span>
          <h2>Gerçekte olmayan karakterlerden<br /><em>fazlasıyla gerçek</em> memeler.</h2>
          <p>Şablon seç, hikâyeyi üret, metni tasarla ve sosyal medyaya hazır PNG olarak dışa aktar.</p>
          <div className="hero-actions">
            <button className="primary-button large" type="button" onClick={() => onUseTemplate(templates[0])}>Stüdyoyu aç</button>
            <button className="ghost-button large" type="button" onClick={onNavigateDiscover}>Şablonları keşfet</button>
          </div>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <div className="orbit-ring ring-one" />
          <div className="orbit-ring ring-two" />
          <span className="orbit-core">🐉</span>
          <span className="orbit-node node-one">👽</span>
          <span className="orbit-node node-two">🧙</span>
          <span className="orbit-node node-three">👻</span>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard label="Üretilen" value={data.stats.generated} detail="toplam fikir" icon="✦" />
        <StatCard label="Kaydedilen" value={data.documents.length} detail={`${favoriteCount} favori`} icon="▦" />
        <StatCard label="Dışa aktarılan" value={data.stats.exported} detail="PNG dosyası" icon="⇩" />
        <StatCard label="Oturum" value={data.stats.sessions} detail="bu cihazda" icon="◉" />
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div><span className="eyebrow">Trend evrenler</span><h2>Popüler şablonlar</h2></div>
          <button className="text-button" type="button" onClick={onNavigateDiscover}>Tümünü gör →</button>
        </div>
        <div className="template-grid compact-grid">
          {templates.slice(0, 4).map((template) => (
            <TemplateCard key={template.id} template={template} onUse={onUseTemplate} />
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div><span className="eyebrow">Çalışma alanın</span><h2>Son projeler</h2></div>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state">
            <span>✎</span>
            <h3>Henüz kayıtlı bir meme yok</h3>
            <p>İlk şablonunu açıp tasarımını kaydettiğinde burada görünecek.</p>
            <button className="secondary-button" type="button" onClick={() => onUseTemplate(templates[2])}>İlk projeyi başlat</button>
          </div>
        ) : (
          <div className="recent-grid">
            {recent.map((item) => {
              const template = getTemplate(item.templateId);
              return (
                <button key={item.id} type="button" className="recent-card" onClick={() => onOpenDocument(item)}>
                  <span className="recent-art" style={{ background: `linear-gradient(135deg, ${template.palette.join(', ')})` }}>{template.emoji}</span>
                  <span><strong>{item.title}</strong><small>{new Date(item.updatedAt).toLocaleString('tr-TR')}</small></span>
                  <b>›</b>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
