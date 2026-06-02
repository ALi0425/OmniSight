import { useState, useRef } from 'react';

interface Asset {
  id: string; name: string; type: string; size: string;
  status: 'processing' | 'done' | 'skipped';
}

export default function AssetsView({ onUpload, uploading }: { onUpload: (f: File) => Promise<any>; uploading: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [files, setFiles] = useState<Asset[]>(() => {
    try { return JSON.parse(localStorage.getItem('omni-assets') || '[]'); } catch { return []; }
  });

  const save = (list: Asset[]) => { setFiles(list); localStorage.setItem('omni-assets', JSON.stringify(list.slice(0, 100))); };

  const add = async (file: File) => {
    const id = `f-${Date.now()}`;
    const size = file.size > 1e6 ? `${(file.size/1e6).toFixed(1)} MB` : `${(file.size/1024).toFixed(1)} KB`;
    save([{ id, name: file.name, type: file.type || '?', size, status: 'processing' }, ...files]);
    const res = await onUpload(file);
    if (res?.status === 'skipped') {
      save(files.map(a => a.id === id ? { ...a, status: 'skipped' as const } : a));
    } else {
      setTimeout(() => {
        setAssets(prev => { const next = prev.map(a => a.id === id ? { ...a, status: 'done' as const } : a); localStorage.setItem(KEY, JSON.stringify(next.slice(0, 100))); return next; });
      }, 8000);
    }
  };

  const done = files.filter(a => a.status === 'done').length;
  const skipped = files.filter(a => a.status === 'skipped').length;

  return (
    <div className="w-full min-h-screen bg-[#0B0B0B]" style={{ padding: '5vh 10vw' }}>
      {/* Hero upload area */}
      <div
        className={`relative rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
          drag
            ? 'border-[#3B82F6] bg-[#3B82F6]/5 scale-[1.01]'
            : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/50'
        }`}
        style={{ minHeight: '40vh' }}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) add(f); }}
        onClick={() => ref.current?.click()}
      >
        <input ref={ref} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) add(f); }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ padding: '8vh 4vw' }}>
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
          </div>
          <div className="text-lg font-medium text-zinc-300 mb-2">拖拽文件到此处，或点击上传</div>
          <div className="text-sm text-zinc-600 mb-6">支持 PDF · Word · Markdown · TXT · 图片格式</div>
          <div className="flex gap-3">
            {['PDF', 'Word', 'MD', 'TXT'].map(t => (
              <span key={t} className="text-xs px-4 py-1.5 rounded-full bg-zinc-800/80 text-zinc-500 font-medium">{t}</span>
            ))}
          </div>
          {uploading && (
            <div className="mt-5 flex items-center gap-2.5 text-sm text-[#3B82F6]">
              <span className="w-4 h-4 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
              正在处理文件...
            </div>
          )}
        </div>
      </div>

      {/* Stats bar */}
      {files.length > 0 && (
        <div className="flex items-center gap-4 mt-8 text-sm text-zinc-500">
          <span className="text-zinc-400 font-medium">{files.length}</span> 个文件
          <span className="w-px h-3 bg-zinc-800" />
          <span className="text-[#3B82F6]">{done}</span> 完成
          {skipped > 0 && <><span className="w-px h-3 bg-zinc-800" /><span>{skipped}</span> 已存在</>}
          <button onClick={() => save([])} className="ml-auto text-xs text-zinc-600 hover:text-zinc-400 transition-colors">清空全部</button>
        </div>
      )}

      {/* File grid */}
      {files.length > 0 && (
        <div className="mt-4 grid gap-3" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {files.map(f => (
            <div key={f.id} className="group flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3.5 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all relative">
              <button onClick={() => remove(f.id)} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-zinc-700 hover:bg-zinc-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <svg className="w-3 h-3 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 text-xs font-bold text-zinc-500">
                {icon(f.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-zinc-300 truncate">{f.name}</div>
                <div className="flex items-center gap-2 text-xs text-zinc-600 mt-0.5">
                  <span>{label(f.type)}</span>
                  <span>·</span>
                  <span>{f.size}</span>
                </div>
              </div>
              <div className="shrink-0">
                {f.status === 'processing' && <span className="text-xs text-amber-500 animate-pulse">处理中</span>}
                {f.status === 'done' && <span className="flex items-center gap-1 text-xs text-[#3B82F6]"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>完成</span>}
                {f.status === 'skipped' && <span className="text-xs text-zinc-600">已存在</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {files.length === 0 && (
        <div className="flex flex-col items-center mt-20 text-zinc-700">
          <svg className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-sm">还没有上传过文档</p>
        </div>
      )}
    </div>
  );
}

function icon(t: string): string {
  if (t.includes('pdf')) return 'PDF';
  if (t.includes('word') || t.includes('docx')) return 'DOC';
  if (t.includes('md')) return 'MD';
  return '📄';
}
function label(t: string): string {
  if (t.includes('pdf')) return 'PDF';
  if (t.includes('docx') || t.includes('word')) return 'Word';
  if (t.includes('md')) return 'Markdown';
  if (t.includes('image')) return '图片';
  return '其他';
}
