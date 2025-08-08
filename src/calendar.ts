import { Sample } from './types'

function pad(n:number){ return n<10 ? '0'+n : ''+n }

export function toICS(samples: Sample[], calendarName='VC LAB'): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `X-WR-CALNAME:${calendarName}`,
    'PRODID:-//VC LAB//EN'
  ]

  for (const s of samples) {
    const start = new Date(s.plan.end_planned) // anchor alerts on end time
    const uid = `vc-${s.id}@vclab`
    const dtStart = toICSDate(start)
    const dtEnd = toICSDate(new Date(start.getTime() + 5*60*1000))
    const summary = `Pull ${s.id} (${s.plan.condition.temp ?? ''}°C ${s.plan.condition.rpm ?? ''}rpm)`
    const desc = `Batch: ${s.batch_id}\nLocation: ${s.location ?? ''}\nPlan end (UTC): ${s.plan.end_planned}\n`
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${uid}`)
    lines.push(`DTSTAMP:${toICSDate(new Date())}`)
    lines.push(`DTSTART:${dtStart}`)
    lines.push(`DTEND:${dtEnd}`)
    lines.push(`SUMMARY:${summary}`)
    lines.push(`DESCRIPTION:${desc}`)
    if (s.plan.alerts?.t_minus) {
      for (const m of s.plan.alerts.t_minus) {
        lines.push('BEGIN:VALARM')
        lines.push(`TRIGGER:-PT${m}M`)
        lines.push('ACTION:DISPLAY')
        lines.push(`DESCRIPTION:Pull ${s.id}`)
        lines.push('END:VALARM')
      }
    }
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

function toICSDate(d: Date): string {
  return d.getUTCFullYear()
    + pad(d.getUTCMonth()+1)
    + pad(d.getUTCDate())
    + 'T' + pad(d.getUTCHours())
    + pad(d.getUTCMinutes())
    + pad(d.getUTCSeconds()) + 'Z'
}

// -------- Google Calendar (client-side) --------
// Uses Google Identity Services OAuth for browser-only apps.
// Developer must set VITE_GOOGLE_CLIENT_ID and enable "Google Calendar API".
declare global { interface Window { google?: any } }

export async function ensureGoogleClient(): Promise<void> {
  if (window.google?.accounts) return
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load GIS'))
    document.head.appendChild(s)
  })
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://apis.google.com/js/api.js'
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load gapi'))
    document.head.appendChild(s)
  })
}

export async function googleAuthorize(scopes=['https://www.googleapis.com/auth/calendar']): Promise<any> {
  await ensureGoogleClient()
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) throw new Error('Missing VITE_GOOGLE_CLIENT_ID')
  const tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: scopes.join(' '),
    callback: () => {}
  })
  const token = await new Promise<string>((resolve, reject) => {
    tokenClient.callback = (resp:any) => {
      if (resp.error) reject(resp)
      else resolve(resp.access_token)
    }
    tokenClient.requestAccessToken()
  })
  await new Promise<void>((resolve, reject) => {
    window.gapi.load('client', async () => {
      try {
        await window.gapi.client.init({})
        await window.gapi.client.load('calendar', 'v3')
        resolve()
      } catch (e) { reject(e) }
    })
  })
  return token
}

export async function createGoogleEvents(samples: Sample[], calendarId='primary') {
  // Assumes googleAuthorize already called
  for (const s of samples) {
    const start = new Date(s.plan.end_planned)
    const end = new Date(start.getTime() + 10*60*1000)
    const summary = `Pull ${s.id} (${s.plan.condition.temp ?? ''}°C ${s.plan.condition.rpm ?? ''}rpm)`
    const description = `Batch: ${s.batch_id}\nLocation: ${s.location ?? ''}\nPlan end (UTC): ${s.plan.end_planned}`
    await window.gapi.client.calendar.events.insert({
      calendarId,
      resource: {
        summary,
        description,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 15 },
            { method: 'popup', minutes: 5 },
            { method: 'popup', minutes: 0 }
          ]
        }
      }
    })
  }
}
