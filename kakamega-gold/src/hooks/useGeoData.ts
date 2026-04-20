import { useState, useEffect } from 'react'
import type { GeoCollection, LicenseCollection } from '../utils/dataUtils'

interface GeoDataState {
  rf: GeoCollection | null
  svm: GeoCollection | null
  licenses: LicenseCollection | null
  loading: boolean
  error: string | null
}

export function useGeoData(): GeoDataState {
  const [state, setState] = useState<GeoDataState>({
    rf: null, svm: null, licenses: null, loading: true, error: null,
  })

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [rfRes, svmRes, licRes] = await Promise.all([
          fetch('/data/rf_results.geojson'),
          fetch('/data/svm_results.geojson'),
          fetch('/data/active_licenses.geojson'),
        ])
        if (!rfRes.ok || !svmRes.ok || !licRes.ok) throw new Error('Failed to fetch GeoJSON')
        const [rf, svm, licenses] = await Promise.all([
          rfRes.json() as Promise<GeoCollection>,
          svmRes.json() as Promise<GeoCollection>,
          licRes.json() as Promise<LicenseCollection>,
        ])
        if (!cancelled) setState({ rf, svm, licenses, loading: false, error: null })
      } catch (e) {
        if (!cancelled) setState(s => ({ ...s, loading: false, error: String(e) }))
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return state
}
