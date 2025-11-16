import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { listEvents, createEvent, updateEvent, deleteEvent } from "../api/events";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-US": {} };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function CalendarView(){
  const [events, setEvents] = useState([]);

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
      eventPropGetter={eventPropGetter}
      style={{ height: 800 }}
    />
  );
}
