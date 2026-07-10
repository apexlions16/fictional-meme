import { useEffect, useMemo, useRef, useState } from 'react';
import { templates } from '../data/templates';
import { exportCanvas, renderMeme } from '../lib/canvas';
import type { AspectRatio, MemeDocument, MemeTemplate, TextLayer } from '../types/models';

interface StudioProps {
  document: MemeDocument;
  template: MemeTemplate;
  onChange: (document: MemeDocument) => void;
  onTemplateChange: (template: MemeTemplate) => void;
  onRandomize: () => void;
  onSave: () => void;
  onExported: () => void;
  onNotify: (message: string) => void;
}

const fonts = ['Impact', 'Arial Black', 'Trebuchet MS', 'Georgia', 'Courier New'];

export function Studio({ document, template, onChange, onTemplateChange, onRandomize, onSave, onExported, onNotify }: StudioProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedLayerId, setSelectedLayerId] = useState<'top' | 'bottom'>('top');
  const [rendering, setRendering] = useState(false);
  const selectedLayer = useMemo(() => document.layers.find((layer) => layer.id === selectedLayerId) ?? document.layers[0], [document.layers, selectedLayerId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let active = true;
    setRendering(true);
    renderMeme(canvas, document, template)
      .catch(() => onNotify('Önizleme oluşturulamadı.'))
      .finally(() => active && setRendering(false));
    return () => { active = false; };
  }, [document, template, onNotify]);

  const updateDocument = (patch: Partial<MemeDocument>) => onChange({ ...document, ...patch, updatedAt: new Date().toISOString() });
  const updateLayer = (patch: Partial<TextLayer>) => updateDocument({ layers: document.layers.map((layer) => layer.id === selectedLayer.id ? { ...layer, ...patch } : layer) });

  const handleUpload = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onNotify('Lütfen bir görsel dosyası seç.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      onNotify('Görsel 8 MB sınırını aşmamalı.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateDocument({ backgroundImage: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;
    try {
      await exportCanvas(canvasRef.current, document.title);
      onExported();
      onNotify('PNG indirildi.');
    } catch {
      onNotify('PNG dışa aktarılamadı.');
    }
  };

  return (
    <div className="studio-layout">
      <aside className="studio-tools panel">
        <div className="panel-heading"><span className="eyebrow">Belge</span><h2>Tasarım ayarları</h2></div>

        <label className="field-label">Proje adı
          <input value={document.title} onChange={(event) => updateDocument({ title: event.target.value })} />
        </label>

        <label className="field-label">Şablon
          <select value={template.id} onChange={(event) => {
            const next = templates.find((item) => item.id === event.target.value);
            if (next) onTemplateChange(next);
          }}>
            {templates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>

        <div className="field-label">Kanvas oranı
          <div className="segmented">
            {(['1:1', '4:5', '16:9'] as AspectRatio[]).map((ratio) => (
              <button key={ratio} type="button" className={document.ratio === ratio ? 'is-active' : ''} onClick={() => updateDocument({ ratio })}>{ratio}</button>
            ))}
          </div>
        </div>

        <div className="upload-box">
          <span>▧</span>
          <strong>Kendi görselini kullan</strong>
          <small>JPG, PNG veya WebP · en fazla 8 MB</small>
          <label className="secondary-button">Görsel seç<input type="file" accept="image/*" onChange={(event) => handleUpload(event.target.files?.[0])} hidden /></label>
          {document.backgroundImage && <button className="text-button danger" type="button" onClick={() => updateDocument({ backgroundImage: undefined })}>Görseli kaldır</button>}
        </div>

        <button className="magic-button" type="button" onClick={onRandomize}><span>✦</span><strong>Yeni metin üret</strong><small>Aynı evrenden rastgele espri</small></button>
      </aside>

      <main className="canvas-stage panel">
        <div className="canvas-toolbar">
          <div><span className="live-dot" /> Canlı önizleme {rendering && <small>işleniyor...</small>}</div>
          <div className="canvas-actions">
            <button type="button" className="secondary-button" onClick={onSave}>▦ Kaydet</button>
            <button type="button" className="primary-button" onClick={handleExport}>⇩ PNG indir</button>
          </div>
        </div>
        <div className={`canvas-shell ratio-${document.ratio.replace(':', '-')}`}>
          <canvas ref={canvasRef} aria-label="Meme önizleme kanvası" />
        </div>
        <div className="keyboard-hint"><kbd>Ctrl</kbd> + <kbd>S</kbd> kaydet · <kbd>R</kbd> yeni metin · yüksek çözünürlüklü çıktı</div>
      </main>

      <aside className="inspector panel">
        <div className="panel-heading"><span className="eyebrow">Tipografi</span><h2>Metin katmanı</h2></div>
        <div className="layer-tabs">
          {document.layers.map((layer) => <button key={layer.id} type="button" className={selectedLayerId === layer.id ? 'is-active' : ''} onClick={() => setSelectedLayerId(layer.id)}>{layer.id === 'top' ? 'Üst metin' : 'Alt metin'}</button>)}
        </div>

        <label className="field-label">Metin
          <textarea rows={4} value={selectedLayer.text} onChange={(event) => updateLayer({ text: event.target.value })} maxLength={160} />
          <small className="counter">{selectedLayer.text.length}/160</small>
        </label>

        <div className="two-columns">
          <label className="field-label">Yazı tipi<select value={selectedLayer.fontFamily} onChange={(event) => updateLayer({ fontFamily: event.target.value })}>{fonts.map((font) => <option key={font}>{font}</option>)}</select></label>
          <label className="field-label">Kalınlık<select value={selectedLayer.fontWeight} onChange={(event) => updateLayer({ fontWeight: Number(event.target.value) })}><option value="600">600</option><option value="700">700</option><option value="800">800</option><option value="900">900</option></select></label>
        </div>

        <label className="range-field"><span>Boyut <b>{selectedLayer.fontSize}px</b></span><input type="range" min="28" max="110" value={selectedLayer.fontSize} onChange={(event) => updateLayer({ fontSize: Number(event.target.value) })} /></label>
        <label className="range-field"><span>Dikey konum <b>{Math.round(selectedLayer.y * 100)}%</b></span><input type="range" min="5" max="95" value={selectedLayer.y * 100} onChange={(event) => updateLayer({ y: Number(event.target.value) / 100 })} /></label>
        <label className="range-field"><span>Metin genişliği <b>{Math.round(selectedLayer.maxWidth * 100)}%</b></span><input type="range" min="35" max="95" value={selectedLayer.maxWidth * 100} onChange={(event) => updateLayer({ maxWidth: Number(event.target.value) / 100 })} /></label>
        <label className="range-field"><span>Kontur <b>{selectedLayer.strokeWidth}px</b></span><input type="range" min="0" max="16" value={selectedLayer.strokeWidth} onChange={(event) => updateLayer({ strokeWidth: Number(event.target.value) })} /></label>

        <div className="two-columns">
          <label className="color-field">Metin rengi<input type="color" value={selectedLayer.color} onChange={(event) => updateLayer({ color: event.target.value })} /></label>
          <label className="color-field">Kontur rengi<input type="color" value={selectedLayer.strokeColor} onChange={(event) => updateLayer({ strokeColor: event.target.value })} /></label>
        </div>

        <div className="field-label">Hizalama
          <div className="segmented">
            {(['left', 'center', 'right'] as const).map((align) => <button key={align} type="button" className={selectedLayer.align === align ? 'is-active' : ''} onClick={() => updateLayer({ align })}>{align === 'left' ? '≡←' : align === 'right' ? '→≡' : '≡'}</button>)}
          </div>
        </div>

        <div className="toggle-list">
          <label><span><strong>Büyük harf</strong><small>Türkçe karakter uyumlu</small></span><input type="checkbox" checked={selectedLayer.uppercase} onChange={(event) => updateLayer({ uppercase: event.target.checked })} /></label>
          <label><span><strong>Metin gölgesi</strong><small>Arka plandan ayırır</small></span><input type="checkbox" checked={selectedLayer.shadow} onChange={(event) => updateLayer({ shadow: event.target.checked })} /></label>
        </div>
      </aside>
    </div>
  );
}
