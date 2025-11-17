import { useMemo, useRef, useState } from "react";
import CalendarView from "../components/CalendarView.jsx";
import Pomodoro from "../components/Pomodoro.jsx";
import Todo from "../components/Todo.jsx";
import Notes from "../components/Notes.jsx";
import Chatbot from "../components/Chatbot.jsx";
import StatsBar from "../components/StatsBar.jsx";
import UpcomingEvents from "../components/UpcomingEvents.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import Papa from "papaparse";
import { createEvent } from "../api/events";
import { CalendarDays, LayoutDashboard, ListTodo, LogOut, NotebookPen, Settings, Timer, Upload, Wand2, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

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
  const [expandedModal, setExpandedModal] = useState(null);

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
    <div className="min-h-screen bg-bg-soft dark:bg-dark-bg flex">
      <aside className="hidden lg:flex w-64 flex-col bg-white dark:bg-dark-card border-r border-border dark:border-dark-border p-6 space-y-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary text-white flex items-center justify-center font-bold">S</div>
            <div>
              <p className="text-sm text-muted dark:text-dark-muted">SmartStudy</p>
              <p className="font-title text-lg text-slate dark:text-dark-slate">Control Center</p>
            </div>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          {mainNav.map(item => {
            const Icon = item.icon;
            const active = item.label === 'Dashboard';
            const isAIAssistant = item.label === 'AI Assistant';
            const isCalendar = item.label === 'Calendar';
            const isTasks = item.label === 'Tasks';
            const isNotes = item.label === 'Notes';
            const isPomodoro = item.label === 'Pomodoro';
            
            const handler = () => {
              if (isAIAssistant) setExpandedModal('chatbot');
              else if (isCalendar) setExpandedModal('calendar');
              else if (isTasks) setExpandedModal('tasks');
              else if (isNotes) setExpandedModal('notes');
              else if (isPomodoro) setExpandedModal('pomodoro');
            };
            
            const shouldExpand = isAIAssistant || isCalendar || isTasks || isNotes || isPomodoro;
            
            return (
              <button 
                key={item.label} 
                className={`sidebar-link ${active ? 'active' : ''} ${
                  shouldExpand
                    ? 'relative group hover:bg-gradient-to-r hover:from-primary/20 hover:to-accent/20 dark:hover:from-dark-primary/20 dark:hover:to-dark-accent/20 transition-all duration-300' 
                    : ''
                } ${shouldExpand ? 'cursor-pointer' : ''}`}
                onClick={handler}
              >
                {shouldExpand && (
                  <>
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur"></div>
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                  </>
                )}
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
        <header className="px-6 py-5 border-b border-border bg-white dark:bg-dark-card dark:border-dark-border flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted dark:text-dark-muted">Welcome back</p>
            <h1 className="text-3xl font-title text-slate dark:text-dark-slate">Dashboard</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="btn border border-border dark:border-dark-border dark:bg-dark-card dark:text-dark-slate flex items-center gap-2 cursor-pointer">
              <Upload size={16}/> Import CSV
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={importCSV}/>
            </label>
            <ThemeToggle />
            <button className="btn btn-accent lg:hidden" onClick={logout}>Logout</button>
            <div className="flex items-center gap-3 bg-bg-soft dark:bg-dark-card px-4 py-2 rounded-full">
              <div>
                <p className="text-xs text-muted dark:text-dark-muted">Student</p>
                <p className="font-semibold text-slate dark:text-dark-slate">{user?.name || 'John Doe'}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold">{initials}</div>
            </div>
          </div>
        </header>

        <section className="p-6 space-y-6">
          <StatsBar />

          <div className="card">
            <UpcomingEvents />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="card chatbot-card-click cursor-pointer xl:col-span-2" onClick={() => setExpandedModal('calendar')}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-title text-slate dark:text-dark-slate">Calendar</h3>
              </div>
              <CalendarView />
            </div>
            <div className="card chatbot-card-click cursor-pointer" onClick={() => setExpandedModal('tasks')}>
              <Todo />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="card chatbot-card-click cursor-pointer" onClick={() => setExpandedModal('pomodoro')}>
              <Pomodoro />
            </div>
            <div className="card chatbot-card-click cursor-pointer" onClick={() => setExpandedModal('notes')}>
              <Notes />
            </div>
            <div className="card chatbot-card-click cursor-pointer" onClick={() => setExpandedModal('chatbot')}>
              <div className="relative w-full h-full">
                <Chatbot />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Expanded Modal for Calendar */}
      {expandedModal === 'calendar' && (
        <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-dark-card rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 ease-out origin-bottom">
            <div className="flex items-center justify-between p-6 border-b border-border dark:border-dark-border">
              <h2 className="text-2xl font-title text-slate dark:text-dark-slate animate-in fade-in duration-300 delay-100">Calendar</h2>
              <button 
                onClick={() => setExpandedModal(null)}
                className="p-2 hover:bg-bg-soft dark:hover:bg-dark-border rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-90 active:scale-95"
              >
                <X size={24} className="text-slate dark:text-dark-slate" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden animate-in fade-in duration-400 delay-150">
              <CalendarView />
            </div>
          </div>
        </div>
      )}

      {/* Expanded Modal for Tasks */}
      {expandedModal === 'tasks' && (
        <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-dark-card rounded-3xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 ease-out origin-bottom">
            <div className="flex items-center justify-between p-6 border-b border-border dark:border-dark-border">
              <h2 className="text-2xl font-title text-slate dark:text-dark-slate animate-in fade-in duration-300 delay-100">Tasks</h2>
              <button 
                onClick={() => setExpandedModal(null)}
                className="p-2 hover:bg-bg-soft dark:hover:bg-dark-border rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-90 active:scale-95"
              >
                <X size={24} className="text-slate dark:text-dark-slate" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden animate-in fade-in duration-400 delay-150">
              <Todo />
            </div>
          </div>
        </div>
      )}

      {/* Expanded Modal for Notes */}
      {expandedModal === 'notes' && (
        <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-dark-card rounded-3xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 ease-out origin-bottom">
            <div className="flex items-center justify-between p-6 border-b border-border dark:border-dark-border">
              <h2 className="text-2xl font-title text-slate dark:text-dark-slate animate-in fade-in duration-300 delay-100">Notes</h2>
              <button 
                onClick={() => setExpandedModal(null)}
                className="p-2 hover:bg-bg-soft dark:hover:bg-dark-border rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-90 active:scale-95"
              >
                <X size={24} className="text-slate dark:text-dark-slate" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden animate-in fade-in duration-400 delay-150">
              <Notes />
            </div>
          </div>
        </div>
      )}

      {/* Expanded Modal for Pomodoro */}
      {expandedModal === 'pomodoro' && (
        <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-dark-card rounded-3xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 ease-out origin-bottom">
            <div className="flex items-center justify-between p-6 border-b border-border dark:border-dark-border">
              <h2 className="text-2xl font-title text-slate dark:text-dark-slate animate-in fade-in duration-300 delay-100">Pomodoro Timer</h2>
              <button 
                onClick={() => setExpandedModal(null)}
                className="p-2 hover:bg-bg-soft dark:hover:bg-dark-border rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-90 active:scale-95"
              >
                <X size={24} className="text-slate dark:text-dark-slate" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden animate-in fade-in duration-400 delay-150">
              <Pomodoro />
            </div>
          </div>
        </div>
      )}

      {/* Expanded Modal for AI Assistant with morphing animation */}
      {expandedModal === 'chatbot' && (
        <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-dark-card rounded-3xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 ease-out origin-bottom">
            <div className="flex items-center justify-between p-6 border-b border-border dark:border-dark-border">
              <h2 className="text-2xl font-title text-slate dark:text-dark-slate animate-in fade-in duration-300 delay-100">AI Assistant</h2>
              <button 
                onClick={() => setExpandedModal(null)}
                className="p-2 hover:bg-bg-soft dark:hover:bg-dark-border rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-90 active:scale-95"
              >
                <X size={24} className="text-slate dark:text-dark-slate" />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden animate-in fade-in duration-400 delay-150">
              <Chatbot />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
