import { useState } from 'react'
import { streamAggregate } from './services/api'
import type { AggregateChunk } from './services/api'

// contextIsolation: false, so ipcRenderer is accessible via window.require
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { ipcRenderer } = (window as any).require('electron')

function App() {
  const [filePath, setFilePath] = useState<string | null>(null)
  const [keyword, setKeyword] = useState('')
  const [keywords, setKeywords] = useState<[string, number][]>([])
  const [progress, setProgress] = useState<{ processed: number; total: number } | null>(null)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePickFile = async () => {
    const picked: string | null = await ipcRenderer.invoke('open-file-dialog')
    if (picked) {
      setFilePath(picked)
      setKeywords([])
      setProgress(null)
      setDone(false)
      setError(null)
    }
  }

  const handleAggregate = async () => {
    if (!filePath || !keyword.trim()) return
    setRunning(true)
    setDone(false)
    setError(null)
    setKeywords([])
    setProgress(null)

    try {
      await streamAggregate(filePath, keyword, (chunk: AggregateChunk) => {
        setProgress({ processed: chunk.processed, total: chunk.total })
        setKeywords(chunk.keywords)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setRunning(false)
      setDone(true)
    }
  }

  const progressPct =
    progress && progress.total > 0
      ? Math.round((progress.processed / progress.total) * 100)
      : 0

  const fileName = filePath ? filePath.split(/[\\/]/).pop() : null

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-1">关键词聚合工具</h1>
      <p className="text-gray-400 text-sm mb-8">选择文本文件，输入关键词，实时发现高频聚合词</p>

      <div className="w-full max-w-2xl flex flex-col gap-4">
        {/* File picker */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 uppercase tracking-wider">文本文件</label>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePickFile}
              disabled={running}
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors whitespace-nowrap"
            >
              选择文件…
            </button>
            {fileName ? (
              <div className="flex flex-col min-w-0">
                <span className="text-sm text-gray-100 truncate font-medium">{fileName}</span>
                <span className="text-xs text-gray-500 truncate">{filePath}</span>
              </div>
            ) : (
              <span className="text-sm text-gray-500 italic">未选择文件</span>
            )}
          </div>
        </div>

        {/* Keyword + button row */}
        <div className="flex gap-2">
          <input
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="搜索关键词，如：丹"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !running && handleAggregate()}
            disabled={running}
          />
          <button
            onClick={handleAggregate}
            disabled={running || !filePath || !keyword.trim()}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors"
          >
            {running ? '聚合中…' : '聚合'}
          </button>
        </div>

        {/* Progress bar */}
        {progress && (
          <div className="flex flex-col gap-1">
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-200"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">
              已处理 {progress.processed} / {progress.total} 句
              {running && ' …'}
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-red-400 text-sm bg-red-950 border border-red-800 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Results */}
        {keywords.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs text-gray-400 uppercase tracking-wider">
              聚合结果（共 {keywords.length} 个）
            </span>
            <div className="flex flex-wrap gap-2">
              {keywords.map(([word, count]) => (
                <span
                  key={word}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700/50 text-sm"
                >
                  <span className="font-medium">{word}</span>
                  <span className="text-xs text-blue-300">{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {keywords.length === 0 && done && !running && filePath && (
          <p className="text-gray-500 text-sm text-center">未找到包含「{keyword}」的聚合词</p>
        )}
      </div>
    </div>
  )
}

export default App
