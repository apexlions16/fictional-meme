import type { AspectRatio, MemeDocument, MemeTemplate, TextLayer } from '../types/models';

export const dimensionsForRatio = (ratio: AspectRatio): { width: number; height: number } => {
  if (ratio === '4:5') return { width: 1080, height: 1350 };
  if (ratio === '16:9') return { width: 1280, height: 720 };
  return { width: 1080, height: 1080 };
};

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void => {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
};

const drawProceduralScene = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  template: MemeTemplate,
): void => {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, template.palette[0]);
  gradient.addColorStop(0.55, template.palette[1]);
  gradient.addColorStop(1, template.palette[2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = 0.18;
  for (let i = 0; i < 18; i += 1) {
    const size = width * (0.04 + ((i * 17) % 7) / 100);
    const x = ((i * 193) % width) - size / 2;
    const y = ((i * 277) % height) - size / 2;
    ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#000000';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const cardWidth = width * 0.6;
  const cardHeight = height * 0.43;
  const cardX = (width - cardWidth) / 2;
  const cardY = (height - cardHeight) / 2;
  ctx.fillStyle = 'rgba(5, 7, 12, .45)';
  roundRect(ctx, cardX, cardY, cardWidth, cardHeight, Math.min(width, height) * 0.04);
  ctx.strokeStyle = 'rgba(255,255,255,.23)';
  ctx.lineWidth = Math.max(2, width / 360);
  ctx.strokeRect(cardX + 2, cardY + 2, cardWidth - 4, cardHeight - 4);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.round(width * 0.18)}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(template.emoji, width / 2, height / 2 - height * 0.035);

  ctx.font = `700 ${Math.round(width * 0.035)}px Inter, Arial, sans-serif`;
  ctx.globalAlpha = 0.82;
  ctx.fillText(template.name.toUpperCase(), width / 2, cardY + cardHeight * 0.82);
  ctx.globalAlpha = 1;

  const vignette = ctx.createRadialGradient(width / 2, height / 2, width * 0.15, width / 2, height / 2, width * 0.75);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,.5)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
};

const loadImage = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('Görsel yüklenemedi.'));
  image.src = src;
});

const drawCoverImage = (ctx: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number): void => {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  ctx.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
  ctx.fillStyle = 'rgba(0,0,0,.2)';
  ctx.fillRect(0, 0, width, height);
};

const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 5);
};

const drawLayer = (ctx: CanvasRenderingContext2D, layer: TextLayer, width: number, height: number): void => {
  const text = layer.uppercase ? layer.text.toLocaleUpperCase('tr-TR') : layer.text;
  const fontSize = layer.fontSize * (width / 1080);
  ctx.font = `${layer.fontWeight} ${fontSize}px ${layer.fontFamily}, Arial, sans-serif`;
  ctx.textAlign = layer.align;
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.fillStyle = layer.color;
  ctx.strokeStyle = layer.strokeColor;
  ctx.lineWidth = layer.strokeWidth * (width / 1080);
  ctx.shadowColor = layer.shadow ? 'rgba(0,0,0,.65)' : 'transparent';
  ctx.shadowBlur = layer.shadow ? fontSize * 0.18 : 0;
  ctx.shadowOffsetY = layer.shadow ? fontSize * 0.08 : 0;

  const maxWidth = width * layer.maxWidth;
  const lines = wrapText(ctx, text, maxWidth);
  const lineHeight = fontSize * 1.08;
  const startY = height * layer.y - ((lines.length - 1) * lineHeight) / 2;
  const x = width * layer.x;
  lines.forEach((line, index) => {
    const y = startY + index * lineHeight;
    if (layer.strokeWidth > 0) ctx.strokeText(line, x, y, maxWidth);
    ctx.fillText(line, x, y, maxWidth);
  });
  ctx.shadowColor = 'transparent';
};

export const renderMeme = async (
  canvas: HTMLCanvasElement,
  document: MemeDocument,
  template: MemeTemplate,
): Promise<void> => {
  const { width, height } = dimensionsForRatio(document.ratio);
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas başlatılamadı.');

  if (document.backgroundImage) {
    try {
      const image = await loadImage(document.backgroundImage);
      drawCoverImage(ctx, image, width, height);
    } catch {
      drawProceduralScene(ctx, width, height, template);
    }
  } else {
    drawProceduralScene(ctx, width, height, template);
  }

  document.layers.forEach((layer) => drawLayer(ctx, layer, width, height));
};

export const exportCanvas = (canvas: HTMLCanvasElement, filename: string): Promise<void> => new Promise((resolve, reject) => {
  canvas.toBlob((blob) => {
    if (!blob) {
      reject(new Error('PNG oluşturulamadı.'));
      return;
    }
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${filename.replace(/[^a-z0-9-_]+/gi, '-').toLowerCase() || 'fictional-meme'}.png`;
    anchor.click();
    URL.revokeObjectURL(url);
    resolve();
  }, 'image/png');
});
