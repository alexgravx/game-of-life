import { useEffect, useRef } from 'react'

export type GridProps = {
  rows: number
  cols: number
  cellSize: number
  bottomBarHeight: number
  alive: Uint8Array
  onCellClick: (row: number, col: number) => void
}

export default function Grid({ rows, cols, cellSize, bottomBarHeight, alive, onCellClick }: GridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const widthCss = cols * cellSize
    const heightCss = rows * cellSize
    canvas.style.width = widthCss + 'px'
    canvas.style.height = heightCss + 'px'
    canvas.width = Math.floor(widthCss * dpr)
    canvas.height = Math.floor(heightCss * dpr)

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, widthCss, heightCss)

    // Draw alive cells
    ctx.fillStyle = '#000000'
    for (let r = 0; r < rows; r++) {
      const rowOffset = r * cols
      for (let c = 0; c < cols; c++) {
        if (alive[rowOffset + c]) {
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize)
        }
      }
    }

    // Minimal grid
    ctx.strokeStyle = 'rgba(0,0,0,0.08)'
    ctx.lineWidth = 1
    for (let c = 0; c <= cols; c++) {
      const x = c * cellSize + 0.5
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, heightCss)
      ctx.stroke()
    }
    for (let r = 0; r <= rows; r++) {
      const y = r * cellSize + 0.5
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(widthCss, y)
      ctx.stroke()
    }
  }, [rows, cols, cellSize, bottomBarHeight, alive])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let isDown = false
    let visited = new Set<string>()

    const handleCell = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect()
      const x = clientX - rect.left
      const y = clientY - rect.top
      const col = Math.floor(x / cellSize)
      const row = Math.floor(y / cellSize)
      if (row >= 0 && row < rows && col >= 0 && col < cols) {
        const key = row + ',' + col
        if (!visited.has(key)) {
          visited.add(key)
          onCellClick(row, col)
        }
      }
    }

    const onMouseDown = (e: MouseEvent) => {
      isDown = true
      visited = new Set<string>()
      handleCell(e.clientX, e.clientY)
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return
      handleCell(e.clientX, e.clientY)
    }

    const onMouseUp = () => {
      isDown = false
      visited.clear()
    }

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isDown = true
        visited = new Set<string>()
        const touch = e.touches[0]
        handleCell(touch.clientX, touch.clientY)
        e.preventDefault()
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!isDown) return
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        handleCell(touch.clientX, touch.clientY)
        e.preventDefault()
      }
    }

    const onTouchEnd = () => {
      isDown = false
      visited.clear()
    }

    canvas.addEventListener('mousedown', onMouseDown)
    canvas.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown)
      canvas.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)

      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [rows, cols, cellSize, onCellClick])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block' }}
    />
  )
}


