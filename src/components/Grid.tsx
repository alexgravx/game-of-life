import { useEffect, useRef } from 'react'

export type GridProps = {
  rows: number
  cols: number
  cellSize: number
  bottomBarHeight: number
  alive: Uint8Array
  onCellClick: (row: number, col: number) => void
  onZoom: (delta: number, mouseX?: number, mouseY?: number) => void
  onPan: (dx: number, dy: number) => void
  offsetX: number
  offsetY: number
  width: number
  height: number
}

export default function Grid({
  rows,
  cols,
  cellSize,
  alive,
  onCellClick,
  onZoom,
  onPan,
  offsetX,
  offsetY,
  width,
  height
}: GridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const offsetXRef = useRef(offsetX)
  const offsetYRef = useRef(offsetY)

  // Keep refs in sync with props
  useEffect(() => {
    offsetXRef.current = offsetX
    offsetYRef.current = offsetY
  }, [offsetX, offsetY])

  // Render the grid with viewport transform
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear and reset transform
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    // Apply viewport transform (pan and zoom)
    ctx.translate(offsetX, offsetY)

    // Calculate visible cell range for optimization
    const startCol = Math.max(0, Math.floor(-offsetX / cellSize))
    const endCol = Math.min(cols, Math.ceil((width - offsetX) / cellSize) + 1)
    const startRow = Math.max(0, Math.floor(-offsetY / cellSize))
    const endRow = Math.min(rows, Math.ceil((height - offsetY) / cellSize) + 1)

    // Draw alive cells
    ctx.fillStyle = '#000000'
    for (let r = startRow; r < endRow; r++) {
      const rowOffset = r * cols
      for (let c = startCol; c < endCol; c++) {
        if (alive[rowOffset + c]) {
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize)
        }
      }
    }

    // Draw grid lines
    ctx.strokeStyle = 'rgba(0,0,0,0.08)'
    ctx.lineWidth = 1
    for (let c = startCol; c <= endCol; c++) {
      const x = c * cellSize + 0.5
      ctx.beginPath()
      ctx.moveTo(x, startRow * cellSize)
      ctx.lineTo(x, endRow * cellSize)
      ctx.stroke()
    }
    for (let r = startRow; r <= endRow; r++) {
      const y = r * cellSize + 0.5
      ctx.beginPath()
      ctx.moveTo(startCol * cellSize, y)
      ctx.lineTo(endCol * cellSize, y)
      ctx.stroke()
    }
  }, [rows, cols, cellSize, alive, offsetX, offsetY, width, height])

  // Handle interactions
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let isDrawing = false
    let isPanning = false
    let visited = new Set<string>()
    let lastPinchDistance: number | null = null
    let lastTouchX = 0
    let lastTouchY = 0
    let lastMouseX = 0
    let lastMouseY = 0

    const screenToGrid = (clientX: number, clientY: number): { row: number; col: number } => {
      const rect = canvas.getBoundingClientRect()
      const x = clientX - rect.left - offsetXRef.current
      const y = clientY - rect.top - offsetYRef.current
      const col = Math.floor(x / cellSize)
      const row = Math.floor(y / cellSize)
      return { row, col }
    }

    const handleCell = (clientX: number, clientY: number) => {
      const { row, col } = screenToGrid(clientX, clientY)
      if (row >= 0 && row < rows && col >= 0 && col < cols) {
        const key = row + ',' + col
        if (!visited.has(key)) {
          visited.add(key)
          onCellClick(row, col)
        }
      }
    }

    // Mouse events
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && !e.shiftKey) { // Left click for drawing (without shift)
        isDrawing = true
        visited = new Set<string>()
        handleCell(e.clientX, e.clientY)
      } else if (e.button === 0 && e.shiftKey || e.button === 2 || e.button === 1) { // Shift+left, right, or middle click for panning
        isPanning = true
        lastMouseX = e.clientX
        lastMouseY = e.clientY
        canvas.style.cursor = 'grab'
        e.preventDefault()
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      if (isDrawing && !isPanning) {
        handleCell(e.clientX, e.clientY)
      } else if (isPanning) {
        canvas.style.cursor = 'grabbing'
        const dx = e.clientX - lastMouseX
        const dy = e.clientY - lastMouseY
        onPan(dx, dy)
        lastMouseX = e.clientX
        lastMouseY = e.clientY
      }
    }

    const onMouseUp = () => {
      isDrawing = false
      isPanning = false
      visited.clear()
      canvas.style.cursor = 'default'
    }

    const onContextMenu = (e: Event) => {
      e.preventDefault()
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      const delta = e.deltaY > 0 ? -0.02 : 0.02
      onZoom(delta, mouseX, mouseY)
    }

    // Touch events
    const getPinchDistance = (touches: TouchList) => {
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      return Math.sqrt(dx * dx + dy * dy)
    }

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Two-finger gesture: pinch or pan
        lastPinchDistance = getPinchDistance(e.touches)
        lastTouchX = (e.touches[0].clientX + e.touches[1].clientX) / 2
        lastTouchY = (e.touches[0].clientY + e.touches[1].clientY) / 2
        e.preventDefault()
      } else if (e.touches.length === 1) {
        // Single touch for drawing
        isDrawing = true
        visited = new Set<string>()
        const touch = e.touches[0]
        handleCell(touch.clientX, touch.clientY)
        e.preventDefault()
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const currentDistance = getPinchDistance(e.touches)
        const currentX = (e.touches[0].clientX + e.touches[1].clientX) / 2
        const currentY = (e.touches[0].clientY + e.touches[1].clientY) / 2

        // Handle pinch zoom
        if (lastPinchDistance !== null) {
          const delta = (currentDistance - lastPinchDistance)
          const rect = canvas.getBoundingClientRect()
          const centerX = currentX - rect.left
          const centerY = currentY - rect.top
          onZoom(delta, centerX, centerY)
        }

        // Handle two-finger pan
        const dx = currentX - lastTouchX
        const dy = currentY - lastTouchY
        onPan(dx, dy)

        lastPinchDistance = currentDistance
        lastTouchX = currentX
        lastTouchY = currentY
        e.preventDefault()
      } else if (e.touches.length === 1 && isDrawing) {
        const touch = e.touches[0]
        handleCell(touch.clientX, touch.clientY)
        e.preventDefault()
      }
    }

    const onTouchEnd = () => {
      isDrawing = false
      visited.clear()
      lastPinchDistance = null
    }

    canvas.addEventListener('mousedown', onMouseDown)
    canvas.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    canvas.addEventListener('contextmenu', onContextMenu)
    canvas.addEventListener('wheel', onWheel, { passive: false })

    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown)
      canvas.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      canvas.removeEventListener('contextmenu', onContextMenu)
      canvas.removeEventListener('wheel', onWheel)

      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [rows, cols, cellSize, onCellClick, onZoom, onPan])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', cursor: 'default' }}
    />
  )
}
