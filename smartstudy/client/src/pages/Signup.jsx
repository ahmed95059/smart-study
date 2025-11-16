import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const Aside = () => (
  <aside className="bg-gradient-to-b from-primary via-plum to-accent text-white p-10 flex flex-col justify-between">
    <div>
      <p className="text-sm uppercase tracking-[0.4em] text-white/70">Start today</p>
      <h2 className="text-3xl font-title leading-snug mt-3">Achieve Your Academic Goals</h2>
      <p className="text-white/80 mt-3">Smart task management, integrated calendar, Pomodoro timer, and AI-powered assistant — all in one dashboard.</p>
      <ul className="mt-6 space-y-3 text-white/90 text-sm">
        <li>• Smart task management</li>
        <li>• Integrated calendar & notes</li>
        <li>• Pomodoro technique timer</li>
        <li>• AI-powered assistance</li>
      </ul>
    </div>
    <div className="bg-white/10 rounded-2xl p-4 text-sm leading-relaxed">
      “This platform completely changed how I manage my studies. I’m more organized and less stressed.”
      <div className="mt-3 font-semibold">Sarah M. — Computer Science</div>
    </div>
  </aside>
)

export default function Signup(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agree, setAgree] = useState(true)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    if(password !== confirm){
      alert('Passwords do not match')
      return
    }
    if(!agree){
      alert('Please accept terms to continue')
      return
    }
    const ok = await signup(name, email, password)
    if(ok) navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-card dark:bg-dark-card rounded-[32px] overflow-hidden shadow-soft dark:shadow-dark-soft border border-border dark:border-dark-border">
        <div className="p-10 md:p-14 space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-muted dark:text-dark-muted">Start your journey</p>
            <h1 className="text-3xl font-title text-slate dark:text-dark-slate mt-3">Create an account</h1>
            <p className="text-muted dark:text-dark-muted text-sm mt-2">Boost your productivity today.</p>
          </div>
          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate dark:text-dark-slate">Full Name</label>
              <input className="w-full border border-border dark:border-dark-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-dark-card dark:text-dark-slate" value={name} onChange={e=>setName(e.target.value)} placeholder="John Doe" required/>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate dark:text-dark-slate">Email Address</label>
              <input className="w-full border border-border dark:border-dark-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-dark-card dark:text-dark-slate" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@university.edu" required/>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate dark:text-dark-slate">Password</label>
              <input className="w-full border border-border dark:border-dark-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-dark-card dark:text-dark-slate" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters + number" required/>
              <p className="text-xs text-muted dark:text-dark-muted mt-1">Must be 6+ characters and contain at least 1 number</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate dark:text-dark-slate">Confirm Password</label>
              <input className="w-full border border-border dark:border-dark-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-dark-card dark:text-dark-slate" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Re-enter your password" required/>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted dark:text-dark-muted">
              <input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)} />
              I agree to the <span className="text-primary dark:text-dark-primary font-semibold">Terms & Conditions</span>
            </label>
            <button className="btn btn-primary w-full">Create Account</button>
          </form>
          <div className="text-center text-sm text-muted dark:text-dark-muted">
            Already have an account? <Link to="/login" className="text-primary dark:text-dark-primary font-semibold">Sign in</Link>
          </div>
        </div>
        <Aside/>
      </div>
    </div>
  )
}
