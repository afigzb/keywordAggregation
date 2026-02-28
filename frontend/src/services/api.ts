const API_BASE_URL = 'http://127.0.0.1:6759';

export interface AggregateChunk {
  type: 'progress' | 'done' | 'error';
  processed: number;
  total: number;
  keywords: [string, number][];
  message?: string;
}

export const streamAggregate = async (
  filePath: string,
  keyword: string,
  onChunk: (data: AggregateChunk) => void,
  topN: number = 20,
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/aggregate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_path: filePath, keyword, top_n: topN }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6)) as AggregateChunk;
          if (data.type === 'error') {
            throw new Error(data.message ?? '后端处理出错');
          }
          onChunk(data);
        } catch (e) {
          if (e instanceof Error && e.message !== '') throw e;
        }
      }
    }
  }
};
