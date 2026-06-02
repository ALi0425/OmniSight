import { useCallback, useState } from 'react';
import type { UploadPayload, UploadResponse, QueryPayload, QueryResponse, GraphData } from '../types';

const API_BASE = '/api';

export function useApi() {
  const [uploading, setUploading] = useState(false);
  const [querying, setQuerying] = useState(false);
  const [loadingGraph, setLoadingGraph] = useState(false);

  const uploadFile = useCallback(async (payload: UploadPayload): Promise<UploadResponse | null> => {
    setUploading(true);
    try {
      const res = await fetch(`${API_BASE}/webhook/omnisight-ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (e) {
      console.error('Upload failed', e);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const queryStrategy = useCallback(async (payload: QueryPayload): Promise<QueryResponse | null> => {
    setQuerying(true);
    try {
      const res = await fetch(`${API_BASE}/webhook/omnisight-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (e) {
      console.error('Query failed', e);
      return null;
    } finally {
      setQuerying(false);
    }
  }, []);

  const fetchGraphData = useCallback(async (): Promise<GraphData | null> => {
    setLoadingGraph(true);
    try {
      const res = await fetch(`${API_BASE}/webhook/omnisight-graph-data`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error('Fetch graph data failed', e);
      return null;
    } finally {
      setLoadingGraph(false);
    }
  }, []);

  return { uploadFile, queryStrategy, fetchGraphData, uploading, querying, loadingGraph };
}
