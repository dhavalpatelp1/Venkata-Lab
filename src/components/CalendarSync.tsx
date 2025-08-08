import React, { useState } from 'react'
import { Batch } from '../types'
import { googleAuthorize, createGoogleEvents, toICS } from '../calendar'

export default function CalendarSync({ batches }:{ batches:Batch[] }){
  const [busy, setBusy] = useState(false)
  const samples = batches.flatMap(b=>b.samples)

  async function toGoogle(){
    try {
      setBusy(true)
      await googleAuthorize()
      await createGoogleEvents(samples)
      alert('Events created in Google Calendar')
    } catch(e:any) {
      console.error(e); alert('Google sync failed: '+ e.message)
    } finally {
      setBusy(false)
    }
  }

  function downloadICS(){
    const ics = toICS(samples, 'VC LAB')
    const blob = new Blob([ics], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'vc-lab.ics'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="card">
      <h3>Calendar sync</h3>
      <p>Best reliability: add reminders to your external calendar.</p>
      <div style={{display:'flex', gap:8}}>
        <button onClick={toGoogle} disabled={busy}>{busy ? 'Syncing…' : 'Add to Google Calendar'}</button>
        <button className="ghost" onClick={downloadICS}>Download ICS</button>
      </div>
    </div>
  )
}
