import { useEffect, useRef, useState } from 'react'

interface Props {
  value: number
  label: string
  unit?: string
  icon?: string
  decimals?: number
  accent?: string
  subtitle?: string
}

function useCountUp(target: number, decimals: number, isVisible: boolean) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const duration = 1200

  useEffect(() => {
    if (!isVisible) return
    startRef.current = null
    function step(ts: number) {
      if (!startRef.current) startRef.current = ts
      const progress = Math.min((ts - startRef.current) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setDisplay(parseFloat((ease * target).toFixed(decimals)))
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, isVisible, decimals])

  return display
}

export default function StatCard({
  value, label, unit = 'km²', icon, decimals = 1,
  accent = '#FFB300', subtitle,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const displayed = useCountUp(value, decimals, visible)

  return (
    <div
      ref={ref}
      style={{
        background: '#1a1200',
        border: '1px solid #5C3D00',
        borderRadius: 12,
        padding: '20px 24px',
        display: 'flex', flexDirection: 'column', gap: 8,
        transition: 'opacity 0.5s ease',
        opacity: visible ? 1 : 0,
      }}
    >
      {icon && (
        <span style={{ fontSize: 24, lineHeight: 1, marginBottom: 4 }}>{icon}</span>
      )}
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 6,
      }}>
        <span style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 32,
          fontWeight: 700,
          color: accent,
          lineHeight: 1,
        }}>
          {displayed.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })}
        </span>
        <span style={{ color: '#D4A017', fontSize: 14, fontWeight: 500 }}>{unit}</span>
      </div>
      <span style={{
        color: '#FFF8E1', fontSize: 13, fontWeight: 500, lineHeight: 1.4,
      }}>
        {label}
      </span>
      {subtitle && (
        <span style={{ color: '#D4A017', fontSize: 11, lineHeight: 1.4 }}>{subtitle}</span>
      )}
    </div>
  )
}
