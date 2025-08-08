export async function ensureNotifications() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const perm = await Notification.requestPermission()
  return perm === 'granted'
}

export function localAlert(title:string, body:string) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body })
  }
}

export function scheduleLocalAlerts(endISO: string, minsBefore: number[]) {
  const end = new Date(endISO).getTime()
  for (const m of minsBefore) {
    const when = end - m*60*1000 - Date.now()
    if (when > 0 && when < 7 * 24 * 3600 * 1000) {
      setTimeout(() => localAlert('VC LAB', `T-${m} min: pull due`), when)
    }
  }
}
