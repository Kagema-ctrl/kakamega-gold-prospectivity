interface Props { message?: string }

export default function LoadingSpinner({ message = 'Loading data…' }: Props) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', gap: 20,
    }}>
      <div className="gold-spinner" />
      <p style={{ color: '#D4A017', fontSize: 14, fontStyle: 'italic' }}>{message}</p>
    </div>
  )
}
