import { PROS_CLASS_ORDER, PATHFINDER_ELEMENTS } from '../styles/theme'

export interface GeoFeature {
  type: 'Feature'
  id?: number
  geometry: {
    type: string
    coordinates: unknown
  }
  properties: {
    FID: number
    gridcode: number
    Pros_Class: string
    Area_km2: number
    Vol_km2_15: number
    Vol_km2_25: number
    As_Mn: number
    Sb_Mn: number
    W_Mn: number
    Bi_Mn: number
    Cu_Mn: number
    Pb_Mn: number
    Zn_Mn: number
    Mn_Mn: number
    FebyMn_Mn: number
    Ag_Mn: number
    Lic_Overla: number
    Lic_Name: string
    Lic_Comp: string
    Lic_Grant: string
    Lic_Expir: string
    adm2_name: string
    Litho_Name: string
    Rock_Type: string
    Group_Syst: string
    [key: string]: unknown
  }
}

export interface GeoCollection {
  type: 'FeatureCollection'
  features: GeoFeature[]
}

export interface LicenseFeature {
  type: 'Feature'
  id?: number
  geometry: {
    type: string
    coordinates: unknown
  }
  properties: {
    OBJECTID?: number
    Code: string
    Type: string
    Status: string
    Parties: string
    AreaValue: number
    AreaUnit: string
    Commodities: string
    DteGranted: number
    DteExpires: number
    Shape_Area: number
    [key: string]: unknown
  }
}

export interface LicenseCollection {
  type: 'FeatureCollection'
  features: LicenseFeature[]
}

// ── Area totals ───────────────────────────────────────────────

export function totalArea(features: GeoFeature[]): number {
  return features.reduce((s, f) => s + (f.properties.Area_km2 ?? 0), 0)
}

export function highPlusVeryHighArea(features: GeoFeature[]): number {
  return features
    .filter(f => f.properties.gridcode >= 3)
    .reduce((s, f) => s + (f.properties.Area_km2 ?? 0), 0)
}

export function licensedHighArea(features: GeoFeature[]): number {
  return features
    .filter(f => f.properties.gridcode >= 3 && f.properties.Lic_Overla === 1)
    .reduce((s, f) => s + (f.properties.Area_km2 ?? 0), 0)
}

export function unlicensedHighArea(features: GeoFeature[]): number {
  return features
    .filter(f => f.properties.gridcode >= 3 && f.properties.Lic_Overla === 0)
    .reduce((s, f) => s + (f.properties.Area_km2 ?? 0), 0)
}

// ── Distributions ─────────────────────────────────────────────

/** Count features by Pros_Class, for a given sub-county filter */
export function countByClass(features: GeoFeature[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const f of features) {
    const c = f.properties.Pros_Class ?? 'Unknown'
    out[c] = (out[c] ?? 0) + 1
  }
  return out
}

/** Area (km²) by Pros_Class */
export function areaByClass(features: GeoFeature[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const f of features) {
    const c = f.properties.Pros_Class ?? 'Unknown'
    out[c] = (out[c] ?? 0) + (f.properties.Area_km2 ?? 0)
  }
  return out
}

/** Count High+Very High features per sub-county */
export function highAreaBySubCounty(features: GeoFeature[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const f of features.filter(f => f.properties.gridcode >= 3)) {
    const sc = f.properties.adm2_name ?? 'Unknown'
    out[sc] = (out[sc] ?? 0) + (f.properties.Area_km2 ?? 0)
  }
  return out
}

/** For grouped bar: sub-county x prospectivity class → count */
export function subCountyByClass(features: GeoFeature[]): {
  subCounty: string
  [cls: string]: number | string
}[] {
  const classes = ['High', 'Very High']
  const map: Record<string, Record<string, number>> = {}
  for (const f of features.filter(f => classes.includes(f.properties.Pros_Class))) {
    const sc = f.properties.adm2_name ?? 'Unknown'
    const cls = f.properties.Pros_Class
    if (!map[sc]) map[sc] = {}
    map[sc][cls] = (map[sc][cls] ?? 0) + 1
  }
  return Object.entries(map).map(([subCounty, counts]) => ({
    subCounty,
    High: counts['High'] ?? 0,
    'Very High': counts['Very High'] ?? 0,
  }))
}

/** For lithology grouped bar: litho x pros_class → count */
export function lithoByClass(features: GeoFeature[]): {
  class: string
  [litho: string]: number | string
}[] {
  const topLithos = topLithologies(features, 6).map(l => l.name)
  const rows = PROS_CLASS_ORDER.map(cls => {
    const entry: { class: string; [k: string]: number | string } = { class: cls }
    for (const l of topLithos) entry[l] = 0
    return entry
  })
  for (const f of features) {
    const cls = f.properties.Pros_Class
    const litho = f.properties.Litho_Name
    const row = rows.find(r => r.class === cls)
    if (row && topLithos.includes(litho)) {
      row[litho] = ((row[litho] as number) ?? 0) + 1
    }
  }
  return rows
}

