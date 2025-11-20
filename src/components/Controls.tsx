import { useState } from 'react'
import { FaBolt } from "react-icons/fa";
import { FaPlay } from "react-icons/fa";
import { FaPause } from "react-icons/fa";
import { HiRefresh } from "react-icons/hi";
import { FaRandom } from "react-icons/fa";
import { PiStackBold } from "react-icons/pi";

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
  const [showSpeedPopup, setShowSpeedPopup] = useState(false)
  const [showPatternPopup, setShowPatternPopup] = useState(false)

  const barClass =
    'flex items-center gap-3 px-4 py-3 rounded-3xl border border-black/10 bg-white/60 backdrop-blur-xs shadow-lg text-black'

  return (
    <div className={className ?? ''}>
      <div className="flex items-center justify-between gap-4">
          <div className={`${barClass} ms-4`}>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-2 rounded-2xl border border-black/10 bg-white text-black hover:opacity-60 shadow-sm"
                onClick={onToggleRun}
              >
                {isRunning ? <FaPause /> : <FaPlay />}
              </button>
              <button
                className="px-3 py-2 rounded-2xl border border-black/10 bg-white text-black hover:opacity-60 shadow-sm"
                onClick={onReset}
              >
                <HiRefresh />
              </button>
              <button
                className="px-3 py-2 rounded-2xl border border-black/10 bg-white text-black hover:opacity-60 shadow-sm"
                onClick={onRandomize}
              >
                <FaRandom />
              </button>
            </div>
        </div>

        <div className={`${barClass} me-4`}>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                className="w-10 h-10 rounded-full border border-black/10 bg-white text-black hover:opacity-60 shadow-sm flex items-center justify-center text-sm font-medium"
                onClick={() => {
                  setShowSpeedPopup((v) => !v)
                  setShowPatternPopup(false)
                }}
                aria-label="Speed"
                title="Speed"
              >
                <FaBolt />
              </button>

              {showSpeedPopup && (
                <div className="absolute bottom-full mb-5 p-3 rounded-3xl border border-black/10 bg-white shadow-lg w-20">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs font-medium text-black/70">Speed</span>
                    <div className="h-40 flex items-center justify-center">
                      <input
                        className="accent-black"
                        type="range"
                        min={50}
                        max={500}
                        step={10}
                        value={550 - speedMs}
                        onChange={(e) => onSpeedChange(550 - Number(e.target.value))}
                        style={{
                          writingMode: 'vertical-rl',
                          direction: 'rtl',
                          height: '140px',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                className="w-10 h-10 rounded-full border border-black/10 bg-white text-black hover:opacity-60 shadow-sm flex items-center justify-center text-sm font-medium"
                onClick={() => {
                  setShowPatternPopup((v) => !v)
                  setShowSpeedPopup(false)
                }}
                aria-label="Patterns"
                title="Patterns"
              >
                <PiStackBold />
              </button>

              {showPatternPopup && (
                <div className="absolute bottom-full right-0 mb-5 p-3 rounded-3xl border border-black/10 bg-white shadow-lg w-26 max-h-64 overflow-y-auto">
                  <div className="flex flex-col gap-1">
                    {patternNames.map((name) => (
                      <button
                        key={name}
                        className={`px-3 py-2 rounded-xl text-left text-sm hover:bg-black/5 transition-colors ${
                          selectedPattern === name ? 'bg-black/10 font-medium' : ''
                        }`}
                        onClick={() => {
                          onSelectPattern(name)
                          setShowPatternPopup(false)
                        }}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
