import { Link } from 'react-router-dom'
import Hero from '../components/Hero.jsx'
import Footer from '../components/Footer.jsx'

const features = [
  { title:'Smart Calendar', desc:'Organize lectures, assignments, and exams with one collaborative agenda.', icon:'📅' },
  { title:'To-Do Lists', desc:'Create, categorize, and prioritize tasks — then celebrate every checkmark.', icon:'✅' },
  { title:'Pomodoro Timer', desc:'Stay focused with guided 25/5 minute sessions and streak tracking.', icon:'⏱️' },
  { title:'Quick Notes', desc:'Capture lecture ideas, reminders, and study insights instantly.', icon:'📝' },
  { title:'AI Assistant', desc:'Ask natural questions and let Groq plan, reschedule, or summarize for you.', icon:'🤖' },
  { title:'Themes & Customisation', desc:'Switch layouts and personalize dashboards to fit your study mood.', icon:'🎨' },
]

export default function Home(){
  return (
    <main className="pb-16">
      <Hero/>

      <section id="features" className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10 space-y-3">
          <p className="uppercase tracking-[0.35em] text-xs text-muted">Tools</p>
          <h2 className="text-3xl md:text-4xl font-title text-slate">Everything You Need to Stay Productive</h2>
          <p className="text-muted max-w-2xl mx-auto">
            Powerful features built for students: manage time, focus on deep work, and stay on top of every class.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((item)=>(
            <div key={item.title} className="card h-full">
              <div className="w-12 h-12 rounded-2xl bg-bg-soft flex items-center justify-center text-2xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-title mb-2">{item.title}</h3>
              <p className="text-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4">
        <div className="card bg-gradient-to-r from-bg-soft to-bg-soft dark:from-[#0B1220] dark:to-[#121A2B] flex flex-col md:flex-row items-center gap-8 p-10">
          <div className="flex-1 space-y-4">
            <p className="uppercase text-xs tracking-[0.35em] text-muted">Start now</p>
            <h3 className="text-3xl font-title text-slate">Start Your Journey Today</h3>
            <p className="text-muted">Create an account in minutes and unlock calendars, tasks, notes, Pomodoro, and AI scheduling in one place.</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup" className="btn btn-primary">Create Account</Link>
              <Link to="/login" className="btn border border-border text-slate dark:text-[#E6EAF4]">Log In</Link>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4 text-center">
            <div className="glass rounded-2xl p-5">
              <p className="text-muted text-sm">Study Sessions</p>
              <p className="text-3xl font-title text-primary">3h 20m</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <p className="text-muted text-sm">Assignments Done</p>
              <p className="text-3xl font-title text-accent">24</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <p className="text-muted text-sm">Next Event</p>
              <p className="text-3xl font-title text-slate">Math Quiz</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <p className="text-muted text-sm">AI Suggestions</p>
              <p className="text-3xl font-title text-primary">+5</p>
            </div>
          </div>
        </div>
      </section>

      <Footer/>
    </main>
  )
}
