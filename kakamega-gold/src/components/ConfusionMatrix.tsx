import { computeMetrics } from '../utils/dataUtils'

interface Props {
  tp: number; fp: number; fn: number; tn: number
  modelName: string
}

export default function ConfusionMatrix({ tp, fp, fn, tn, modelName }: Props) {
  const { precision, recall, f1 } = computeMetrics(tp, fp, fn)

  const cell = (val: number, good: boolean, label: string) => (
    <div style={{
      background: good ? 'rgba(76,175,80,0.2)' : 'rgba(244,67,54,0.2)',
      border: `1px solid ${good ? 'rgba(76,175,80,0.4)' : 'rgba(244,67,54,0.4)'}`,
      borderRadius: 6,
      padding: '10px 8px',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: 24,
        fontWeight: 700,
        color: good ? '#4CAF50' : '#EF5350',
      }}>
        {val}
      </div>
      <div style={{ fontSize: 10, color: '#D4A017', marginTop: 2, textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  )

  const metric = (label: string, val: number) => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ color: '#FFB300', fontSize: 16, fontWeight: 700 }}>{val}%</div>
      <div style={{ color: '#D4A017', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
    </div>
  )

  return (
    <div>
      <div style={{
        fontSize: 11, color: '#D4A017', textTransform: 'uppercase',
        letterSpacing: '0.08em', marginBottom: 10,
      }}>
        {modelName} — Confusion Matrix
      </div>

      {/* Axis labels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
        {cell(tp, true,  'TP')}
        {cell(fp, false, 'FP')}
        {cell(fn, false, 'FN')}
        {cell(tn, true,  'TN')}
      </div>

      {/* Metrics row */}
      <div style={{
        display: 'flex', justifyContent: 'space-around',
        background: '#2a1f00', borderRadius: 8, padding: '10px 0', marginTop: 6,
      }}>
        {metric('Precision', precision)}
        {metric('Recall',    recall)}
        {metric('F1',        f1)}
      </div>
    </div>
  )
}
