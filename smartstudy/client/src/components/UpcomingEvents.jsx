import { useEffect, useMemo, useState } from 'react'
import { listEvents } from '../api/events'
import { Calendar, Clock3, MapPin } from 'lucide-react'

const dateFormatter = new Intl.DateTimeFormat('en-US', { weekday:'short', month:'short', day:'numeric' })
const timeFormatter = new Intl.DateTimeFormat('en-US', { hour:'numeric', minute:'2-digit' })

export default function UpcomingEvents(){
  const [events, setEvents] = useState([])

  useEffect(()=>{
    (async ()=>{
      const data = await listEvents()
      setEvents(data)
    })()
  }, [])

  const upcoming = useMemo(()=>(
    events
      .map(evt => ({ ...evt, start: new Date(evt.start), end: new Date(evt.end) }))
      .filter(evt => evt.start >= new Date())
      .sort((a,b)=>a.start - b.start)
      .slice(0,3)
  ), [events])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-title text-slate dark:text-dark-slate">Upcoming Events</h3>
      </div>
      <div className="space-y-3">
        {upcoming.map(evt => (
          <div key={evt._id} className="rounded-2xl border border-border dark:border-dark-border p-4 bg-card dark:bg-dark-card flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="text-primary font-semibold text-center min-w-[80px]">
              <div className="text-2xl">{timeFormatter.format(evt.start)}</div>
              <div className="text-xs text-muted dark:text-dark-muted mt-1">{evt.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate dark:text-dark-slate text-lg">{evt.title}</p>
              {evt.location && (
                <p className="text-sm text-muted dark:text-dark-muted flex items-center gap-1 mt-1">
                  <MapPin size={12}/> {evt.location}
                </p>
              )}
            </div>
          </div>
        ))}
        {upcoming.length===0 && (
          <div className="rounded-2xl border border-dashed border-border dark:border-dark-border p-8 text-center">
            <Calendar className="mx-auto mb-2 text-muted dark:text-dark-muted" size={32}/>
            <p className="text-muted dark:text-dark-muted text-sm">No upcoming events</p>
            <p className="text-xs text-muted dark:text-dark-muted mt-1">Use the calendar to add events</p>
          </div>
        )}
      </div>
    </div>
  )
}
