type ControlsProps = {
  isRunning: boolean
  speedMs: number
  onToggleRun: () => void
  onReset: () => void
  onRandomize: () => void
  onSpeedChange: (ms: number) => void
  patternNames: string[]
  selectedPattern: string
  onSelectPattern: (name: string) => void
  className?: string
}

export default function Controls({
  isRunning,
  speedMs,
  onToggleRun,
  onReset,
  onRandomize,
  onSpeedChange,
  patternNames,
  selectedPattern,
  onSelectPattern,
  className,
}: ControlsProps) {
  return (
    <div className={className ?? ''}>
      <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-xl border border-black/10 bg-white/60 backdrop-blur-xs shadow-lg text-black">
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded-2xl border border-black/10 bg-white text-black hover:opacity-60 shadow-sm" onClick={onToggleRun}>
            {isRunning ? 'Stop' : 'Start'}
          </button>
          <button className="px-3 py-2 rounded-2xl border border-black/10 bg-white text-black hover:opacity-60 shadow-sm" onClick={onReset}>Reset</button>
          <button className="px-3 py-2 rounded-2xl border border-black/10 bg-white text-black hover:opacity-60 shadow-sm" onClick={onRandomize}>Random</button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg text-black/70">Speed</span>
          <input
            className="accent-black"
            type="range"
            min={50}
            max={1000}
            step={10}
            value={speedMs}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            className="px-2 py-2 rounded-xl border border-black/20 bg-white text-black"
            value={selectedPattern}
            onChange={(e) => onSelectPattern(e.target.value)}
          >
            {patternNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}


