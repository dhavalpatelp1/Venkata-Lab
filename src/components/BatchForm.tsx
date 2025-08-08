import React, { useMemo, useState } from 'react'
import { Batch, Sample } from '../types'
import { saveBatches } from '../storage'
import { scheduleLocalAlerts } from '../notifications'

function uid(prefix='S'){ return prefix + Math.random().toString(36).slice(2,8).toUpperCase() }
function toUTC(isoLocal:string){ return new Date(isoLocal).toISOString() }

export default function BatchForm({ batches, setBatches }:{ batches:Batch[], setBatches:(b:Batch[])=>void }){
  const [name, setName] = useState('')
  const [count, setCount] = useState(24)
  const [plate, setPlate] = useState<'6'|'24'|'96'|'custom'>('24')
  const [temp, setTemp] = useState(30)
  const [rpm, setRpm] = useState(180)
  const [durationMin, setDurationMin] = useState(120)
  const [alerts, setAlerts] = useState('15,5,0')

  const startLocal = useMemo(()=> new Date().toISOString().slice(0,16),[])
  const [start, setStart] = useState(startLocal)

  function makeSamples(batchId:string): Sample[] {
    const samples: Sample[] = []
    const startUTC = toUTC(start)
    const endUTC = new Date(new Date(startUTC).getTime() + durationMin*60*1000).toISOString()
    for (let i=0;i<count;i++) {
      const id = uid()
      samples.push({
        id,
        batch_id: batchId,
        plan: { condition:{ temp, rpm, media:null, gas:null }, start_planned:startUTC, end_planned:endUTC, alerts:{ t_minus: alerts.split(',').map(s=>parseInt(s.trim())).filter(Boolean) } },
        actual:{},
        labels:[]
      })
    }
    return samples
  }

  async function createBatch(){
    const b: Batch = {
      id: uid('B'),
      name: name || `Batch ${new Date().toLocaleString()}`,
      project: undefined,
      created_at: new Date().toISOString(),
      plate_type: plate,
      samples: makeSamples(name)
    }
    const next = [b, ...batches]
    setBatches(next)
    await saveBatches(next)
    // schedule client-side alerts (best-effort; use calendar for reliability)
    for (const s of b.samples) {
      const t = s.plan.alerts?.t_minus ?? []
      scheduleLocalAlerts(s.plan.end_planned, t)
    }
  }

  return (
    <div className="card">
      <h3>Create batch</h3>
      <div className="grid cols-4" style={{marginTop:12}}>
        <div><label>Batch name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Yeast heat shock 42°C 15m"/></div>
        <div><label>Plate</label>
          <select value={plate} onChange={e=>setPlate(e.target.value as any)}>
            <option value="6">6-well</option>
            <option value="24">24-well</option>
            <option value="96">96-well</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div><label>Samples</label><input type="number" min={1} max={384} value={count} onChange={e=>setCount(parseInt(e.target.value||'1'))}/></div>
        <div><label>Start (local)</label><input type="datetime-local" value={start} onChange={e=>setStart(e.target.value)}/></div>
        <div><label>Temp (°C)</label><input type="number" value={temp} onChange={e=>setTemp(parseFloat(e.target.value))}/></div>
        <div><label>RPM</label><input type="number" value={rpm} onChange={e=>setRpm(parseFloat(e.target.value))}/></div>
        <div><label>Duration (min)</label><input type="number" value={durationMin} onChange={e=>setDurationMin(parseInt(e.target.value))}/></div>
        <div><label>Alerts (min before end)</label><input value={alerts} onChange={e=>setAlerts(e.target.value)} placeholder="15,5,0"/></div>
      </div>
      <div style={{marginTop:12}}>
        <button onClick={createBatch}>Start timers & save</button>
      </div>
    </div>
  )
}
