import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Grid from './Grid'
import Controls from './Controls'
import { FaInfo } from "react-icons/fa";
import { FaRegCopyright } from "react-icons/fa";
import { PATTERNS, generateWelcomePattern } from '../lib/patterns'

const BOTTOM_BAR_HEIGHT = 80
const DEFAULT_CELL_SIZE = 14
const FIXED_GRID_ROWS = 300
const FIXED_GRID_COLS = 300

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
  const navigate = useNavigate()

  const handleWelcomePage = () => {
    navigate('/welcome')
  }

  const { width, height } = useWindowSize()

  // Fixed grid dimensions and viewport state
  const rows = FIXED_GRID_ROWS
  const cols = FIXED_GRID_COLS

  // Calculate minimum zoom to ensure grid always fills viewport
  const minZoom = useMemo(() => {
    const gridWidth = cols * DEFAULT_CELL_SIZE
    const gridHeight = rows * DEFAULT_CELL_SIZE
    const zoomX = width / gridWidth
    const zoomY = height / gridHeight
    // Use max to ensure grid covers entire viewport in both dimensions
    return Math.max(zoomX, zoomY)
  }, [width, height])

  // Calculate initial zoom to fill viewport completely
  const initialZoom = useMemo(() => {
    return minZoom * 2.4
  }, [minZoom])

  const [zoom, setZoom] = useState(initialZoom)

  // Initialize offsets to center the grid on the screen with the initial zoom
  const [offsetX, setOffsetX] = useState(() => {
    const gridWidth = cols * DEFAULT_CELL_SIZE * initialZoom
    return (width - gridWidth) / 2
  })
  const [offsetY, setOffsetY] = useState(() => {
    const gridHeight = rows * DEFAULT_CELL_SIZE * initialZoom
    return (height - gridHeight) / 2
  })

  const cellSize = useMemo(() => DEFAULT_CELL_SIZE * zoom, [zoom])

  const [alive, setAlive] = useState<Uint8Array>(() => new Uint8Array(rows * cols))
  const [isRunning, setIsRunning] = useState(false)
  const [speedMs, setSpeedMs] = useState(200)
  const [selectedPattern, setSelectedPattern] = useState<string>('Dot')

  const timerRef = useRef<number | null>(null)
  const hasLoadedWelcomePattern = useRef(false)
  const zoomRef = useRef(zoom)
  const offsetXRef = useRef(offsetX)
  const offsetYRef = useRef(offsetY)
  const minZoomRef = useRef(minZoom)

  // Keep refs in sync
  useEffect(() => {
    zoomRef.current = zoom
    offsetXRef.current = offsetX
    offsetYRef.current = offsetY
    minZoomRef.current = minZoom
  }, [zoom, offsetX, offsetY, minZoom])

  // Load welcome pattern only once on initial mount
  useEffect(() => {
    if (!hasLoadedWelcomePattern.current) {
      const welcomePattern = generateWelcomePattern(rows, cols)

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
      hasLoadedWelcomePattern.current = true
    }
  }, [])

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

  const onCellClick = useCallback((r: number, c: number) => {
    const pattern = PATTERNS[selectedPattern] || []

    setAlive((curr) => {
      const next = curr.slice()

      if (pattern.length === 0) {
        const i = index(r, c)
        next[i] = curr[i] ? 0 : 1
      } else {
        for (const [dr, dc] of pattern) {
          const nr = (r + dr + rows) % rows
          const nc = (c + dc + cols) % cols
          next[index(nr, nc)] = 1
        }
      }

      return next
    })
  }, [selectedPattern, rows, cols, index])

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

  const handleZoom = useCallback((delta: number, mouseX?: number, mouseY?: number) => {
    const prevZoom = zoomRef.current
    const newZoom = Math.max(minZoomRef.current, Math.min(3.0, prevZoom + delta))

    // If mouse position is provided, adjust offset to zoom towards cursor
    if (mouseX !== undefined && mouseY !== undefined) {
      const zoomRatio = newZoom / prevZoom

      // Calculate the new offsets to keep the point under the cursor fixed
      const newOffsetX = mouseX - (mouseX - offsetXRef.current) * zoomRatio
      const newOffsetY = mouseY - (mouseY - offsetYRef.current) * zoomRatio

      setOffsetX(newOffsetX)
      setOffsetY(newOffsetY)
    }

    setZoom(newZoom)
  }, [])

  const handlePan = useCallback((dx: number, dy: number) => {
    setOffsetX((prev) => {
      const newOffset = prev + dx
      // Constrain pan: grid edges should not go inside viewport
      const gridWidth = cols * DEFAULT_CELL_SIZE * zoomRef.current
      const maxOffsetX = 0
      const minOffsetX = width - gridWidth
      return Math.max(minOffsetX, Math.min(maxOffsetX, newOffset))
    })
    setOffsetY((prev) => {
      const newOffset = prev + dy
      const gridHeight = rows * DEFAULT_CELL_SIZE * zoomRef.current
      const maxOffsetY = 0
      const minOffsetY = height - gridHeight
      return Math.max(minOffsetY, Math.min(maxOffsetY, newOffset))
    })
  }, [width, height])

  return (
    <div className="relative h-screen w-screen bg-white text-black">
      <div className="pointer-events-none absolute top-4 w-full">
        <div className="flex items-start justify-between gap-4">
          <div className="pointer-events-auto rounded-full ms-3 px-3 py-2 border border-black/10 bg-white/60 font-semibold shadow-lg backdrop-blur-xs">
            <button
              onClick={handleWelcomePage}
              className="px-6 py-2 rounded-3xl border border-black/10 bg-white text-black hover:opacity-60 shadow-lg font-semibold transition-opacity"
            >
              Game of Life
            </button>
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
          onZoom={handleZoom}
          onPan={handlePan}
          offsetX={offsetX}
          offsetY={offsetY}
          width={width}
          height={height}
        />
      </div>
      <Controls
        className="pointer-events-none fixed bottom-4 w-full"
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


