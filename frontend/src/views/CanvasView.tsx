import { useState, useCallback, useRef } from 'react';
import type { GraphData, QueryResponse } from '../types';
import KnowledgeGraph from '../components/KnowledgeGraph';
import StrategyPanel from '../components/StrategyPanel';

interface Props {
  graphData: GraphData | null;
  onEntityClick: (name: string) => void;
  internalCount: number;
  externalCount: number;
  report: QueryResponse | null;
  querying: boolean;
  selectedEntity: string | null;
  onCloseReport: () => void;
  onOpenAssets: () => void;
}

export default function CanvasView({
  graphData, onEntityClick, internalCount, externalCount,
  report, querying, selectedEntity, onCloseReport, onOpenAssets,
}: Props) {
  const open = report || querying || selectedEntity;
  const [input, setInput] = useState('');
  const taRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = '0';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, []);

  const submit = () => {
    const v = input.trim();
    if (!v) return;
    onEntityClick(v);
    setInput('');
    if (taRef.current) taRef.current.style.height = 'auto';
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  return (
    <div className="w-full h-full flex bg-bg">
      {/* Left: canvas area */}
      <div className="relative flex-1 h-full">
        <div className="absolute inset-0">
          <KnowledgeGraph
            graphData={graphData}
            onEntityClick={onEntityClick}
            internalCount={internalCount}
            externalCount={externalCount}
          />

          {/* Assets button inside canvas area */}
          <button onClick={onOpenAssets}
            className="absolute top-5 right-5 z-10 px-3 py-1.5 text-xs text-secondary bg-surface/70 backdrop-blur-sm border border-border/40 rounded-lg hover:bg-elevated transition-colors pointer-events-auto">
            资产管理
          </button>
        </div>

        {/* Floating input */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none flex justify-center" style={{ width: '72%', maxWidth: 640 }}>
          <div className="w-full bg-surface/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl pointer-events-auto hover:border-border/70 focus-within:border-accent/40 transition-all duration-200 px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div style={{ width: 5 }} /><svg className="w-5 h-5 text-tertiary/60 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <textarea
                ref={taRef}
                value={input}
                onChange={e => { setInput(e.target.value); autoResize(); }}
                onKeyDown={handleKey}
                placeholder="搜索实体名称，获取 AI 策略建议..."
                rows={1}
                className="flex-1 text-xs text-text bg-transparent outline-none resize-none placeholder:text-tertiary/50 leading-relaxed"
                style={{ minHeight: 20, maxHeight: 200 }}
              />
              <button
                onClick={submit}
                disabled={!input.trim()}
                className="flex items-center justify-center w-9 h-9 rounded-2xl bg-accent hover:bg-accent/90 disabled:bg-zinc-800 disabled:text-zinc-600 text-white transition-all shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: panel */}
      <div className={`h-full border-l border-border bg-surface transition-all duration-300 ease-out overflow-hidden ${open ? 'w-[380px]' : 'w-0'}`}>
        <StrategyPanel loading={querying} report={report} onClose={onCloseReport} />
      </div>
    </div>
  );
}
