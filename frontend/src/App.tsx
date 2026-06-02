import { useState, useCallback, useEffect } from 'react';
import { useApi } from './hooks/useApi';
import CanvasView from './views/CanvasView';
import AssetsView from './views/AssetsView';
import type { UploadResponse, QueryResponse, GraphData } from './types';

export default function App() {
  const { uploadFile, queryStrategy, fetchGraphData, uploading, querying } = useApi();
  const [report, setReport] = useState<QueryResponse | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [showAssets, setShowAssets] = useState(false);

  useEffect(() => {
    fetchGraphData().then(setGraphData);
  }, [fetchGraphData]);

  const handleEntityClick = useCallback(async (name: string) => {
    setSelected(name);
    setReport(null);
    setReport(await queryStrategy({ entityName: name, tenant: 'default' }));
  }, [queryStrategy]);

  const handleUpload = useCallback(async (file: File): Promise<UploadResponse | null> => {
    const content = await file.text();
    const md5 = `md5-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const res = await uploadFile({ file: { name: file.name, content, md5, contentType: file.type || 'text/plain' }, tenant: 'default' });
    if (res?.status === 'success') {
      setTimeout(() => fetchGraphData().then(setGraphData), 25000);
      setTimeout(() => fetchGraphData().then(setGraphData), 50000);
    }
    return res;
  }, [uploadFile, fetchGraphData]);

  const stats = graphData?.stats || { internalCount: 0, externalCount: 0 };

  if (showAssets) {
    return (
      <div className="w-screen h-screen flex flex-col bg-bg">
        <button onClick={() => setShowAssets(false)} className="fixed top-6 left-6 z-50 px-3 py-1.5 text-xs text-secondary bg-surface border border-border rounded-lg hover:bg-elevated transition-colors">
          ← 返回图谱
        </button>
        <AssetsView onUpload={handleUpload} uploading={uploading} />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-bg overflow-hidden relative">
      <CanvasView
        graphData={graphData}
        onEntityClick={handleEntityClick}
        internalCount={stats.internalCount}
        externalCount={stats.externalCount}
        report={report}
        querying={querying}
        selectedEntity={selected}
        onCloseReport={() => { setReport(null); setSelected(null); }}
        onOpenAssets={() => setShowAssets(true)}
      />

      {/* Top-left: brand + legend */}
      <div className="absolute top-5 left-5 flex items-center gap-3 pointer-events-none z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
            <span className="text-white text-xs font-bold">O</span>
          </div>
          <span className="text-sm font-semibold text-text">OmniSight</span>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-surface/70 backdrop-blur-sm rounded-lg border border-border/40 text-[11px] text-secondary pointer-events-auto">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent" />{stats.internalCount}</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-danger" />{stats.externalCount}</span>
        </div>
      </div>
    </div>
  );
}
