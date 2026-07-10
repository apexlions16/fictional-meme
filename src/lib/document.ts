import { createId } from './id';
import { generateCopy } from './memeGenerator';
import type { MemeDocument, MemeTemplate, TextLayer } from '../types/models';

const makeLayer = (id: 'top' | 'bottom', text: string, y: number): TextLayer => ({
  id,
  text,
  x: 0.5,
  y,
  maxWidth: 0.88,
  fontSize: id === 'top' ? 64 : 58,
  fontFamily: 'Impact',
  fontWeight: 800,
  color: '#ffffff',
  strokeColor: '#09090b',
  strokeWidth: 8,
  align: 'center',
  uppercase: true,
  shadow: true,
});

export const createDocument = (template: MemeTemplate): MemeDocument => {
  const copy = generateCopy(template.category);
  const now = new Date().toISOString();
  return {
    id: createId('meme'),
    title: `${template.name} — ${new Date().toLocaleDateString('tr-TR')}`,
    templateId: template.id,
    category: template.category,
    ratio: '1:1',
    layers: [makeLayer('top', copy.top, 0.12), makeLayer('bottom', copy.bottom, 0.87)],
    createdAt: now,
    updatedAt: now,
    tags: [...template.tags],
    favorite: false,
  };
};

export const refreshDocumentCopy = (document: MemeDocument): MemeDocument => {
  const copy = generateCopy(document.category);
  return {
    ...document,
    updatedAt: new Date().toISOString(),
    layers: document.layers.map((layer) => ({
      ...layer,
      text: layer.id === 'top' ? copy.top : copy.bottom,
    })),
  };
};
