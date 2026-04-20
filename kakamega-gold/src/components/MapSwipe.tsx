import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { GeoCollection } from '../utils/dataUtils'
import Legend from './Legend'
import { GRIDCODE_STEP_EXPR } from '../styles/theme'

interface Props {
  rfData:  GeoCollection | null
  svmData: GeoCollection | null
}

const MAP_CENTER: [number, number] = [34.75, 0.28]
const MAP_ZOOM = 9
const BASE_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

export default function MapSwipe({ rfData, svmData }: Props) {
  const leftRef  = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const mapLeft  = useRef<maplibregl.Map | null>(null)
  const mapRight = useRef<maplibregl.Map | null>(null)
  const syncing  = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const [dividerX, setDividerX]   = useState<number | null>(null)
  const [dragging, setDragging]   = useState(false)
  const [mapsReady, setMapsReady] = useState(0)

  // Set initial divider to 50%
  useEffect(() => {
    if (containerRef.current) {
      setDividerX(containerRef.current.offsetWidth / 2)
    }
  }, [])

  // Sync helper
  const syncMaps = useCallback(
    (source: maplibregl.Map, target: maplibregl.Map) => {
      if (syncing.current) return
      syncing.current = true
      target.jumpTo({
        center: source.getCenter(),
        zoom:   source.getZoom(),
        bearing: source.getBearing(),
        pitch:  source.getPitch(),
      })
      syncing.current = false
    }, []
  )

  // Init left map (RF)
  useEffect(() => {
    if (!leftRef.current || mapLeft.current) return
    const m = new maplibregl.Map({
      container: leftRef.current,
      style: BASE_STYLE,
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      attributionControl: false,
    })
    m.addControl(new maplibregl.AttributionControl({ compact: true }))
    m.on('load', () => {
      if (rfData) {
        m.addSource('rf', { type: 'geojson', data: rfData as GeoJSON.FeatureCollection })
        m.addLayer({
          id: 'rf-fill',
          type: 'fill',
          source: 'rf',
          paint: {
            'fill-color': GRIDCODE_STEP_EXPR as maplibregl.DataDrivenPropertyValueSpecification<string>,
            'fill-opacity': 0.78,
          },
        })
        m.addLayer({
          id: 'rf-outline',
          type: 'line',
          source: 'rf',
          paint: { 'line-color': 'rgba(0,0,0,0.15)', 'line-width': 0.3 },
        })
      }
      setMapsReady(n => n + 1)
    })
    mapLeft.current = m
    return () => { m.remove(); mapLeft.current = null }
  }, [rfData, syncMaps])

  // Init right map (SVM)
  useEffect(() => {
    if (!rightRef.current || mapRight.current) return
    const m = new maplibregl.Map({
      container: rightRef.current,
      style: BASE_STYLE,
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      attributionControl: false,
    })
    m.on('load', () => {
      if (svmData) {
        m.addSource('svm', { type: 'geojson', data: svmData as GeoJSON.FeatureCollection })
        m.addLayer({
          id: 'svm-fill',
          type: 'fill',
          source: 'svm',
          paint: {
            'fill-color': GRIDCODE_STEP_EXPR as maplibregl.DataDrivenPropertyValueSpecification<string>,
            'fill-opacity': 0.78,
          },
        })
        m.addLayer({
          id: 'svm-outline',
          type: 'line',
          source: 'svm',
          paint: { 'line-color': 'rgba(0,0,0,0.15)', 'line-width': 0.3 },
        })
      }
      setMapsReady(n => n + 1)
    })
    mapRight.current = m
    return () => { m.remove(); mapRight.current = null }
  }, [svmData, syncMaps])

  // Wire sync listeners once both maps are ready
  useEffect(() => {
    if (mapsReady < 2) return
    const ml = mapLeft.current!
    const mr = mapRight.current!
    const onLeftMove  = () => syncMaps(ml, mr)
    const onRightMove = () => syncMaps(mr, ml)
    ml.on('move', onLeftMove)
    mr.on('move', onRightMove)
    return () => {
      ml.off('move', onLeftMove)
      mr.off('move', onRightMove)
    }
  }, [mapsReady, syncMaps])

  // Drag handlers
  const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent | TouchEvent) => {
      const x = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const clamped = Math.max(50, Math.min(rect.width - 50, x - rect.left))
      setDividerX(clamped)
    }
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    window.addEventListener('touchmove', onMove)
    window.addEventListener('touchend',  onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend',  onUp)
    }
  }, [dragging])

  const posX = dividerX ?? 0

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
         ref={containerRef}>

      {/* Left map — RF */}
      <div ref={leftRef} style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
      }} />

      {/* Right map — SVM, clipped */}
      <div style={{
        position: 'absolute', inset: 0,
        clipPath: `inset(0 0 0 ${posX}px)`,
        transition: dragging ? 'none' : 'clip-path 0.05s',
      }}>
        <div ref={rightRef} style={{ position: 'absolute', inset: 0 }} />
      </div>

      {/* Labels */}
      <div className="swipe-label" style={{ left: 16 }}>← Random Forest</div>
      <div className="swipe-label" style={{ right: 16 }}>SVM →</div>

      {/* Divider line */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0,
        left: posX, width: 2,
        background: 'linear-gradient(to bottom, transparent, #FFB300, #FFD700, #FFB300, transparent)',
        pointerEvents: 'none',
        zIndex: 10,
      }} />

      {/* Drag handle */}
      <div
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        style={{
          position: 'absolute',
          top: '50%', left: posX,
          transform: 'translate(-50%, -50%)',
          width: 44, height: 44,
          borderRadius: '50%',
          background: '#0d0900',
          border: '2px solid #FFB300',
          cursor: dragging ? 'grabbing' : 'grab',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 20,
          userSelect: 'none',
          boxShadow: '0 0 16px rgba(255,179,0,0.5)',
          fontSize: 16, color: '#FFB300',
          letterSpacing: '-2px',
        }}
      >
        ‹›
      </div>

      {/* Centre label on handle */}
      <div style={{
        position: 'absolute',
        top: 'calc(50% + 30px)', left: posX,
        transform: 'translateX(-50%)',
        background: 'rgba(13,9,0,0.85)',
        border: '1px solid #5C3D00',
        borderRadius: 10,
        padding: '3px 10px',
        fontSize: 10,
        color: '#FFB300',
        pointerEvents: 'none',
        zIndex: 20,
        whiteSpace: 'nowrap',
      }}>
        drag to compare
      </div>

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: 24, left: 16, zIndex: 10 }}>
        <Legend compact />
      </div>
    </div>
  )
}
