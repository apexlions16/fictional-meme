import type { MemeTemplate } from '../types/models';

interface TemplateCardProps {
  template: MemeTemplate;
  onUse: (template: MemeTemplate) => void;
}

export function TemplateCard({ template, onUse }: TemplateCardProps) {
  return (
    <article className="template-card">
      <button
        type="button"
        className="template-art"
        onClick={() => onUse(template)}
        style={{ background: `linear-gradient(135deg, ${template.palette.join(', ')})` }}
      >
        <span className="template-emoji">{template.emoji}</span>
        <span className="popularity">↗ {template.popularity}</span>
      </button>
      <div className="template-card-body">
        <div>
          <span className="micro-label">{template.category.replace('-', ' ')}</span>
          <h3>{template.name}</h3>
          <p>{template.description}</p>
        </div>
        <div className="tag-row">
          {template.tags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}
        </div>
        <button type="button" className="secondary-button full" onClick={() => onUse(template)}>Stüdyoda aç</button>
      </div>
    </article>
  );
}
