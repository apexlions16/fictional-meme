import type { AppData } from '../types/models';

const STORAGE_KEY = 'fictional-meme:data:v1';

export const defaultData: AppData = {
  documents: [],
  stats: {
    generated: 0,
    exported: 0,
    saved: 0,
    sessions: 1,
    categoryCounts: {},
  },
  theme: 'dark',
};

export const loadData = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      ...defaultData,
      ...parsed,
      documents: Array.isArray(parsed.documents) ? parsed.documents : [],
      stats: { ...defaultData.stats, ...parsed.stats, sessions: (parsed.stats?.sessions ?? 0) + 1 },
    };
  } catch {
    return defaultData;
  }
};

export const saveData = (data: AppData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const downloadJson = (data: AppData): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `fictional-meme-backup-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const parseImport = async (file: File): Promise<AppData> => {
  const text = await file.text();
  const parsed = JSON.parse(text) as AppData;
  if (!parsed || !Array.isArray(parsed.documents) || !parsed.stats) {
    throw new Error('Geçersiz Fictional Meme yedek dosyası.');
  }
  return { ...defaultData, ...parsed, stats: { ...defaultData.stats, ...parsed.stats } };
};
