import QRCode from 'qrcode'
import jsPDF from 'jspdf'
import { Sample } from './types'

export async function generateLabelsPDF(samples: Sample[]) {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const margin = 10
  const cellW = 60, cellH = 30
  let x = margin, y = margin
  for (let i=0;i<samples.length;i++) {
    const s = samples[i]
    if (i && i%8===0) { pdf.addPage(); x=margin; y=margin }
    const qrData = `vc-lab://sample/${encodeURIComponent(s.id)}`
    const qrCanvas = document.createElement('canvas')
    await QRCode.toCanvas(qrCanvas, qrData, { width: 24 })
    const qrImg = qrCanvas.toDataURL('image/png')
    pdf.setDrawColor(220); pdf.rect(x, y, cellW, cellH)
    pdf.setFontSize(10)
    pdf.text(`ID: ${s.id}`, x+30, y+8)
    pdf.text(`End: ${new Date(s.plan.end_planned).toLocaleTimeString()}`, x+30, y+14)
    pdf.text(`${s.plan.condition.temp ?? ''}°C  ${s.plan.condition.rpm ?? ''}rpm`, x+30, y+20)
    pdf.addImage(qrImg, 'PNG', x+4, y+4, 22, 22)
    x += cellW + 4
    if (x + cellW + margin > 210) { x = margin; y += cellH + 4 }
  }
  pdf.save('vc-lab-labels.pdf')
}
