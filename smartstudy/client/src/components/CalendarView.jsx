import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { listEvents, createEvent, updateEvent, deleteEvent } from "../api/events";
import { X, MapPin, Clock, FileText, Book } from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-US": {} };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function CalendarView(){
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayEvents, setDayEvents] = useState([]);

  const refresh = useCallback(async () => {
    const data = await listEvents();
    setEvents(data.map(e => ({ ...e, start: new Date(e.start), end: new Date(e.end) })));
  }, []);

  useEffect(()=>{ refresh(); }, [refresh]);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('events:refresh', handler);
    return () => window.removeEventListener('events:refresh', handler);
  }, [refresh]);

  const showDayDetails = (date) => {
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));
    
    const eventsOnDay = events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return (eventStart >= dayStart && eventStart <= dayEnd) ||
             (eventEnd >= dayStart && eventEnd <= dayEnd) ||
             (eventStart < dayStart && eventEnd > dayEnd);
    }).sort((a, b) => new Date(a.start) - new Date(b.start));
    
    setSelectedDate(date);
    setDayEvents(eventsOnDay);
  };

  const onCreate = async ({ start, end }) => {
    const title = prompt("Event title");
    if (!title) return;
    const created = await createEvent({ title, start, end });
    setEvents(prev => [...prev, { ...created, start: new Date(created.start), end: new Date(created.end) }]);
    window.dispatchEvent(new CustomEvent('events:refresh'));
  };

  const onRename = async (event) => {
    const nextTitle = prompt("Update title", event.title);
    if (nextTitle === null) return;
    const updated = await updateEvent(event._id, { title: nextTitle });
    setEvents(prev => prev.map(e => e._id === updated._id ? { ...updated, start: new Date(updated.start), end: new Date(updated.end) } : e));
    window.dispatchEvent(new CustomEvent('events:refresh'));
  };

  const eventPropGetter = (event) => {
    // Course vs regular: match PDF’s accent/primary usage
    const isCourse = event.type === "course";
    const style = {
      backgroundColor: isCourse ? "#4DA8DA" : "#FFA45B",
      border: "none",
      color: "white",
      borderRadius: "8px",
      padding: "0 4px"
    };
    return { style };
  };

  const components = useMemo(()=>({
    event: ({ event }) => (
      <div className="flex justify-between items-center">
        <span className="truncate">{event.title}</span>
        <button
          onClick={(e)=>{ 
            e.stopPropagation(); 
            if(confirm("Delete this event?")) { 
              deleteEvent(event._id).then(()=> {
                setEvents(prev=>prev.filter(x=>x._id!==event._id));
                window.dispatchEvent(new CustomEvent('events:refresh'));
              }); 
            } 
          }}
          className="ml-2 text-[11px] underline"
        >Delete</button>
      </div>
    )
  }), []);

  return (
    <>
      <Calendar
        selectable
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={["month","week","day"]}
        defaultView="month"
        popup
        onSelectSlot={onCreate}
        onDoubleClickEvent={onRename}
        onNavigate={(date) => {}}
        onDrillDown={(date) => showDayDetails(date)}
        eventPropGetter={eventPropGetter}
        style={{ height: 560 }}
      />

      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDate(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-primary text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-title">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h3>
                <p className="text-sm text-white/80 mt-1">
                  {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'} scheduled
                </p>
              </div>
              <button 
                onClick={() => setSelectedDate(null)}
                className="hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(80vh-100px)] p-6">
              {dayEvents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-bg-soft rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock size={32} className="text-muted" />
                  </div>
                  <p className="text-muted text-lg">No events scheduled for this day</p>
                  <p className="text-sm text-muted mt-2">Click on a time slot to add an event</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dayEvents.map((event, idx) => (
                    <div 
                      key={event._id || idx}
                      className="border border-border rounded-xl p-4 hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div 
                              className="w-1 h-16 rounded-full"
                              style={{ backgroundColor: event.type === 'course' ? '#4DA8DA' : '#FFA45B' }}
                            />
                            <div className="flex-1">
                              <h4 className="text-lg font-title text-slate mb-1">{event.title}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted">
                                <Clock size={14} />
                                <span>
                                  {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
                                </span>
                                {event.type === 'course' && (
                                  <>
                                    <span className="text-muted">•</span>
                                    <Book size={14} />
                                    <span className="text-primary font-semibold">{event.courseCode || 'Course'}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {event.location && (
                            <div className="flex items-center gap-2 text-sm text-slate mb-2 ml-5">
                              <MapPin size={14} className="text-muted" />
                              <span>{event.location}</span>
                            </div>
                          )}

                          {event.notes && (
                            <div className="flex items-start gap-2 text-sm text-slate ml-5 mt-3 bg-bg-soft p-3 rounded-lg">
                              <FileText size={14} className="text-muted mt-0.5 flex-shrink-0" />
                              <span>{event.notes}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedDate(null);
                              onRename(event);
                            }}
                            className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-bg-soft transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if(confirm("Delete this event?")) {
                                deleteEvent(event._id).then(()=> {
                                  setEvents(prev=>prev.filter(x=>x._id!==event._id));
                                  setDayEvents(prev=>prev.filter(x=>x._id!==event._id));
                                  window.dispatchEvent(new CustomEvent('events:refresh'));
                                });
                              }
                            }}
                            className="text-xs px-3 py-1.5 rounded-lg border border-error text-error hover:bg-error/10 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
