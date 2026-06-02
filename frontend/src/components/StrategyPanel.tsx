import type { QueryResponse } from '../types';

interface Props {
  loading: boolean;
  report: QueryResponse | null;
  onClose: () => void;
}

export default function StrategyPanel({ loading, report, onClose }: Props) {
  const d = report?.report;
  const idle = !loading && !report;
  const score = d?.feasibilityScore;

  const copy = () => {
    navigator.clipboard.writeText([
      `# ${report?.entityName || ''}`,
      '', '## 市场研判', text(d?.marketAssessment),
      '', '## 内部资产', text(d?.internalAssets),
      '', '## 策略建议', text(d?.strategy),
      score != null ? `\n评分：${score}/100` : '',
    ].join('\n')).catch(() => {});
  };

  return (
    <div className="h-full flex flex-col bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 shrink-0">
        <div>
          {report && <><div style={{ height: 10 }} /><div className="font-semibold text-text" style={{ fontSize: 20, marginLeft: 5 }}>{report.entityName}</div></>}
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-md hover:bg-elevated flex items-center justify-center text-tertiary hover:text-secondary transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto relative" style={{ padding: '16px 19px' }}>
        {/* Idle */}
        {idle && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-tertiary">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <p className="text-xs">点击图谱节点查看策略</p>
          </div>
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Report */}
        {report && d && (
          <div className="pb-6">
            {/* Score */}
            {typeof score === 'number' && (
              <div className="bg-elevated rounded-xl" style={{ padding: '40px 24px' }}>
                <div className="flex items-center gap-5">
                  <div className="relative w-30 h-30 flex items-center justify-center shrink-0">
                    <svg className="w-30 h-30 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="#27272A" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke={score >= 60 ? '#3B82F6' : '#EF4444'} strokeWidth="3" strokeDasharray={`${(score/100)*97.4} 97.4`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-xl font-bold text-text">{score}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-text">破局可行性评分</div>
                    <div style={{ height: 10 }} />
                    <div className="text-xs text-secondary mt-1">
                      {score >= 80 ? '强烈建议立即切入' : score >= 60 ? '具备可行性，建议规划' : '需进一步评估'}
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score}%`, background: score >= 60 ? '#3B82F6' : '#EF4444' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Spacer */}
            <div style={{ height: 15 }} />

            {/* Sections */}
            <Section title="市场研判" body={d.marketAssessment} />
            <div style={{ height: 10 }} />
            <div className="border-t border-border/30" />
            <div style={{ height: 10 }} />
            <Section title="内部资产盘点" body={d.internalAssets} />
            <div style={{ height: 10 }} />
            <div className="border-t border-border/30" />
            <div style={{ height: 10 }} />
            <Section title="策略建议" body={d.strategy} />
          </div>
        )}
      </div>

      {/* Fixed bottom buttons */}
      {report && d && (
        <div className="shrink-0 border-t border-border/40 bg-surface" style={{ padding: '16px 28px' }}>
          <div className="flex gap-3">
            <button onClick={copy} className="flex-1 text-xs font-medium text-secondary bg-elevated rounded-lg hover:bg-elevated/80 transition-colors border border-border/40" style={{ height: 40 }}>
              复制报告
            </button>
            <button className="flex-1 text-xs font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors" style={{ height: 40 }}>
              导出 Word
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, body }: { title: string; body: unknown }) {
  return (
    <div>
      <h3 className="text-sm font-semibold" style={{ color: '#3B82F6' }}>{title}</h3>
      <div style={{ height: 5 }} />
      <div className="text-xs text-secondary leading-relaxed space-y-1.5 pl-3 border-l-2" style={{ borderColor: '#3B82F633' }}>
        {renderNode(body)}
      </div>
    </div>
  );
}

function renderNode(c: unknown): React.ReactNode {
  if (!c) return <p className="text-tertiary italic">暂无数据</p>;
  if (typeof c === 'string') return <p>{c}</p>;
  if (Array.isArray(c)) return c.map((v, i) => <p key={i}>{v}</p>);
  if (typeof c === 'object') {
    return Object.entries(c as Record<string, unknown>).map(([k, v]) => {
      const label = chineseKey(k);
      return (
        <div key={k} className="mb-2.5">
          <div className="text-text text-xs font-medium mb-0.5">{label}</div>
          <div className="text-tertiary text-[11px] pl-2 space-y-0.5">
            {Array.isArray(v) ? v.map((x, i) => <p key={i}>• {String(x)}</p>) : <p>{String(v)}</p>}
          </div>
        </div>
      );
    });
  }
  return <p>{String(c)}</p>;
}

function chineseKey(k: string): string {
  const map: Record<string, string> = {
    description: '概述', assets: '现有资产', limitations: '不足之处',
    opportunities: '机会', challenges: '挑战',
    short_term: '短期策略', long_term: '长期策略',
    marketAssessment: '市场研判', internalAssets: '内部资产', strategy: '策略建议',
    feasibilityScore: '可行性评分',
  };
  return map[k] || k;
}

function text(c: unknown): string {
  if (!c) return '';
  if (typeof c === 'string') return c;
  return JSON.stringify(c, null, 2);
}
