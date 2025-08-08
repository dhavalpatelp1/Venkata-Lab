import React, { useMemo } from 'react'
import { Batch, Sample } from '../types'

function classify(samples: Sample[]) {
  const now = Date.now()
  const next60: Sample[] = []
  const overdue: Sample[] = []
  const nowLane: Sample[] = []
  for (const s of samples) {
    const end = new Date(s.plan.end_planned).getTime()
    const diffMin = (end - now)/60000
    if (diffMin <= 0) overdue.push(s)
    else if (diffMin <= 5) nowLane.push(s)
    else if (diffMin <= 60) next60.push(s)
  }
  const sortByTime = (a:Sample,b:Sample) => new Date(a.plan.end_planned).getTime() - new Date(b.plan.end_planned).getTime()
  return { nowLane: nowLane.sort(sortByTime), next60: next60.sort(sortByTime), overdue: overdue.sort(sortByTime) }
}

export default function LiveBoard({ batches }:{ batches:Batch[] }){
  const samples = useMemo(()=> batches.flatMap(b=>b.samples), [batches])
  const { nowLane, next60, overdue } = useMemo(()=> classify(samples), [samples])

  function lane(title:string, items: Sample[], cls=''){
    return (
      <div className={`card lane ${cls}`}>
        <h4>{title}</h4>
        {items.length===0 ? <div className="pill">—</div> :
          <div className="grid cols-3">
            {items.map(s=>{
              const end = new Date(s.plan.end_planned)
              return (
                <div key={s.id} className="card" style={{margin:0}}>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                    <strong>{s.id}</strong>
                    <span className="pill">{end.toLocaleTimeString()}</span>
                  </div>
                  <div style={{fontSize:12, opacity:.8, marginTop:6}}>
                    {s.plan.condition.temp ?? ''}°C · {s.plan.condition.rpm ?? ''} rpm · {s.location ?? 'loc?'}
                  </div>
                </div>
              )
            })}
          </div>}
      </div>
    )
  }

  return (
    <div className="grid cols-1">
      {lane('Now (≤5 min)', nowLane, 'soon')}
      {lane('Next 60 min', next60)}
      {lane('Overdue', overdue, 'overdue')}
    </div>
  )
}
