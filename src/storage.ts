import { createClient } from '@supabase/supabase-js'
import { Batch } from './types'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase = (url && key) ? createClient(url, key) : null

const LS_KEY = 'vc-lab:batches'

export async function saveBatches(batches: Batch[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(batches))
  // Optionally mirror to supabase if configured
  if (supabase) {
    await supabase.from('batches').upsert(batches.map(b => ({
      id: b.id, name: b.name, project: b.project, created_at: b.created_at, plate_type: b.plate_type, samples: b.samples
    })))
  }
}

export async function loadBatches(): Promise<Batch[]> {
  const raw = localStorage.getItem(LS_KEY)
  if (raw) return JSON.parse(raw)
  if (supabase) {
    const { data } = await supabase.from('batches').select('*')
    if (data) return data as any
  }
  return []
}
