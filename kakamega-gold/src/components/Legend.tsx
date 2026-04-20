import { PROS_CLASS_COLOR, PROS_CLASS_ORDER } from '../styles/theme'

interface Props { compact?: boolean }

export default function Legend({ compact = false }: Props) {
  const classes = [...PROS_CLASS_ORDER].reverse()

  return (
    <div style={{
      background: 'rgba(13,9,0,0.88)',
      border: '1px solid #5C3D00',
      borderRadius: 8,
      padding: compact ? '8px 12px' : '12px 16px',
      display: 'inline-flex',
      flexDirection: 'column',
      gap: compact ? 5 : 7,
      backdropFilter: 'blur(6px)',
    }}>
      <span style={{
        color: '#D4A017',
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: 2,
      }}>
        Prospectivity
      </span>
      {classes.map(cls => (
        <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: compact ? 12 : 16,
            height: compact ? 12 : 16,
            borderRadius: 3,
            background: PROS_CLASS_COLOR[cls],
            flexShrink: 0,
          }} />
          <span style={{ color: '#FFF8E1', fontSize: compact ? 10 : 12 }}>{cls}</span>
        </div>
      ))}
    </div>
  )
}
