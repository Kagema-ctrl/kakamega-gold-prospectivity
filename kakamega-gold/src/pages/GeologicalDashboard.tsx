import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend as RechartLegend,
} from 'recharts'
import { ModelProvider, useModel } from '../contexts/ModelContext'
import { useGeoData } from '../hooks/useGeoData'
import {
  totalArea, highPlusVeryHighArea,
  topLithologies, subCountyByClass, lithoByClass,
  pathfinderMeansByClass,
} from '../utils/dataUtils'
import { GOLD_THEME, PATHFINDER_ELEMENTS } from '../styles/theme'
import LoadingSpinner from '../components/LoadingSpinner'
import ModelToggle from '../components/ModelToggle'
import ProspectivityMap from '../components/ProspectivityMap'
import ConfusionMatrix from '../components/ConfusionMatrix'

/* ── Confusion matrix constants ─────────────────── */
const CM = {
  rf:  { tp: 23, fp: 4,  fn: 0, tn: 77 },
  svm: { tp: 22, fp: 8,  fn: 0, tn: 80 },
}

/* ── Custom tooltip ─────────────────────────────── */
function GoldTooltip({ active, payload, label }: {
  active?: boolean; payload?: {name: string; value: number; color: string}[]; label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1a1200', border: '1px solid #5C3D00', borderRadius: 8,
      padding: '10px 14px', fontSize: 12,
    }}>
      <div style={{ color: '#D4A017', marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, color: '#FFF8E1' }}>
          <span style={{ color: p.color }}>{p.name}</span>
          <span>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Sub-county colours ─────────────────────────── */
const SC_COLORS: string[] = [...GOLD_THEME.chart_gold_scale, '#FF8C00', '#FFB300', '#FFD700']

/* ── Heatmap cell colour ─────────────────────────── */
function heatColor(val: number, max: number): string {
  const t = max > 0 ? Math.min(val / max, 1) : 0
  const stops = ['#1a0e00','#3B1A00','#6B3200','#CC6600','#FFB300','#FFD700']
  const idx = Math.floor(t * (stops.length - 1))
  return stops[Math.min(idx, stops.length - 1)]
}

