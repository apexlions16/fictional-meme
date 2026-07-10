import { categories } from '../data/templates';
import { StatCard } from './StatCard';
import type { AppData, Category } from '../types/models';

interface AnalyticsProps {
  data: AppData;
}

export function Analytics({ data }: AnalyticsProps) {
  const categoryEntries = categories.filter((item): item is { id: Category; label: string; icon: string } => item.id !== 'all');
  const max = Math.max(1, ...categoryEntries.map((item) => data.stats.categoryCounts[item.id] ?? 0));
  const exportRate = data.stats.generated > 0 ? Math.round((data.stats.exported / data.stats.generated) * 100) : 0;
  const saveRate = data.stats.generated > 0 ? Math.round((data.documents.length / data.stats.generated) * 100) : 0;

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div><span className="eyebrow">Üretim zekâsı</span><h2>İstatistikler</h2><p>Fictional Meme kullanım alışkanlıklarının cihazındaki özeti.</p></div>
      </section>

      <section className="stats-grid">
        <StatCard label="Toplam üretim" value={data.stats.generated} detail="rastgele fikir" icon="✦" />
        <StatCard label="Dönüşüm" value={`%${exportRate}`} detail="üretimden PNG'ye" icon="⇩" />
        <StatCard label="Kayıt oranı" value={`%${saveRate}`} detail="arşivlenen proje" icon="▦" />
        <StatCard label="Aktif oturum" value={data.stats.sessions} detail="yerel kullanım" icon="◉" />
      </section>

      <section className="analytics-grid">
        <article className="panel chart-panel">
          <div className="panel-heading"><span className="eyebrow">Kategori dağılımı</span><h2>En çok üretilen evrenler</h2></div>
          <div className="bar-chart">
            {categoryEntries.map((item) => {
              const count = data.stats.categoryCounts[item.id] ?? 0;
              return (
                <div className="bar-row" key={item.id}>
                  <span>{item.icon} {item.label}</span>
                  <div><i style={{ width: `${(count / max) * 100}%` }} /></div>
                  <b>{count}</b>
                </div>
              );
            })}
          </div>
        </article>

        <article className="panel insight-panel">
          <div className="panel-heading"><span className="eyebrow">Stüdyo raporu</span><h2>Kısa içgörüler</h2></div>
          <div className="insight-list">
            <div><span>01</span><p><strong>{data.documents.filter((item) => item.favorite).length} favori proje</strong><small>En iyi fikirlerini yıldızlayarak hızlı erişimde tutuyorsun.</small></p></div>
            <div><span>02</span><p><strong>{data.stats.exported} paylaşılabilir çıktı</strong><small>PNG dışa aktarımları yüksek çözünürlükte hazırlanıyor.</small></p></div>
            <div><span>03</span><p><strong>{data.documents.length} yerel belge</strong><small>Verilerin sunucuya gönderilmeden bu cihazda saklanıyor.</small></p></div>
          </div>
        </article>
      </section>

      <section className="panel privacy-panel"><span>◈</span><div><h3>Gizlilik odaklı çalışma alanı</h3><p>Bu sürümde görseller, metinler ve istatistikler yalnızca tarayıcının yerel depolamasında tutulur. Sunucu veya hesap gerektirmez.</p></div></section>
    </div>
  );
}
