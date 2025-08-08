import React, { useEffect, useState } from 'react'
import BatchForm from './components/BatchForm'
import LiveBoard from './components/LiveBoard'
import CalendarSync from './components/CalendarSync'
import PlateView from './components/PlateView'
import { Batch } from './types'
import { loadBatches, saveBatches } from './storage'
import { ensureNotifications } from './notifications'
import { generateLabelsPDF } from './labels'

export default function App(){
  const [batches, setBatches] = useState<Batch[]>([])
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(()=>{ (async()=>{
    const data = await loadBatches()
    setBatches(data)
    await ensureNotifications()
    navigator.serviceWorker?.register('/sw.js')
  })() }, [])

  function removeBatch(id:string){
    const next = batches.filter(b=>b.id!==id)
    setBatches(next); saveBatches(next)
  }

  const selectedBatch = batches.find(b=>b.id===selected) ?? batches[0]

  return (
    <div className="container">
      <header>
        <h1>VC LAB — Incubation Master</h1>
        <div className="actions">
          {selectedBatch && <button className="ghost" onClick={()=>generateLabelsPDF(selectedBatch.samples)}>Print labels</button>}
          <button className="ghost" onClick={()=>setBatches([])}>Clear</button>
          <a href="https://github.com/" target="_blank" rel="noreferrer"><button className="ghost">GitHub</button></a>
        </div>
      </header>

      <BatchForm batches={batches} setBatches={setBatches} />

      {batches.length>0 && (
        <div className="card">
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            {batches.map(b=>(
              <button key={b.id} className="ghost" onClick={()=>setSelected(b.id)}>{b.name}</button>
            ))}
          </div>
        </div>
      )}

      {selectedBatch && <PlateView batch={selectedBatch} />}
      <LiveBoard batches={batches} />
      <CalendarSync batches={batches} />

      <div className="card" style={{marginTop:16}}>
        <h3>Notes</h3>
        <p>• Client-side timers fire while the page is open. For guaranteed alerts, sync to Google Calendar or import ICS.</p>
        <p>• Offline-first: data stays in your browser. Add Supabase keys to sync across devices.</p>
      </div>
    </div>
  )
}
