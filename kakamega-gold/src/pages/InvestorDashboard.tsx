import { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { ModelProvider, useModel } from '../contexts/ModelContext'
import { useGeoData } from '../hooks/useGeoData'
import {
  highPlusVeryHighArea, licensedHighArea, unlicensedHighArea,
  licenseCoveragePercent, highAreaTableBySubCounty, subCountyByClass,
} from '../utils/dataUtils'
import LoadingSpinner from '../components/LoadingSpinner'
import ModelToggle from '../components/ModelToggle'
import ProspectivityMap from '../components/ProspectivityMap'

/* ── Hardcoded license table rows ───────────────── */
const LICENSE_ROWS = [
  {
    code:       'PL/2018/0211',
    company:    'Gold Rim Exploration Kenya Ltd',
    status:     'Pending Renewal',
    area:       8.00,
    expiry:     '2025-01-30',
    commodities:'Base Minerals, Precious metals',
  },
  {
    code:       'PL/2018/0212',
    company:    'Gold Rim Exploration Kenya Ltd',
    status:     'Pending Renewal',
    area:       3.98,
    expiry:     '2025-01-30',
    commodities:'Precious metals',
  },
  {
    code:       'PL/2018/0210',
    company:    'Gold Rim Exploration Kenya Ltd',
    status:     'Pending Renewal',
    area:       8.15,
    expiry:     '2025-01-30',
    commodities:'Base Minerals, Precious metals',
  },
  {
    code:       'PL/2019/0225',
    company:    'Shanta Gold Kenya Limited',
    status:     'Active',
    area:       38.82,
    expiry:     '2025-07-31',
    commodities:'Precious Metal Group, Base and Rare Metals',
  },
]

function GoldTooltip({ active, payload, label }: {
  active?: boolean; payload?: {name: string; value: number; color: string}[]; label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1a1200', border: '1px solid #5C3D00', borderRadius: 8,
      padding: '10px 14px', fontSize: 12,
    }}>
      <div style={{ color: '#D4A017', marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', gap: 16, justifyContent: 'space-between', color: '#FFF8E1' }}>
          <span style={{ color: p.color }}>{p.name}</span>
          <span>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  )
}

/* ── KPI card ───────────────────────────────────── */
function KPICard({
  title, value, unit = 'km²', subtitle, accent = '#FFB300', badge,
}: {
  title: string; value: number; unit?: string
  subtitle?: string; accent?: string; badge?: string
}) {
  return (
    <div style={{
      background: '#1a1200', border: '1px solid #5C3D00',
      borderRadius: 16, padding: '28px 28px 24px',
      display: 'flex', flexDirection: 'column', gap: 10,
      flex: '1 1 200px',
      position: 'relative', overflow: 'hidden',
    }}>
      {badge && (
        <div style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(255,179,0,0.12)',
          border: '1px solid #FFB300',
          borderRadius: 10, padding: '2px 10px',
          fontSize: 10, color: '#FFB300',
        }}>
          {badge}
        </div>
      )}
      <div style={{ color: '#D4A017', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {title}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 44, fontWeight: 900, color: accent, lineHeight: 1,
        }}>
          {value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
        </span>
        <span style={{ color: '#D4A017', fontSize: 16 }}>{unit}</span>
      </div>
      {subtitle && (
        <div style={{ color: '#FFF8E1', fontSize: 13, opacity: 0.8, lineHeight: 1.5 }}>{subtitle}</div>
      )}
    </div>
  )
}

