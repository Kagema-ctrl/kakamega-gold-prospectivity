import { useModel } from '../contexts/ModelContext'
import type { ModelType } from '../contexts/ModelContext'

interface Props {
  size?: 'sm' | 'md'
}

export default function ModelToggle({ size = 'md' }: Props) {
  const { activeModel, setActiveModel } = useModel()

  const options: { value: ModelType; label: string }[] = [
    { value: 'rf',  label: 'Random Forest' },
    { value: 'svm', label: 'SVM'           },
  ]

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {options.map(({ value, label }) => (
        <button
          key={value}
          className={`model-toggle-btn ${activeModel === value ? 'active' : 'inactive'}`}
          style={size === 'sm' ? { padding: '4px 14px', fontSize: 12 } : {}}
          onClick={() => setActiveModel(value)}
        >
          {activeModel === value && <span style={{ marginRight: 5 }}>●</span>}
          {label}
        </button>
      ))}
    </div>
  )
}
