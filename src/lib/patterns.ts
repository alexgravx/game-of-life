export type Pattern = Array<[number, number]>

export const PATTERNS: Record<string, Pattern> = {
  Pattern: [],
  Glider: [
    [0, 1], [1, 2], [2, 0], [2, 1], [2, 2],
  ],
  Blinker: [
    [0, -1], [0, 0], [0, 1],
  ],
  Toad: [
    [0, 0], [0, 1], [0, 2],
    [1, -1], [1, 0], [1, 1],
  ],
  Pulsar: [
    [-6, -4], [-6, -3], [-6, -2],
    [-1, -4], [-1, -3], [-1, -2],
    [1, -4], [1, -3], [1, -2],
    [6, -4], [6, -3], [6, -2],

    [-4, -6], [-3, -6], [-2, -6],
    [-4, -1], [-3, -1], [-2, -1],
    [-4, 1], [-3, 1], [-2, 1],
    [-4, 6], [-3, 6], [-2, 6],

    [-6, 4], [-6, 3], [-6, 2],
    [-1, 4], [-1, 3], [-1, 2],
    [1, 4], [1, 3], [1, 2],
    [6, 4], [6, 3], [6, 2],

    [4, -6], [3, -6], [2, -6],
    [4, -1], [3, -1], [2, -1],
    [4, 1], [3, 1], [2, 1],
    [4, 6], [3, 6], [2, 6],
  ],
  Beacon: [
    [0, 0], [0, 1],
    [1, 0],
    [2, 3],
    [3, 2], [3, 3],
  ],
  WelcomeMessageSmall: [],
  WelcomeMessage: []
}

// Generate a visually appealing welcome pattern that works on any screen size
export function generateWelcomePattern(rows: number, cols: number): Pattern {
  const pattern: Pattern = []

  // Helper function to add a pattern at a specific offset
  const addPattern = (basePattern: Pattern, offsetRow: number, offsetCol: number) => {
    basePattern.forEach(([dr, dc]) => {
      pattern.push([offsetRow + dr, offsetCol + dc])
    })
  }

  // Determine grid size for pattern distribution
  const minDimension = Math.min(rows, cols)

  if (minDimension < 20) {
    // Very small screens: symmetrical cross of blinkers
    addPattern(PATTERNS.Blinker, 0, 0)
    addPattern(PATTERNS.Blinker, -4, 0)
    addPattern(PATTERNS.Blinker, 4, 0)
    addPattern(PATTERNS.Blinker, 0, -4)
    addPattern(PATTERNS.Blinker, 0, 4)
  } else if (minDimension < 40) {
    // Small screens: symmetrical pattern with beacons at corners
    addPattern(PATTERNS.Blinker, 0, 0)
    addPattern(PATTERNS.Beacon, -6, -6)
    addPattern(PATTERNS.Beacon, 6, 6)
    addPattern(PATTERNS.Beacon, -6, 6)
    addPattern(PATTERNS.Beacon, 6, -6)
    addPattern(PATTERNS.Toad, 0, -8)
    addPattern(PATTERNS.Toad, 0, 8)
  } else if (minDimension < 60) {
    // Medium screens: symmetrical pattern with central pulsar
    addPattern(PATTERNS.Pulsar, 0, 0)
    addPattern(PATTERNS.Beacon, -15, -15)
    addPattern(PATTERNS.Beacon, 15, 15)
    addPattern(PATTERNS.Beacon, -15, 15)
    addPattern(PATTERNS.Beacon, 15, -15)
  } else {
    // Large screens: create a rich pattern field
    // Central pulsar
    addPattern(PATTERNS.Pulsar, 0, 0)

    // Four corner gliders moving inward
    addPattern(PATTERNS.Glider, -20, -20)
    addPattern(PATTERNS.Glider, 20, 20)
    addPattern(PATTERNS.Glider, -20, 20)
    addPattern(PATTERNS.Glider, 20, -20)

    // Ring of beacons around the center
    const beaconRadius = 15
    addPattern(PATTERNS.Beacon, -beaconRadius, 0)
    addPattern(PATTERNS.Beacon, beaconRadius, 0)
    addPattern(PATTERNS.Beacon, 0, -beaconRadius)
    addPattern(PATTERNS.Beacon, 0, beaconRadius)

    // Diagonal toads
    addPattern(PATTERNS.Toad, -12, -12)
    addPattern(PATTERNS.Toad, 12, 12)
    addPattern(PATTERNS.Toad, -12, 12)
    addPattern(PATTERNS.Toad, 12, -12)

    // Additional gliders at intermediate positions
    addPattern(PATTERNS.Glider, -25, 0)
    addPattern(PATTERNS.Glider, 25, 0)
    addPattern(PATTERNS.Glider, 0, -25)
    addPattern(PATTERNS.Glider, 0, 25)
  }

  return pattern
}
