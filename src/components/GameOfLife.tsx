import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Grid from './Grid'
import Controls from './Controls'
import { FaInfo } from "react-icons/fa";
import { FaRegCopyright } from "react-icons/fa";
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

  // Welcome pattern
  useEffect(() => {
    const welcomePattern = PATTERNS['WelcomeMessage']
    if (welcomePattern && welcomePattern.length > 0) {
      setAlive(() => {
        const next = new Uint8Array(rows * cols)
        const centerRow = Math.floor(rows / 2)
        const centerCol = Math.floor(cols / 2)
        for (const [dr, dc] of welcomePattern) {
          const r = (centerRow + dr + rows) % rows
          const c = (centerCol + dc + cols) % cols
          next[r * cols + c] = 1
        }
        return next
      })
    }
    setIsRunning(false)
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [rows, cols])

  // Stop or start game loop
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

  const onCellClick = useCallback((r: number, c: number) => {
    toggleCell(r, c)
  }, [])

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
      <div className="pointer-events-auto absolute top-4 w-full">
        <div className="flex items-start justify-between gap-4">
          <div className="pointer-events-none rounded-full ms-3 px-5 py-2 border border-black/10 bg-white/60  font-semibold shadow-lg backdrop-blur-xs">
            Game of Life
          </div>
          <div className="flex flex-col items-center gap-2">
            <a 
            href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life"
            className="rounded-full me-3 px-3 py-3 border border-black/10 bg-white text-black hover:opacity-75 shadow-sm">
              <FaInfo />
            </a>
            <a 
            href="https://github.com/alexgravx"
            className="rounded-full me-3 px-3 py-3 border border-black/10 bg-white text-black hover:opacity-75 shadow-sm">
              <FaRegCopyright />
            </a>
          </div>
        </div>
        
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
        onRandomize={onRandomize}
        onSpeedChange={setSpeedMs}
        patternNames={patternNames}
        selectedPattern={selectedPattern}
        onSelectPattern={setSelectedPattern}
      />
    </div>
  )
}


