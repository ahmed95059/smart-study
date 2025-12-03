import { useMemo, useRef, useState } from "react";
import CalendarView from "../components/CalendarView.jsx";
import Pomodoro from "../components/Pomodoro.jsx";
import Todo from "../components/Todo.jsx";
import Notes from "../components/Notes.jsx";
import Chatbot from "../components/Chatbot.jsx";
import StatsBar from "../components/StatsBar.jsx";
import UpcomingEvents from "../components/UpcomingEvents.jsx";
import Papa from "papaparse";
import { createEvent } from "../api/events";
import { CalendarDays, LayoutDashboard, ListTodo, LogOut, NotebookPen, Settings, Timer, Upload, Wand2, Moon, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const mainNav = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Calendar', icon: CalendarDays },
  { label: 'Tasks', icon: ListTodo },
  { label: 'Notes', icon: NotebookPen },
  { label: 'Pomodoro', icon: Timer },
  { label: 'AI Assistant', icon: Wand2 },
];

const secondaryNav = [
  { label: 'Settings', icon: Settings },
  { label: 'Logout', icon: LogOut },
];

export default function Dashboard(){
  const fileRef = useRef();
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [section, setSection] = useState('Dashboard');

  const initials = useMemo(()=>{
    if(!user?.name) return 'JD';
    return user.name.split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase();
  }, [user]);

  const importCSV = () => {
    const file = fileRef.current?.files?.[0];
    if(!file) return;
    Papa.parse(file, {
      header: true,
      complete: async ({ data }) => {
        const rows = data.filter(Boolean);
        for (const r of rows) {
          await createEvent({
            title: r.title,
            start: r.start,
            end: r.end,
            type: r.type || "event",
            courseCode: r.courseCode || undefined,
            location: r.location || undefined,
            notes: r.notes || undefined
          });
        }
        alert("Events imported!");
        window.location.reload();
      }
    });
  };

  return (
    <div className="min-h-screen bg-bg-soft dark:bg-[#0B1220] flex">
      <aside className="hidden lg:flex w-64 flex-col bg-white dark:bg-[#121A2B] border-r border-border dark:border-[#1F2A44] p-6 space-y-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary text-white flex items-center justify-center font-bold">S</div>
            <div>
              <p className="text-sm text-muted">SmartStudy</p>
              <p className="font-title text-lg text-slate">Control Center</p>
            </div>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          {mainNav.map(item => {
            const Icon = item.icon;
            const active = section === item.label;
            return (
              <button
                key={item.label}
                className={`sidebar-link ${active ? 'active' : ''}`}
                onClick={() => setSection(item.label)}
              >
                <Icon size={18}/> {item.label}
              </button>
            )
          })}
        </nav>
        <div className="mt-auto space-y-2">
          {secondaryNav.map(item => {
            const Icon = item.icon
            const handler = item.label === 'Logout' ? logout : undefined
            return (
              <button key={item.label} className="sidebar-link" onClick={handler}>
                <Icon size={18}/> {item.label}
              </button>
            )
          })}
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="px-6 py-5 border-b border-border dark:border-[#1F2A44] bg-white dark:bg-[#121A2B] flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Welcome back</p>
            <h1 className="text-3xl font-title text-slate">Dashboard</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="btn border border-border flex items-center gap-2 cursor-pointer">
              <Upload size={16}/> Import CSV
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={importCSV}/>
            </label>
            <button
              aria-label="Toggle theme"
              className="btn border border-border flex items-center gap-2"
              onClick={toggle}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}
              <span className="text-xs">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <button className="btn btn-accent lg:hidden" onClick={logout}>Logout</button>
            <div className="flex items-center gap-3 bg-bg-soft dark:bg-[#182339] px-4 py-2 rounded-full">
              <div>
                <p className="text-xs text-muted">Student</p>
                <p className="font-semibold text-slate">{user?.name || 'John Doe'}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold">{initials}</div>
            </div>
          </div>
        </header>

        <section className="p-6 space-y-6">
          {section === 'Dashboard' && (
            <>
              <StatsBar />
              <div className="card">
                <UpcomingEvents />
              </div>
              <div className="grid gap-6 xl:grid-cols-3">
                <div className="card xl:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-title text-slate">Calendar</h3>
                  </div>
                  <CalendarView />
                </div>
                <div className="card">
                  <Todo />
                </div>
              </div>
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="card">
                  <Pomodoro />
                </div>
                <div className="card">
                  <Notes />
                </div>
                <div className="card">
                  <Chatbot />
                </div>
              </div>
            </>
          )}

          {section === 'Calendar' && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-title text-slate">Calendar</h3>
              </div>
              <CalendarView />
            </div>
          )}

          {section === 'Tasks' && (
            <div className="card">
              <Todo />
            </div>
          )}

          {section === 'Notes' && (
            <div className="card">
              <Notes />
            </div>
          )}

          {section === 'Pomodoro' && (
            <div className="card">
              <Pomodoro />
            </div>
          )}

          {section === 'AI Assistant' && (
            <div className="card">
              <Chatbot />
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
