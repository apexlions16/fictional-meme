import { useMemo, useRef, useState } from 'react';
import { getTemplate } from '../data/templates';
import { downloadJson, parseImport } from '../lib/storage';
import type { AppData, MemeDocument } from '../types/models';

interface LibraryProps {
  data: AppData;
  onOpen: (document: MemeDocument) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onImport: (data: AppData) => void;
  onNotify: (message: string) => void;
}

export function Library({ data, onOpen, onDelete, onToggleFavorite, onImport, onNotify }: LibraryProps) {
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [query, setQuery] = useState('');
  const importRef = useRef<HTMLInputElement>(null);

  const documents = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('tr-TR');
    return [...data.documents]
      .filter((item) => filter === 'all' || item.favorite)
      .filter((item) => !normalized || `${item.title} ${item.tags.join(' ')}`.toLocaleLowerCase('tr-TR').includes(normalized))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [data.documents, filter, query]);

  const handleImport = async (file?: File) => {
    if (!file) return;
    try {
      const imported = await parseImport(file);
      onImport(imported);
      onNotify(`${imported.documents.length} proje içe aktarıldı.`);
    } catch (error) {
      onNotify(error instanceof Error ? error.message : 'Yedek dosyası okunamadı.');
    } finally {
      if (importRef.current) importRef.current.value = '';
    }
  };

  return (
    <div className="page-stack">
      <section className="page-intro library-intro">
        <div><span className="eyebrow">Yerel arşiv</span><h2>Kütüphane</h2><p>Kaydettiğin tüm tasarımlar bu tarayıcıda tutulur. JSON yedeği alarak başka cihaza taşıyabilirsin.</p></div>
        <div className="library-actions">
          <button className="secondary-button" type="button" onClick={() => downloadJson(data)}>⇩ Yedekle</button>
          <button className="secondary-button" type="button" onClick={() => importRef.current?.click()}>⇧ İçe aktar</button>
          <input ref={importRef} type="file" accept="application/json" hidden onChange={(event) => handleImport(event.target.files?.[0])} />
        </div>
      </section>

      <section className="library-toolbar panel">
        <div className="layer-tabs">
          <button type="button" className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')}>Tüm projeler ({data.documents.length})</button>
          <button type="button" className={filter === 'favorites' ? 'is-active' : ''} onClick={() => setFilter('favorites')}>Favoriler ({data.documents.filter((item) => item.favorite).length})</button>
        </div>
        <div className="search-box small"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Projelerde ara..." /></div>
      </section>

      {documents.length > 0 ? (
        <section className="document-grid">
          {documents.map((item) => {
            const template = getTemplate(item.templateId);
            return (
              <article className="document-card" key={item.id}>
                <button type="button" className="document-preview" onClick={() => onOpen(item)} style={{ background: `linear-gradient(135deg, ${template.palette.join(', ')})` }}>
                  <span className="document-emoji">{template.emoji}</span>
                  <strong>{item.layers[0]?.text}</strong>
                  <b>{item.layers[1]?.text}</b>
                  <small>{item.ratio}</small>
                </button>
                <div className="document-body">
                  <div className="document-title-row"><div><h3>{item.title}</h3><p>{new Date(item.updatedAt).toLocaleString('tr-TR')}</p></div><button className={`favorite-button ${item.favorite ? 'is-active' : ''}`} type="button" onClick={() => onToggleFavorite(item.id)} aria-label="Favoriyi değiştir">★</button></div>
                  <div className="tag-row">{item.tags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}</div>
                  <div className="document-actions"><button className="secondary-button" type="button" onClick={() => onOpen(item)}>Düzenle</button><button className="icon-button danger" type="button" onClick={() => onDelete(item.id)} title="Sil">×</button></div>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <div className="empty-state"><span>▦</span><h3>Gösterilecek proje yok</h3><p>Filtreyi değiştir veya stüdyoda yeni bir tasarım kaydet.</p></div>
      )}
    </div>
  );
}
