import { useCallback, useEffect, useMemo, useState } from 'react';
import { Analytics } from './components/Analytics';
import { Dashboard } from './components/Dashboard';
import { Discover } from './components/Discover';
import { Library } from './components/Library';
import { Sidebar } from './components/Sidebar';
import { Studio } from './components/Studio';
import { Toast } from './components/Toast';
import { Topbar } from './components/Topbar';
import { getTemplate, templates } from './data/templates';
import { useAppData } from './hooks/useAppData';
import { createDocument, refreshDocumentCopy } from './lib/document';
import type { MemeDocument, MemeTemplate, View } from './types/models';

export default function App() {
  const store = useAppData();
  const [view, setView] = useState<View>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [activeDocument, setActiveDocument] = useState<MemeDocument>(() => createDocument(templates[0]));
  const [toast, setToast] = useState('');
  const template = useMemo(() => getTemplate(activeDocument.templateId), [activeDocument.templateId]);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }, []);

  const openTemplate = useCallback((nextTemplate: MemeTemplate) => {
    setActiveDocument(createDocument(nextTemplate));
    store.recordGeneration(nextTemplate.category);
    setView('studio');
  }, [store]);

  const openDocument = useCallback((nextDocument: MemeDocument) => {
    setActiveDocument(structuredClone(nextDocument));
    setView('studio');
  }, []);

  const createNew = useCallback(() => {
    openTemplate(templates[Math.floor(Math.random() * templates.length)]);
  }, [openTemplate]);

  const randomize = useCallback(() => {
    setActiveDocument((current) => refreshDocumentCopy(current));
    store.recordGeneration(activeDocument.category);
    notify('Yeni kurgu üretildi.');
  }, [activeDocument.category, notify, store]);

  const saveActive = useCallback(() => {
    store.saveDocument(activeDocument);
    notify('Proje kütüphaneye kaydedildi.');
  }, [activeDocument, notify, store]);

  const switchTemplate = useCallback((nextTemplate: MemeTemplate) => {
    setActiveDocument((current) => ({
      ...current,
      templateId: nextTemplate.id,
      category: nextTemplate.category,
      tags: [...nextTemplate.tags],
      title: `${nextTemplate.name} — ${new Date().toLocaleDateString('tr-TR')}`,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (view !== 'studio') return;
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.tagName === 'SELECT';
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveActive();
      }
      if (!isTyping && event.key.toLowerCase() === 'r') randomize();
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [randomize, saveActive, view]);

  useEffect(() => {
    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => undefined);
    }
  }, []);

  return (
    <div className="app-shell">
      <Sidebar view={view} onChange={setView} collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <div className="app-main">
        <Topbar theme={store.data.theme} onToggleTheme={store.toggleTheme} onCreate={createNew} />
        <div className="content-area">
          {view === 'dashboard' && <Dashboard data={store.data} onUseTemplate={openTemplate} onOpenDocument={openDocument} onNavigateDiscover={() => setView('discover')} />}
          {view === 'discover' && <Discover onUseTemplate={openTemplate} />}
          {view === 'studio' && (
            <Studio
              document={activeDocument}
              template={template}
              onChange={setActiveDocument}
              onTemplateChange={switchTemplate}
              onRandomize={randomize}
              onSave={saveActive}
              onExported={store.recordExport}
              onNotify={notify}
            />
          )}
          {view === 'library' && (
            <Library
              data={store.data}
              onOpen={openDocument}
              onDelete={(id) => { store.deleteDocument(id); notify('Proje silindi.'); }}
              onToggleFavorite={store.toggleFavorite}
              onImport={store.replaceData}
              onNotify={notify}
            />
          )}
          {view === 'analytics' && <Analytics data={store.data} />}
        </div>
      </div>
      {toast && <Toast message={toast} />}
    </div>
  );
}
