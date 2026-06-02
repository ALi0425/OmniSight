import { useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react';
import * as echarts from 'echarts/core';
import type { EChartsCoreOption } from 'echarts/core';
import { GraphChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { GraphData, GraphNode, GraphLink } from '../types';

echarts.use([GraphChart, TooltipComponent, CanvasRenderer]);

interface Props {
  graphData: GraphData | null;
  onEntityClick: (name: string) => void;
  internalCount: number;
  externalCount: number;
}

export default function KnowledgeGraph({ graphData, onEntityClick }: Props) {
  const opt = useMemo((): EChartsCoreOption => {
    const nodes = graphData?.nodes || [];
    const links = graphData?.links || [];
    const empty = nodes.length === 0;

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: (p: any) => {
          if (!p.data.name || p.data.name === '·') return '';
          return `<div style="font-size:13px;font-weight:600;color:#F5F5F4">${p.data.name}</div>
            <div style="font-size:11px;color:#A1A1AA;margin-top:2px">${p.data.category === 0 ? '内部资产' : '外部前沿'}</div>`;
        },
        backgroundColor: '#1A1A1D', borderColor: '#1E1E21', borderWidth: 1,
      },
      series: [{
        type: 'graph', layout: 'force',
        force: { repulsion: 500, edgeLength: 180, gravity: 0.06, friction: 0.1 },
        roam: true, draggable: true,
        scaleLimit: { min: 0.3, max: 8 },
        labelLayout: { hideOverlap: true },
        data: empty ? [{ name: '·', symbolSize: 0 }] : nodes.map((n: GraphNode) => ({
          name: n.name, category: n.category,
          symbolSize: Math.max(22, Math.min(n.size * 6, 70)),
          itemStyle: { color: n.category === 0 ? '#3B82F6' : '#EF4444', borderColor: '#121214', borderWidth: 2.5 },
          label: { show: true, fontSize: 11, fontWeight: n.size > 4 ? 600 : 400, color: '#D4D4D8' },
        })),
        categories: [{ name: '内部', itemStyle: { color: '#3B82F6' } }, { name: '外部', itemStyle: { color: '#EF4444' } }],
        links: empty ? [] : links.map((l: GraphLink) => ({
          source: l.source, target: l.target,
          label: { show: true, formatter: l.label, fontSize: 9, color: '#52525B' },
        })),
        lineStyle: { color: '#27272A', curveness: 0.3, width: 1, opacity: 0.8 },
        emphasis: { focus: 'adjacency', lineStyle: { width: 2, color: '#3B82F6' } },
      }],
      graphic: empty ? [{
        type: 'group', left: 'center', top: 'center',
        children: [{ type: 'text', style: { text: '上传文档以生成知识图谱', textAlign: 'center', fontSize: 14, fill: '#52525B', fontWeight: 400 } }],
      }] : [],
    };
  }, [graphData]);

  return (
    <div className="w-full h-full">
      <ReactEChartsCore
        echarts={echarts}
        option={opt}
        style={{ height: '100%', width: '100%' }}
        onEvents={{ click: (p: any) => { if (p.data?.name && p.data.name !== '·') onEntityClick(p.data.name); } }}
      />
    </div>
  );
}