/* ── Inner dashboard ────────────────────────────── */
function DashboardInner() {
  const { activeModel } = useModel()
  const { rf, svm, licenses, loading, error } = useGeoData()

  const activeFeatures = useMemo(
    () => (activeModel === 'rf' ? rf?.features : svm?.features) ?? [],
    [activeModel, rf, svm]
  )

  // Top stats
  const statTotalArea = useMemo(() => totalArea(activeFeatures), [activeFeatures])
  const rfHighArea    = useMemo(() => rf  ? highPlusVeryHighArea(rf.features)  : 0, [rf])
  const svmHighArea   = useMemo(() => svm ? highPlusVeryHighArea(svm.features) : 0, [svm])

  // Charts
  const subCountyData = useMemo(() => subCountyByClass(activeFeatures), [activeFeatures])
  const lithoData     = useMemo(() => lithoByClass(activeFeatures), [activeFeatures])
  const topLithos6    = useMemo(() => topLithologies(activeFeatures, 6), [activeFeatures])
  const lithoDonut    = useMemo(() =>
    topLithos6.map(({ name, area }) => ({ name, value: parseFloat(area.toFixed(2)) })),
    [topLithos6]
  )
  const pathfinderRows = useMemo(() => pathfinderMeansByClass(activeFeatures), [activeFeatures])

  // Column max values for heatmap
  const elemMaxes = useMemo(() => {
    const maxes: Record<string, number> = {}
    for (const { label } of PATHFINDER_ELEMENTS) {
      maxes[label] = Math.max(...pathfinderRows.map(r => Number(r[label]) || 0))
    }
    return maxes
  }, [pathfinderRows])

  const lithoBarKeys = useMemo(() => topLithos6.map(l => l.name), [topLithos6])
  const subCountyNames = useMemo(
    () => [...new Set(subCountyData.map(d => d.subCounty))],
    [subCountyData]
  )

  const cm = CM[activeModel]
  const modelLabel = activeModel === 'rf' ? 'Random Forest' : 'SVM'

  if (loading) return <LoadingSpinner message="Loading GeoJSON data…" />
  if (error)   return <div style={{ color: '#EF5350', padding: 40 }}>{error}</div>

  return (
    <div style={{
      background: '#0d0900', minHeight: '100vh', paddingTop: 60,
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* ── Page header ─────────────────────────── */}
      <div style={{
        padding: '24px 32px 16px',
        borderBottom: '1px solid #2a1f00',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <h1 style={{ fontSize: 26, color: '#FFD700', marginBottom: 4 }}>
            Geological Analysis Dashboard
          </h1>
          <p style={{ color: '#D4A017', fontSize: 13 }}>
            Kakamega County Gold Prospectivity · {modelLabel} Model
          </p>
        </div>
        <ModelToggle />
      </div>

      {/* ── Top stats row ───────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16, padding: '20px 32px',
      }}>
        {[
          { value: statTotalArea, label: 'Total Modelled Area',       icon: '🗺️', decimals: 0 },
          { value: rfHighArea,    label: 'High+Very High Area (RF)',   icon: '🌲', decimals: 1 },
          { value: svmHighArea,   label: 'High+Very High Area (SVM)', icon: '⚙️', decimals: 1 },
          { value: 202.4,         label: 'RF+SVM Consensus Zone',      icon: '🎯', decimals: 1 },
        ].map(({ value, label, icon, decimals }) => (
          <div key={label} style={{
            background: '#1a1200',
            border: '1px solid #5C3D00',
            borderRadius: 12, padding: '18px 20px',
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
            <div style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 28, fontWeight: 700, color: '#FFB300', lineHeight: 1,
            }}>
              {value.toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
              })}
            </div>
            <div style={{ color: '#D4A017', fontSize: 12, marginTop: 2 }}>km²</div>
            <div style={{ color: '#FFF8E1', fontSize: 12, marginTop: 6, fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Main three-column layout ─────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr 320px',
        gap: 16, padding: '0 32px 32px',
        minHeight: 'calc(100vh - 280px)',
      }}>

        {/* ════ LEFT PANEL ════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Confusion matrix */}
          <div style={{
            background: '#1a1200', border: '1px solid #5C3D00',
            borderRadius: 12, padding: 18,
          }}>
            <ConfusionMatrix
              tp={cm.tp} fp={cm.fp} fn={cm.fn} tn={cm.tn}
              modelName={modelLabel}
            />
          </div>

          {/* Lithology donut */}
          <div style={{
            background: '#1a1200', border: '1px solid #5C3D00',
            borderRadius: 12, padding: 18, flex: 1,
          }}>
            <div style={{
              fontSize: 11, color: '#D4A017', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 12,
            }}>
              Lithology — High & Very High Zones
            </div>
            {lithoDonut.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={lithoDonut}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {lithoDonut.map((_, i) => (
                      <Cell key={i} fill={GOLD_THEME.chart_gold_scale[i % GOLD_THEME.chart_gold_scale.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [`${Number(v).toFixed(2)} km²`]}
                    contentStyle={{ background:'#1a1200', border:'1px solid #5C3D00', borderRadius:6, fontSize:11 }}
                    itemStyle={{ color:'#FFF8E1' }}
                    labelStyle={{ color:'#D4A017' }}
                  />
                  <RechartLegend
                    iconSize={8}
                    iconType="circle"
                    formatter={v => <span style={{ color:'#FFF8E1', fontSize:10 }}>{v}</span>}
                    wrapperStyle={{ fontSize:10, paddingTop:8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ color: '#5C3D00', fontSize: 12, padding: '20px 0' }}>No data</div>
            )}
          </div>
        </div>

        {/* ════ CENTER MAP ════ */}
        <div style={{
          background: '#1a1200', border: '1px solid #5C3D00',
          borderRadius: 12, overflow: 'hidden',
          minHeight: 600,
        }}>
          <ProspectivityMap
            activeData={activeModel === 'rf' ? rf : svm}
            licenseData={licenses}
            modelLabel={modelLabel}
          />
        </div>

        {/* ════ RIGHT PANEL ════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Sub-county bar chart */}
          <div style={{
            background: '#1a1200', border: '1px solid #5C3D00',
            borderRadius: 12, padding: 18,
          }}>
            <div style={{
              fontSize: 11, color: '#D4A017', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 12,
            }}>
              Prospectivity by Sub-County
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={subCountyData} margin={{ top: 0, right: 4, bottom: 40, left: -20 }}>
                <XAxis
                  dataKey="subCounty"
                  tick={{ fill: '#D4A017', fontSize: 9 }}
                  angle={-45} textAnchor="end"
                  interval={0}
                  axisLine={{ stroke: '#5C3D00' }}
                  tickLine={false}
                />
                <YAxis tick={{ fill: '#D4A017', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<GoldTooltip />} />
                {subCountyNames.map((sc, i) => (
                  <Bar key={sc} dataKey={sc} stackId="a"
                    fill={SC_COLORS[i % SC_COLORS.length]}
                    radius={i === subCountyNames.length - 1 ? [3, 3, 0, 0] : [0,0,0,0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pathfinder element heatmap table */}
          <div style={{
            background: '#1a1200', border: '1px solid #5C3D00',
            borderRadius: 12, padding: 18, overflow: 'auto', flex: 1,
          }}>
            <div style={{
              fontSize: 11, color: '#D4A017', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 12,
            }}>
              Mean Pathfinder Elements (ppm / ppb)
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="geo-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', fontSize: 10 }}>Class</th>
                    {PATHFINDER_ELEMENTS.map(({ label }) => (
                      <th key={label} style={{ textAlign: 'right', fontSize: 10 }}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pathfinderRows.map(row => (
                    <tr key={row.Pros_Class}>
                      <td style={{ fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap', paddingRight: 8 }}>
                        {row.Pros_Class}
                      </td>
                      {PATHFINDER_ELEMENTS.map(({ label }) => {
                        const v = Number(row[label])
                        const bg = heatColor(v, elemMaxes[label])
                        return (
                          <td key={label} className="heat-cell"
                            style={{ background: bg, fontSize: 10, color: '#FFF8E1' }}>
                            {v.toFixed(2)}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lithology × prospectivity bar */}
          <div style={{
            background: '#1a1200', border: '1px solid #5C3D00',
            borderRadius: 12, padding: 18,
          }}>
            <div style={{
              fontSize: 11, color: '#D4A017', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 12,
            }}>
              Lithology Distribution by Class
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={lithoData} margin={{ top: 0, right: 4, bottom: 40, left: -20 }}>
                <XAxis
                  dataKey="class"
                  tick={{ fill: '#D4A017', fontSize: 9 }}
                  angle={-30} textAnchor="end"
                  interval={0}
                  axisLine={{ stroke: '#5C3D00' }}
                  tickLine={false}
                />
                <YAxis tick={{ fill: '#D4A017', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<GoldTooltip />} />
                {lithoBarKeys.map((key, i) => (
                  <Bar key={key} dataKey={key} stackId="b"
                    fill={GOLD_THEME.chart_gold_scale[i % GOLD_THEME.chart_gold_scale.length]}
                    radius={i === lithoBarKeys.length - 1 ? [3, 3, 0, 0] : [0,0,0,0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Responsive grid collapse for tablets */}
      <style>{`
        @media (max-width: 1100px) {
          .geo-grid { grid-template-columns: 1fr 1fr !important; }
          .geo-grid > :nth-child(2) { grid-column: 1 / -1; }
        }
        @media (max-width: 768px) {
          .geo-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

export default function GeologicalDashboard() {
  return (
    <ModelProvider>
      <DashboardInner />
    </ModelProvider>
  )
}
