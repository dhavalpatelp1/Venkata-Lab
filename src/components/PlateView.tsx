import React from 'react'
import { Batch } from '../types'

export default function PlateView({ batch }:{ batch:Batch }){
  const size = batch.plate_type ?? '24'
  const dims = size==='6' ? [2,3] : size==='24' ? [4,6] : [8,12]
  const [rows, cols] = dims
  const grid = Array.from({length:rows}, (_,r)=> Array.from({length:cols}, (_,c)=> ({r, c})))

  function posLabel(r:number,c:number){
    return String.fromCharCode(65+r) + (c+1)
  }

  return (
    <div className="card">
      <h3>Plate view ({size}-well)</h3>
      <div style={{display:'grid', gridTemplateColumns:`repeat(${cols}, minmax(0,1fr))`, gap:6}}>
        {grid.flat().map(cell=>{
          const label = posLabel(cell.r, cell.c)
          const sample = batch.samples.find(s=>s.plate_pos===label) || batch.samples[cell.r*cols + cell.c]
          const end = sample ? new Date(sample.plan.end_planned).toLocaleTimeString() : ''
          return (
            <div key={label} className="card" style={{textAlign:'center'}}>
              <div style={{fontSize:12, opacity:.7}}>{label}</div>
              <div style={{fontWeight:600}}>{sample?.id ?? '—'}</div>
              <div className="pill" style={{marginTop:6}}>{end}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
