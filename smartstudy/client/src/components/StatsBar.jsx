import { useCallback, useEffect, useMemo, useState } from "react";
import { listEvents } from "../api/events";
import { listTasks } from "../api/tasks";
import { listNotes } from "../api/notes";
import { CalendarDays, CheckSquare, TrendingUp, Timer } from "lucide-react";

const initialPomodoro = () => {
  try{
    return JSON.parse(localStorage.getItem('pomodoroStats')) || { sessions: 0, focusMinutes: 0 };
  }catch{
    return { sessions: 0, focusMinutes: 0 };
  }
};

export default function StatsBar(){
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [pomodoro, setPomodoro] = useState(initialPomodoro);

  const fetchData = useCallback(async () => {
    const [eventData, taskData, noteData] = await Promise.all([
      listEvents(),
      listTasks(),
      listNotes()
    ]);
    setEvents(eventData);
    setTasks(taskData);
    setNotes(noteData);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const handler = () => fetchData();
    const triggers = ['events:refresh','tasks:refresh','notes:refresh'];
    triggers.forEach(evt => window.addEventListener(evt, handler));
    return () => triggers.forEach(evt => window.removeEventListener(evt, handler));
  }, [fetchData]);

  useEffect(() => {
    const handler = (event) => {
      if(event.detail) setPomodoro(event.detail);
      else setPomodoro(initialPomodoro());
    };
    window.addEventListener('pomodoro:update', handler);
    return () => window.removeEventListener('pomodoro:update', handler);
  }, []);

  const stats = useMemo(() => {
    const today = new Date();
    const eventsToday = events.filter(evt => {
      const d = new Date(evt.start);
      return d.getFullYear()===today.getFullYear() &&
        d.getMonth()===today.getMonth() &&
        d.getDate()===today.getDate();
    }).length;

    const completed = tasks.filter(t => t.done).length;
    const totalTasks = tasks.length;
    const total = totalTasks || 1;
    const productivity = Math.round((completed / total) * 100);

    return [
      {
        label: 'Tasks Completed',
        value: totalTasks ? `${completed}/${totalTasks}` : `${completed}`,
        icon: CheckSquare,
        accent: 'bg-primary/10 text-primary',
        sub: `${notes.length} notes captured`
      },
      {
        label: 'Pomodoro Sessions',
        value: pomodoro.sessions,
        icon: Timer,
        accent: 'bg-accent/20 text-accent',
        sub: `${pomodoro.focusMinutes} min focus time`
      },
      {
        label: 'Productivity',
        value: `+${productivity}%`,
        icon: TrendingUp,
        accent: 'bg-emerald/10 text-emerald',
        sub: 'Based on completed tasks'
      },
      {
        label: 'Events Today',
        value: eventsToday,
        icon: CalendarDays,
        accent: 'bg-plum/10 text-plum',
        sub: `${events.length} upcoming this week`
      }
    ];
  }, [events, tasks, notes, pomodoro]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((card) => (
        <div key={card.label} className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted">{card.label}</p>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.accent}`}>
              <card.icon size={20}/>
            </div>
          </div>
          <div className="text-3xl font-title text-slate font-bold">{card.value}</div>
        </div>
      ))}
    </div>
  );
}
