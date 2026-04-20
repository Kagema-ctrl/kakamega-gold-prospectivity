import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { GeoCollection, LicenseCollection } from '../utils/dataUtils'
import { GRIDCODE_STEP_EXPR, PATHFINDER_ELEMENTS } from '../styles/theme'
import Legend from './Legend'

interface Props {
  activeData: GeoCollection | null
  licenseData: LicenseCollection | null
  modelLabel: string
  /** Optional: highlight a specific license code on the map */
  highlightLicense?: string | null
  /** If true, show unlicensed-high pulsing overlay style */
  investorMode?: boolean
}

const MAP_CENTER: [number, number] = [34.75, 0.28]
const MAP_ZOOM = 9
const BASE_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

// Known gold occurrence locations
const GOLD_OCCURRENCES = [
  { name: 'Bukura',    coords: [34.72, 0.28] as [number, number] },
  { name: 'Kibiri',    coords: [34.76, 0.32] as [number, number] },
  { name: 'R. Yala',   coords: [34.82, 0.18] as [number, number] },
  { name: 'R. Feradzi',coords: [34.65, 0.22] as [number, number] },
]

const LICENSE_COMPANY_COLORS: Record<string, string> = {
  'Gold Rim Exploration Kenya Ltd': '#FFB300',
  'Shanta Gold Kenya Limited':      '#4488CC',
}