/* ── Inner investor dashboard ────────────────────── */
function InvestorInner() {
  const { activeModel } = useModel()
  const { rf, svm, licenses, loading, error } = useGeoData()
  const [highlightLicense, setHighlightLicense] = useState<string | null>(null)

  const activeFeatures = useMemo(
    () => (activeModel === 'rf' ? rf?.features : svm?.features) ?? [],
    [activeModel, rf, svm]
  )

  const rfFeats  = useMemo(() => rf?.features  ?? [], [rf])
  const svmFeats = useMemo(() => svm?.features ?? [], [svm])

  const highArea      = useMemo(() => highPlusVeryHighArea(activeFeatures),  [activeFeatures])
  const licArea       = useMemo(() => licensedHighArea(activeFeatures),       [activeFeatures])
  const unlicArea     = useMemo(() => unlicensedHighArea(activeFeatures),     [activeFeatures])
  const coverage      = useMemo(() => licenseCoveragePercent(activeFeatures), [activeFeatures])
  const subCountyTbl  = useMemo(() => highAreaTableBySubCounty(activeFeatures), [activeFeatures])
  const subCountyBar  = useMemo(() => subCountyByClass(activeFeatures), [activeFeatures])

  const rfHighArea  = useMemo(() => highPlusVeryHighArea(rfFeats),  [rfFeats])
  const svmHighArea = useMemo(() => highPlusVeryHighArea(svmFeats), [svmFeats])

  const modelLabel = activeModel === 'rf' ? 'Random Forest' : 'SVM'

  // Pie data
  const pieLicData = [
    { name: 'Licensed',    value: parseFloat(coverage.licensedPct.toFixed(1)) },
    { name: 'Unlicensed',  value: parseFloat((100 - coverage.licensedPct).toFixed(1)) },
  ]

  const areaGradient = (area: number, max: number) => {
    const t = max > 0 ? Math.min(area / max, 1) : 0
    const r = Math.round(255 * t)
    return `rgba(${r},${Math.round(r * 0.7)},0,0.25)`
  }
  const maxArea = subCountyTbl[0]?.area ?? 1

  if (loading) return <LoadingSpinner message="Loading investor data…" />
  if (error)   return <div style={{ color: '#EF5350', padding: 40 }}>{error}</div>

  return (
    <div style={{
      background: '#0d0900', minHeight: '100vh', paddingTop: 60,
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* ── Header ─────────────────────────────── */}
      <div style={{
        padding: '24px 36px 16px',
        borderBottom: '1px solid #2a1f00',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <h1 style={{ fontSize: 26, color: '#FFD700', marginBottom: 4 }}>
            Investor Dashboard
          </h1>
          <p style={{ color: '#D4A017', fontSize: 13 }}>
            Kakamega County Gold Prospectivity · Executive Intelligence
          </p>
        </div>
        <ModelToggle />
      </div>

      {/* ── Top KPI row ─────────────────────────── */}
      <div style={{ padding: '24px 36px', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <KPICard
          title="Total Prospective Area (High + Very High)"
          value={highArea}
          subtitle={`RF: ${rfHighArea.toFixed(1)} km²  |  SVM: ${svmHighArea.toFixed(1)} km²`}
          accent="#FFD700"
          badge={modelLabel}
        />
        <KPICard
          title="Prospective Area Under Active License"
          value={licArea}
          subtitle="High+Very High zones overlapping an active licence"
          accent="#FFB300"
        />
        <KPICard
          title="Priority Zones — No License"
          value={unlicArea}
          subtitle="Open for prospecting licence application"
          accent="#FF8C00"
          badge="Opportunity"
        />
      </div>

      {/* ── Consensus card ──────────────────────── */}
      <div style={{ padding: '0 36px 24px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1a1200, #2a1f00)',
          border: '1px solid #FFB300',
          borderRadius: 16, padding: '24px 32px',
          display: 'flex', alignItems: 'center', gap: 32,
          flexWrap: 'wrap',
        }}
          className="gold-pulse"
        >
          <div>
            <div style={{ color: '#D4A017', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              Model Consensus Zone
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 56, fontWeight: 900, color: '#FFD700', lineHeight: 1,
              }}>
                202.4
              </span>
              <span style={{ color: '#D4A017', fontSize: 20 }}>km²</span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ color: '#FFF8E1', fontSize: 15, lineHeight: 1.6, marginBottom: 12 }}>
              RF + SVM overlap — highest confidence targeting zones
            </div>
            <div style={{
              display: 'flex', gap: 12, flexWrap: 'wrap',
            }}>
              {[
                '✓ Both models agree',
                '✓ Reduced false-positive risk',
                '✓ Priority for drill targeting',
              ].map(t => (
                <span key={t} style={{
                  background: 'rgba(255,179,0,0.1)',
                  border: '1px solid #5C3D00',
                  borderRadius: 10, padding: '3px 12px',
                  fontSize: 11, color: '#FFB300',
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main three-column layout ────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr 340px',
        gap: 20, padding: '0 36px 36px',
      }}>

        {/* ════ LEFT PANEL ════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* License coverage donut */}
          <div style={{
            background: '#1a1200', border: '1px solid #5C3D00',
            borderRadius: 12, padding: 20,
          }}>
            <div style={{
              fontSize: 11, color: '#D4A017', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 12,
            }}>
              License Coverage — High+VH Zones
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieLicData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  animationBegin={0} animationDuration={800}
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={false}
                >
                  <Cell fill="#FF8C00" />
                  <Cell fill="#3B1A00" />
                </Pie>
                <Tooltip
                  formatter={(v) => [`${v}%`]}
                  contentStyle={{ background:'#1a1200', border:'1px solid #5C3D00', borderRadius:6, fontSize:11 }}
                  itemStyle={{ color:'#FFF8E1' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <p style={{
              color: '#D4A017', fontSize: 11, textAlign: 'center',
              lineHeight: 1.5, marginTop: 4,
            }}>
              {coverage.licensedPct.toFixed(1)}% of prospective area is under active licence
            </p>
          </div>

          {/* Active license table */}
          <div style={{
            background: '#1a1200', border: '1px solid #5C3D00',
            borderRadius: 12, padding: 20, flex: 1,
          }}>
            <div style={{
              fontSize: 11, color: '#D4A017', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 12,
            }}>
              Active Licences
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {LICENSE_ROWS.map(row => {
                const isPending = row.status.includes('Renewal')
                const statusColor = isPending ? '#FF8C00' : '#4CAF50'
                const isHighlighted = highlightLicense === row.code
                return (
                  <div
                    key={row.code}
                    onClick={() => setHighlightLicense(isHighlighted ? null : row.code)}
                    style={{
                      background: isHighlighted ? 'rgba(255,179,0,0.08)' : '#2a1f00',
                      border: `1px solid ${isHighlighted ? '#FFB300' : '#5C3D00'}`,
                      borderRadius: 8, padding: '10px 12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: '#FFD700', fontSize: 12, fontWeight: 700 }}>{row.code}</span>
                      <span style={{
                        color: statusColor, fontSize: 10,
                        border: `1px solid ${statusColor}`, borderRadius: 8,
                        padding: '1px 7px',
                      }}>
                        {row.status}
                      </span>
                    </div>
                    <div style={{ color: '#FFF8E1', fontSize: 11, marginBottom: 2 }}>
                      {row.company.replace(' (100%)', '')}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#D4A017' }}>
                      <span>{row.area.toFixed(2)} km²</span>
                      <span>Exp: {row.expiry}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ════ CENTER MAP ════ */}
        <div style={{
          background: '#1a1200', border: '1px solid #5C3D00',
          borderRadius: 12, overflow: 'hidden',
          minHeight: 580,
        }}>
          <ProspectivityMap
            activeData={activeModel === 'rf' ? rf : svm}
            licenseData={licenses}
            modelLabel={modelLabel}
            highlightLicense={highlightLicense}
            investorMode={true}
          />
        </div>

        {/* ════ RIGHT PANEL ════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Sub-county bar chart */}
          <div style={{
            background: '#1a1200', border: '1px solid #5C3D00',
            borderRadius: 12, padding: 20,
          }}>
            <div style={{
              fontSize: 11, color: '#D4A017', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 12,
            }}>
              Prospectivity Distribution by Sub-County
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={subCountyBar} margin={{ top: 0, right: 4, bottom: 44, left: -20 }}>
                <XAxis
                  dataKey="subCounty"
                  tick={{ fill: '#D4A017', fontSize: 9 }}
                  angle={-40} textAnchor="end"
                  interval={0}
                  axisLine={{ stroke: '#5C3D00' }} tickLine={false}
                />
                <YAxis tick={{ fill: '#D4A017', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<GoldTooltip />} />
                <Bar dataKey="High"      stackId="a" fill="#FF8C00" radius={[0,0,0,0]} />
                <Bar dataKey="Very High" stackId="a" fill="#FFD700" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Sub-county area table */}
          <div style={{
            background: '#1a1200', border: '1px solid #5C3D00',
            borderRadius: 12, padding: 20,
          }}>
            <div style={{
              fontSize: 11, color: '#D4A017', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 12,
            }}>
              Prospective Area by Sub-County
            </div>
            <table className="geo-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Sub-County</th>
                  <th style={{ textAlign: 'right' }}>Area (km²)</th>
                  <th style={{ textAlign: 'right' }}>License</th>
                </tr>
              </thead>
              <tbody>
                {subCountyTbl.map(({ subCounty, area, licensed }) => (
                  <tr key={subCounty}>
                    <td style={{ fontWeight: 500 }}>{subCounty}</td>
                    <td style={{
                      textAlign: 'right',
                      background: areaGradient(area, maxArea),
                      color: '#FFD700', fontWeight: 600,
                    }}>
                      {area.toFixed(1)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{
                        color: licensed ? '#4CAF50' : '#FF8C00',
                        fontSize: 10, fontWeight: 600,
                      }}>
                        {licensed ? '✓ Yes' : '○ Open'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Opportunity summary */}
          <div style={{
            background: '#1a1200', border: '1px solid #5C3D00',
            borderRadius: 12, padding: 20,
          }}>
            <div style={{
              fontSize: 11, color: '#D4A017', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 14,
            }}>
              Investment Opportunity Summary
            </div>
            {[
              { label: 'Highest priority unlicensed zone', value: 'Hamisi sub-county' },
              { label: 'Dominant lithology (high zones)', value: 'Mudstones (91.22%)' },
              { label: 'Secondary lithology',              value: 'Sheared Granites (5.1%)' },
              { label: 'Key pathfinder signature',         value: 'Elevated As, Sb, W' },
              { label: 'RF+SVM consensus area',            value: '202.4 km²' },
              { label: 'Active licence companies',         value: 'Gold Rim · Shanta Gold' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '8px 0',
                borderBottom: '1px solid rgba(92,61,0,0.3)',
                gap: 10,
              }}>
                <span style={{ color: '#D4A017', fontSize: 11 }}>{label}</span>
                <span style={{ color: '#FFB300', fontSize: 12, fontWeight: 600, textAlign: 'right' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .inv-grid { grid-template-columns: 1fr 1fr !important; }
          .inv-grid > :nth-child(2) { grid-column: 1 / -1; }
        }
        @media (max-width: 768px) {
          .inv-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

/* ── Barrel with context ────────────────────────── */
export default function InvestorDashboard() {
  return (
    <ModelProvider>
      <InvestorInner />
    </ModelProvider>
  )
}