/** Top N lithologies by area in High+Very High zones */
export function topLithologies(
  features: GeoFeature[],
  n = 6
): { name: string; area: number }[] {
  const map: Record<string, number> = {}
  for (const f of features.filter(f => f.properties.gridcode >= 3)) {
    const l = f.properties.Litho_Name ?? 'Unknown'
    map[l] = (map[l] ?? 0) + (f.properties.Area_km2 ?? 0)
  }
  return Object.entries(map)
    .map(([name, area]) => ({ name, area }))
    .sort((a, b) => b.area - a.area)
    .slice(0, n)
}

// ── Pathfinder element means ──────────────────────────────────

export function pathfinderMeansByClass(features: GeoFeature[]): {
  Pros_Class: string
  [elem: string]: number | string
}[] {
  return PROS_CLASS_ORDER.map(cls => {
    const subset = features.filter(f => f.properties.Pros_Class === cls)
    const row: { Pros_Class: string; [k: string]: number | string } = { Pros_Class: cls }
    for (const { key, label } of PATHFINDER_ELEMENTS) {
      if (subset.length === 0) {
        row[label] = 0
      } else {
        const sum = subset.reduce((s, f) => s + (Number(f.properties[key]) || 0), 0)
        row[label] = parseFloat((sum / subset.length).toFixed(3))
      }
    }
    return row
  }).reverse()
}

// ── Home page stats (computed from data) ──────────────────────

export function computeHomeStats(rf: GeoFeature[], svm: GeoFeature[]) {
  return {
    rfHighArea:    highPlusVeryHighArea(rf),
    svmHighArea:   highPlusVeryHighArea(svm),
    consensusArea: 202.4, // hardcoded — spatial intersection
    rfTotalArea:   totalArea(rf),
    // Pathfinder means for High+Very High
    rfMeans: elementMeansForHighZones(rf),
  }
}

function elementMeansForHighZones(features: GeoFeature[]) {
  const high = features.filter(f => f.properties.gridcode >= 3)
  if (!high.length) return { As: 0, Sb: 0, Ag: 0 }
  const mean = (key: string) =>
    high.reduce((s, f) => s + (Number(f.properties[key]) || 0), 0) / high.length
  return {
    As: parseFloat(mean('As_Mn').toFixed(3)),
    Sb: parseFloat(mean('Sb_Mn').toFixed(3)),
    Ag: parseFloat(mean('Ag_Mn').toFixed(3)),
  }
}

// ── Licence stats ─────────────────────────────────────────────

export function licenseCoveragePercent(features: GeoFeature[]): {
  licensed: number
  unlicensed: number
  licensedPct: number
} {
  const highFeats = features.filter(f => f.properties.gridcode >= 3)
  const total = highFeats.reduce((s, f) => s + (f.properties.Area_km2 ?? 0), 0)
  const lic = highFeats
    .filter(f => f.properties.Lic_Overla === 1)
    .reduce((s, f) => s + (f.properties.Area_km2 ?? 0), 0)
  return {
    licensed: lic,
    unlicensed: total - lic,
    licensedPct: total > 0 ? (lic / total) * 100 : 0,
  }
}

/** Area totals by sub-county for High+Very High zones */
export function highAreaTableBySubCounty(features: GeoFeature[]): {
  subCounty: string
  area: number
  licensed: boolean
}[] {
  const map: Record<string, { area: number; hasLicense: boolean }> = {}
  for (const f of features.filter(f => f.properties.gridcode >= 3)) {
    const sc = f.properties.adm2_name ?? 'Unknown'
    if (!map[sc]) map[sc] = { area: 0, hasLicense: false }
    map[sc].area += f.properties.Area_km2 ?? 0
    if (f.properties.Lic_Overla === 1) map[sc].hasLicense = true
  }
  return Object.entries(map)
    .map(([subCounty, { area, hasLicense }]) => ({
      subCounty,
      area: parseFloat(area.toFixed(1)),
      licensed: hasLicense,
    }))
    .sort((a, b) => b.area - a.area)
}

// ── Precision / Recall / F1 ───────────────────────────────────
export function computeMetrics(tp: number, fp: number, fn: number) {
  const precision = tp / (tp + fp) || 0
  const recall    = tp / (tp + fn) || 0
  const f1 = precision + recall > 0
    ? (2 * precision * recall) / (precision + recall) : 0
  return {
    precision: parseFloat((precision * 100).toFixed(1)),
    recall:    parseFloat((recall    * 100).toFixed(1)),
    f1:        parseFloat((f1        * 100).toFixed(1)),
  }
}
