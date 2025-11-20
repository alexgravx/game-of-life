import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Grid from './Grid'
import Controls from './Controls'
import { PATTERNS } from '../lib/patterns'

const BOTTOM_BAR_HEIGHT = 80
const DEFAULT_CELL_SIZE = 14

function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight })
  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return size
}

function clampPatternPlacement(rows: number, cols: number, r: number, c: number) {
  // Wrap around for placement
  const rr = ((r % rows) + rows) % rows
  const cc = ((c % cols) + cols) % cols
  return { r: rr, c: cc }
}

function stepLife(alive: Uint8Array, rows: number, cols: number): Uint8Array {
  const next = new Uint8Array(alive.length)
  const index = (r: number, c: number) => r * cols + c
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let neighbors = 0
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          let nr = r + dr
          let nc = c + dc
          if (nr < 0) nr = rows - 1
          if (nr >= rows) nr = 0
          if (nc < 0) nc = cols - 1
          if (nc >= cols) nc = 0
          neighbors += alive[index(nr, nc)]
        }
      }
      const isAlive = alive[index(r, c)] === 1
      if (isAlive && (neighbors === 2 || neighbors === 3)) next[index(r, c)] = 1
      else if (!isAlive && neighbors === 3) next[index(r, c)] = 1
      else next[index(r, c)] = 0
    }
  }
  return next
}

export default function GameOfLife() {
  const { width, height } = useWindowSize()
  const [cellSize, _] = useState(DEFAULT_CELL_SIZE)

  const rows = useMemo(() => Math.max(4, Math.floor(height / cellSize)), [height, cellSize])
  const cols = useMemo(() => Math.max(4, Math.floor(width / cellSize)), [width, cellSize])

  const [alive, setAlive] = useState<Uint8Array>(() => new Uint8Array(rows * cols))
  const [isRunning, setIsRunning] = useState(false)
  const [speedMs, setSpeedMs] = useState(200)
  const [selectedPattern, setSelectedPattern] = useState<string>('Pattern')

  const timerRef = useRef<number | null>(null)

  // Reset grid when size changes
  useEffect(() => {
    setAlive(() => {
      const next = new Uint8Array(rows * cols)
      // Optionally preserve overlapping region (skip for simplicity)
      return next
    })
    // Stop simulation on resize for determinism
    setIsRunning(false)
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [rows, cols])

  // Run loop
  useEffect(() => {
    if (!isRunning) return
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = window.setInterval(() => {
      setAlive((curr) => stepLife(curr, rows, cols))
    }, speedMs) as unknown as number
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRunning, speedMs, rows, cols])

  const index = useCallback((r: number, c: number) => r * cols + c, [cols])

  const toggleCell = useCallback((r: number, c: number) => {
    setAlive((curr) => {
      const next = curr.slice()
      const i = index(r, c)
      next[i] = curr[i] ? 0 : 1
      return next
    })
  }, [index])

  const stampPattern = useCallback((name: string, r: number, c: number) => {
    const pattern = PATTERNS[name]
    if (!pattern || pattern.length === 0) return toggleCell(r, c)
    setAlive((curr) => {
      const next = curr.slice()
      for (const [dr, dc] of pattern) {
        const { r: rr, c: cc } = clampPatternPlacement(rows, cols, r + dr, c + dc)
        next[index(rr, cc)] = 1
      }
      return next
    })
  }, [rows, cols, index, toggleCell])

  const onCellClick = useCallback((r: number, c: number) => {
    stampPattern(selectedPattern, r, c)
  }, [stampPattern, selectedPattern])

  const onToggleRun = useCallback(() => {
    setIsRunning((v) => !v)
  }, [])

  const onReset = useCallback(() => {
    setIsRunning(false)
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    setAlive(new Uint8Array(rows * cols))
  }, [rows, cols])

  const onRandomize = useCallback(() => {
    const next = new Uint8Array(rows * cols)
    for (let i = 0; i < next.length; i++) next[i] = Math.random() < 0.28 ? 1 : 0
    setAlive(next)
  }, [rows, cols])

  const patternNames = useMemo(() => Object.keys(PATTERNS), [])

  return (
    <div className="relative h-screen w-screen bg-white text-black">
      <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-full border border-black/10 bg-white/60 px-5 py-2 font-semibold shadow-lg backdrop-blur-xs">
        Game of Life
      </div>
      <div className="flex h-screen w-screen items-center justify-center">
        <Grid
          rows={rows}
          cols={cols}
          cellSize={cellSize}
          bottomBarHeight={BOTTOM_BAR_HEIGHT}
          alive={alive}
          onCellClick={onCellClick}
        />
      </div>
      <Controls
        className="pointer-events-auto fixed bottom-4 w-full"
        isRunning={isRunning}
        speedMs={speedMs}
        onToggleRun={onToggleRun}
        onReset={onReset}
        onRandomize={() => { onRandomize(); setIsRunning(true) }}
        onSpeedChange={setSpeedMs}
        patternNames={patternNames}
        selectedPattern={selectedPattern}
        onSelectPattern={setSelectedPattern}
      />
    </div>
  )
}


