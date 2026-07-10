import { useCallback, useEffect, useState } from 'react';
import { defaultData, loadData, saveData } from '../lib/storage';
import type { AppData, Category, MemeDocument } from '../types/models';

export const useAppData = () => {
  const [data, setData] = useState<AppData>(() => loadData());

  useEffect(() => {
    saveData(data);
    document.documentElement.dataset.theme = data.theme;
  }, [data]);

  const saveDocument = useCallback((document: MemeDocument) => {
    const updated = { ...document, updatedAt: new Date().toISOString() };
    setData((current) => {
      const exists = current.documents.some((item) => item.id === updated.id);
      return {
        ...current,
        documents: exists
          ? current.documents.map((item) => (item.id === updated.id ? updated : item))
          : [updated, ...current.documents],
        stats: {
          ...current.stats,
          saved: current.stats.saved + 1,
        },
      };
    });
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setData((current) => ({ ...current, documents: current.documents.filter((item) => item.id !== id) }));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setData((current) => ({
      ...current,
      documents: current.documents.map((item) => item.id === id ? { ...item, favorite: !item.favorite } : item),
    }));
  }, []);

  const recordGeneration = useCallback((category: Category) => {
    setData((current) => ({
      ...current,
      stats: {
        ...current.stats,
        generated: current.stats.generated + 1,
        categoryCounts: {
          ...current.stats.categoryCounts,
          [category]: (current.stats.categoryCounts[category] ?? 0) + 1,
        },
      },
    }));
  }, []);

  const recordExport = useCallback(() => {
    setData((current) => ({
      ...current,
      stats: { ...current.stats, exported: current.stats.exported + 1 },
    }));
  }, []);

  const toggleTheme = useCallback(() => {
    setData((current) => ({ ...current, theme: current.theme === 'dark' ? 'light' : 'dark' }));
  }, []);

  const replaceData = useCallback((next: AppData) => setData(next), []);
  const resetData = useCallback(() => setData(defaultData), []);

  return {
    data,
    saveDocument,
    deleteDocument,
    toggleFavorite,
    recordGeneration,
    recordExport,
    toggleTheme,
    replaceData,
    resetData,
  };
};
