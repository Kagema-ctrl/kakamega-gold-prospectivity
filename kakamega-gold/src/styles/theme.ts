export const GOLD_THEME = {
  bg_deep:       '#0d0900',
  bg_card:       '#1a1200',
  bg_surface:    '#2a1f00',
  accent_gold:   '#FFB300',
  accent_bright: '#FFD700',
  accent_amber:  '#FF8C00',
  accent_rust:   '#8B4513',
  text_primary:  '#FFF8E1',
  text_secondary:'#D4A017',
  border:        '#5C3D00',
  success:       '#4CAF50',
  chart_gold_scale: ['#3B1A00', '#6B3200', '#9C5000', '#CC7A00', '#FFB300', '#FFD700'],
} as const

/** Maps Pros_Class string → fill colour */
export const PROS_CLASS_COLOR: Record<string, string> = {
  'Very High': '#FFD700',
  'High':      '#FF8C00',
  'Moderate':  '#CC6600',
  'Low':       '#7B3F00',
  'Very Low':  '#3B1A00',
}

/** Maps gridcode 0-4 → fill colour */
export const GRIDCODE_COLOR: Record<number, string> = {
  4: '#FFD700',
  3: '#FF8C00',
  2: '#CC6600',
  1: '#7B3F00',
  0: '#3B1A00',
}

/** MapLibre match expression for Pros_Class → colour */
export const PROS_CLASS_MATCH_EXPR = [
  'match', ['get', 'Pros_Class'],
  'Very High', '#FFD700',
  'High',      '#FF8C00',
  'Moderate',  '#CC6600',
  'Low',       '#7B3F00',
  'Very Low',  '#3B1A00',
  '#3B1A00',
] as unknown[]

/** MapLibre step expression for gridcode → colour */
export const GRIDCODE_STEP_EXPR = [
  'step', ['get', 'gridcode'],
  '#3B1A00',
  1, '#7B3F00',
  2, '#CC6600',
  3, '#FF8C00',
  4, '#FFD700',
] as unknown[]

export const PROS_CLASS_ORDER = ['Very Low', 'Low', 'Moderate', 'High', 'Very High']

export const SUB_COUNTIES = [
  'Navakholo', 'Lurambi', 'Hamisi', 'Butere',
  'Ikolomani', 'Shinyalu', 'Emuhaya', 'Sabatia', 'Khwisero',
]

export const PATHFINDER_ELEMENTS = [
  { key: 'As_Mn',      label: 'As'    },
  { key: 'Sb_Mn',      label: 'Sb'    },
  { key: 'W_Mn',       label: 'W'     },
  { key: 'Bi_Mn',      label: 'Bi'    },
  { key: 'Cu_Mn',      label: 'Cu'    },
  { key: 'Pb_Mn',      label: 'Pb'    },
  { key: 'Zn_Mn',      label: 'Zn'    },
  { key: 'Mn_Mn',      label: 'Mn'    },
  { key: 'FebyMn_Mn',  label: 'Fe/Mn' },
  { key: 'Ag_Mn',      label: 'Ag'    },
] as const
