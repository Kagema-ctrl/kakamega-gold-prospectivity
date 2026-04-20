import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export type ModelType = 'rf' | 'svm'

interface ModelContextValue {
  activeModel: ModelType
  setActiveModel: (m: ModelType) => void
}

const ModelContext = createContext<ModelContextValue>({
  activeModel: 'rf',
  setActiveModel: () => {},
})

export function ModelProvider({ children }: { children: ReactNode }) {
  const [activeModel, setActiveModel] = useState<ModelType>('rf')
  return (
    <ModelContext.Provider value={{ activeModel, setActiveModel }}>
      {children}
    </ModelContext.Provider>
  )
}

export function useModel() {
  return useContext(ModelContext)
}