export default function ProspectivityMap({
  activeData, licenseData, modelLabel, highlightLicense, investorMode = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const popupRef = useRef<maplibregl.Popup | null>(null)

  const [layers, setLayers] = useState({
    licenses:    true,
    occurrences: true,
  })

  // Build popup HTML
  function buildPopupHtml(props: Record<string, unknown>) {
    const color: Record<string, string> = {
      'Very High': '#FFD700', 'High': '#FF8C00',
      'Moderate': '#CC6600', 'Low': '#7B3F00', 'Very Low': '#3B1A00',
    }
    const cls = String(props['Pros_Class'] ?? '')
    const rows = PATHFINDER_ELEMENTS.map(({ key, label }) => {
      const v = Number(props[key] ?? 0)
      return `<tr><td style="color:#D4A017">${label}</td><td style="text-align:right;color:#FFF8E1">${v.toFixed(2)}</td></tr>`
    }).join('')
    return `
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <div style="width:12px;height:12px;border-radius:3px;background:${color[cls] ?? '#3B1A00'};flex-shrink:0"></div>
          <strong style="color:#FFD700;font-size:13px">${cls}</strong>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:8px;font-size:11px">
          <tr><td style="color:#D4A017">Area</td><td style="text-align:right;color:#FFF8E1">${Number(props['Area_km2'] ?? 0).toFixed(3)} km²</td></tr>
          <tr><td style="color:#D4A017">Lithology</td><td style="text-align:right;color:#FFF8E1">${props['Litho_Name'] ?? ''}</td></tr>
          <tr><td style="color:#D4A017">Rock Type</td><td style="text-align:right;color:#FFF8E1">${props['Rock_Type'] ?? ''}</td></tr>
          <tr><td style="color:#D4A017">Sub-County</td><td style="text-align:right;color:#FFF8E1">${props['adm2_name'] ?? ''}</td></tr>
        </table>
        <div style="color:#D4A017;font-size:10px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Pathfinder Elements</div>
        <table style="width:100%;border-collapse:collapse;font-size:11px">${rows}</table>
        ${props['Lic_Overla'] === 1
          ? `<div style="margin-top:8px;padding:4px 8px;background:rgba(255,179,0,.15);border-radius:4px;font-size:11px;color:#FFB300">
               🏛️ ${props['Lic_Name']} — ${props['Lic_Comp']}
             </div>`
          : ''}
      </div>`
  }

  // Build investor popup
  function buildLicensePopupHtml(props: Record<string, unknown>) {
    const granted = props['DteGranted'] ? new Date(Number(props['DteGranted'])).toLocaleDateString() : '—'
    const expires = props['DteExpires'] ? new Date(Number(props['DteExpires'])).toLocaleDateString() : '—'
    const status  = String(props['Status'] ?? '')
    const color   = status.includes('Renewal') ? '#FF8C00' : '#4CAF50'
    return `
      <div>
        <div style="font-weight:700;color:#FFD700;margin-bottom:6px;font-size:13px">${props['Code'] ?? ''}</div>
        <div style="font-size:11px;color:#FFF8E1;margin-bottom:2px">${props['Parties'] ?? ''}</div>
        <div style="display:inline-block;padding:2px 8px;border-radius:10px;border:1px solid ${color};color:${color};font-size:10px;margin-bottom:8px">${status}</div>
        <table style="width:100%;border-collapse:collapse;font-size:11px">
          <tr><td style="color:#D4A017">Granted</td><td style="text-align:right;color:#FFF8E1">${granted}</td></tr>
          <tr><td style="color:#D4A017">Expires</td><td style="text-align:right;color:#FFF8E1">${expires}</td></tr>
          <tr><td style="color:#D4A017">Commodities</td><td style="text-align:right;color:#FFF8E1">${props['Commodities'] ?? ''}</td></tr>
          <tr><td style="color:#D4A017">Area</td><td style="text-align:right;color:#FFF8E1">${Number(props['Shape_Area'] ?? 0 / 1e6).toFixed(2)} km²</td></tr>
        </table>
      </div>`
  }

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const m = new maplibregl.Map({
      container: containerRef.current,
      style: BASE_STYLE,
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      attributionControl: false,
    })
    m.addControl(new maplibregl.NavigationControl(), 'top-right')
    m.addControl(new maplibregl.AttributionControl({ compact: true }))
    mapRef.current = m
    return () => { m.remove(); mapRef.current = null }
  }, [])

  // Update prospectivity layer when data or model changes
  useEffect(() => {
    const m = mapRef.current
    if (!m || !activeData) return
    const onLoad = () => {
      // Remove old layers/sources
      if (m.getLayer('pros-fill'))    m.removeLayer('pros-fill')
      if (m.getLayer('pros-outline')) m.removeLayer('pros-outline')
      if (m.getLayer('pros-high-outline')) m.removeLayer('pros-high-outline')
      if (m.getSource('pros'))        m.removeSource('pros')

      m.addSource('pros', { type: 'geojson', data: activeData as GeoJSON.FeatureCollection })
      m.addLayer({
        id: 'pros-fill',
        type: 'fill',
        source: 'pros',
        paint: {
          'fill-color': GRIDCODE_STEP_EXPR as maplibregl.DataDrivenPropertyValueSpecification<string>,
          'fill-opacity': 0.72,
        },
      })
      m.addLayer({
        id: 'pros-outline',
        type: 'line',
        source: 'pros',
        paint: { 'line-color': 'rgba(0,0,0,0.1)', 'line-width': 0.2 },
      })

      if (investorMode) {
        // Highlight unlicensed high zones with gold outline
        m.addLayer({
          id: 'pros-high-outline',
          type: 'line',
          source: 'pros',
          filter: ['all', ['>=', ['get', 'gridcode'], 3], ['==', ['get', 'Lic_Overla'], 0]],
          paint: { 'line-color': '#FFD700', 'line-width': 2, 'line-opacity': 0.8 },
        })
      }

      // Click popup on prospectivity
      m.on('click', 'pros-fill', (e) => {
        const feat = e.features?.[0]
        if (!feat) return
        popupRef.current?.remove()
        popupRef.current = new maplibregl.Popup({ maxWidth: '280px' })
          .setLngLat(e.lngLat)
          .setHTML(buildPopupHtml(feat.properties as Record<string, unknown>))
          .addTo(m)
      })
      m.on('mouseenter', 'pros-fill', () => { m.getCanvas().style.cursor = 'pointer' })
      m.on('mouseleave', 'pros-fill', () => { m.getCanvas().style.cursor = '' })
    }

    if (m.loaded()) onLoad()
    else m.once('load', onLoad)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeData, investorMode])

  // Update license layer
  useEffect(() => {
    const m = mapRef.current
    if (!m || !licenseData) return
    const onLoad = () => {
      if (m.getLayer('lic-fill'))    m.removeLayer('lic-fill')
      if (m.getLayer('lic-outline')) m.removeLayer('lic-outline')
      if (m.getSource('licenses'))   m.removeSource('licenses')

      m.addSource('licenses', { type: 'geojson', data: licenseData as GeoJSON.FeatureCollection })
      m.addLayer({
        id: 'lic-fill',
        type: 'fill',
        source: 'licenses',
        layout: { visibility: layers.licenses ? 'visible' : 'none' },
        paint: {
          'fill-color': [
            'match', ['get', 'Parties'],
            'Gold Rim Exploration Kenya Ltd (100%)', 'rgba(255,179,0,0.12)',
            'Shanta Gold Kenya Limited',             'rgba(68,136,204,0.12)',
            'rgba(255,255,255,0.05)',
          ] as maplibregl.DataDrivenPropertyValueSpecification<string>,
          'fill-opacity': 0.8,
        },
      })
      m.addLayer({
        id: 'lic-outline',
        type: 'line',
        source: 'licenses',
        layout: { visibility: layers.licenses ? 'visible' : 'none' },
        paint: {
          'line-width': 2,
          'line-color': [
            'match', ['get', 'Parties'],
            'Gold Rim Exploration Kenya Ltd (100%)', '#FFB300',
            'Shanta Gold Kenya Limited',             '#4488CC',
            '#888',
          ] as maplibregl.DataDrivenPropertyValueSpecification<string>,
          'line-opacity': 0.9,
        },
      })

      m.on('click', 'lic-outline', (e) => {
        const feat = e.features?.[0]
        if (!feat) return
        popupRef.current?.remove()
        popupRef.current = new maplibregl.Popup({ maxWidth: '280px' })
          .setLngLat(e.lngLat)
          .setHTML(buildLicensePopupHtml(feat.properties as Record<string, unknown>))
          .addTo(m)
      })
    }
    if (m.loaded()) onLoad()
    else m.once('load', onLoad)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [licenseData])

  // Toggle license layer visibility
  useEffect(() => {
    const m = mapRef.current
    if (!m || !m.getLayer('lic-fill')) return
    const vis = layers.licenses ? 'visible' : 'none'
    m.setLayoutProperty('lic-fill',    'visibility', vis)
    m.setLayoutProperty('lic-outline', 'visibility', vis)
  }, [layers.licenses])

  // Gold occurrence markers
  useEffect(() => {
    const m = mapRef.current
    if (!m) return
    markersRef.current.forEach(mk => mk.remove())
    markersRef.current = []
    if (!layers.occurrences) return
    GOLD_OCCURRENCES.forEach(({ name, coords }) => {
      const el = document.createElement('div')
      el.innerHTML = '▲'
      el.title = name
      Object.assign(el.style, {
        color: '#FFD700', fontSize: '14px', cursor: 'pointer',
        textShadow: '0 0 4px #0d0900',
        filter: 'drop-shadow(0 0 4px rgba(255,215,0,0.6))',
      })
      const mk = new maplibregl.Marker({ element: el })
        .setLngLat(coords)
        .setPopup(new maplibregl.Popup({ offset: 20 })
          .setHTML(`<strong style="color:#FFD700">⚡ ${name}</strong><br/><span style="color:#D4A017;font-size:11px">Known gold occurrence</span>`))
        .addTo(m)
      markersRef.current.push(mk)
    })
    return () => { markersRef.current.forEach(mk => mk.remove()); markersRef.current = [] }
  }, [layers.occurrences])

  // Highlight selected license
  useEffect(() => {
    const m = mapRef.current
    if (!m || !m.getSource('licenses')) return
    if (highlightLicense) {
      m.setPaintProperty('lic-outline', 'line-width', [
        'case', ['==', ['get', 'Code'], highlightLicense], 4, 2,
      ] as maplibregl.DataDrivenPropertyValueSpecification<number>)
    } else {
      m.setPaintProperty('lic-outline', 'line-width', 2)
    }
  }, [highlightLicense])

  const companyColors = Object.entries(LICENSE_COMPANY_COLORS)

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: 24, left: 12, zIndex: 10 }}>
        <Legend compact />
      </div>

      {/* Model label badge */}
      <div style={{
        position: 'absolute', top: 12, left: 12, zIndex: 10,
        background: 'rgba(13,9,0,0.85)', border: '1px solid #5C3D00',
        borderRadius: 8, padding: '4px 12px',
        fontSize: 11, fontWeight: 700, color: '#FFB300',
        backdropFilter: 'blur(4px)',
      }}>
        {modelLabel}
      </div>

      {/* License company legend */}
      {investorMode && (
        <div style={{
          position: 'absolute', bottom: 24, right: 12, zIndex: 10,
          background: 'rgba(13,9,0,0.85)', border: '1px solid #5C3D00',
          borderRadius: 8, padding: '10px 14px',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {companyColors.map(([company, color]) => (
            <div key={company} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
              <div style={{ width: 16, height: 3, background: color, borderRadius: 2, flexShrink: 0 }} />
              <span style={{ color: '#FFF8E1', maxWidth: 160 }}>{company.replace(' (100%)', '')}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, marginTop: 4 }}>
            <div style={{ width: 16, height: 3, background: '#FFD700', borderRadius: 2, flexShrink: 0 }} />
            <span style={{ color: '#FFD700' }}>Unlicensed high zone</span>
          </div>
        </div>
      )}

      {/* Layer toggles */}
      <div style={{
        position: 'absolute', top: 12, right: 52, zIndex: 10,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {[
          { key: 'licenses',    label: '🏛️ Licenses'    },
          { key: 'occurrences', label: '▲ Occurrences'  },
        ].map(({ key, label }) => {
          const on = layers[key as keyof typeof layers]
          return (
            <button key={key}
              onClick={() => setLayers(l => ({ ...l, [key]: !l[key as keyof typeof layers] }))}
              style={{
                background: on ? 'rgba(255,179,0,0.15)' : 'rgba(13,9,0,0.8)',
                border: `1px solid ${on ? '#FFB300' : '#5C3D00'}`,
                borderRadius: 6, padding: '4px 10px',
                fontSize: 11, color: on ? '#FFB300' : '#888',
                cursor: 'pointer', backdropFilter: 'blur(4px)',
              }}>
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
