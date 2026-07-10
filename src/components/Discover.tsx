import { useMemo, useState } from 'react';
import { categories, templates } from '../data/templates';
import { TemplateCard } from './TemplateCard';
import type { Category, MemeTemplate } from '../types/models';

interface DiscoverProps {
  onUseTemplate: (template: MemeTemplate) => void;
}

export function Discover({ onUseTemplate }: DiscoverProps) {
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'popular' | 'name'>('popular');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('tr-TR');
    return templates
      .filter((template) => category === 'all' || template.category === category)
      .filter((template) => !normalized || `${template.name} ${template.description} ${template.tags.join(' ')}`.toLocaleLowerCase('tr-TR').includes(normalized))
      .sort((a, b) => sort === 'popular' ? b.popularity - a.popularity : a.name.localeCompare(b.name, 'tr'));
  }, [category, query, sort]);

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div><span className="eyebrow">Şablon galaksisi</span><h2>Bir evren seç, hikâyeyi yeniden yaz.</h2><p>Her şablon kendi renk paleti, karakteri ve metin üretim mantığıyla gelir.</p></div>
        <div className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Şablon, etiket veya karakter ara..." /></div>
      </section>

      <section className="filter-bar">
        <div className="category-tabs">
          {categories.map((item) => (
            <button key={item.id} type="button" className={category === item.id ? 'is-active' : ''} onClick={() => setCategory(item.id)}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </div>
        <select value={sort} onChange={(event) => setSort(event.target.value as 'popular' | 'name')} aria-label="Sıralama">
          <option value="popular">En popüler</option>
          <option value="name">Ada göre</option>
        </select>
      </section>

      <div className="results-line"><strong>{filtered.length}</strong> şablon bulundu</div>
      <section className="template-grid">
        {filtered.map((template) => <TemplateCard key={template.id} template={template} onUse={onUseTemplate} />)}
      </section>
      {filtered.length === 0 && <div className="empty-state"><span>⌕</span><h3>Bu evrende sonuç yok</h3><p>Arama kelimelerini veya kategori filtresini değiştir.</p></div>}
    </div>
  );
}
