import { useEffect, useRef, useState } from 'react'
import { Play, RotateCcw, Timer } from 'lucide-react'

const initialStats = () => {
  try{
    return JSON.parse(localStorage.getItem('pomodoroStats')) || { sessions: 0, focusMinutes: 0 }
  }catch{
    return { sessions: 0, focusMinutes: 0 }
  }
}

const DEFAULT_DURATION = 25 * 60

export default function Pomodoro(){
  const [seconds, setSeconds] = useState(DEFAULT_DURATION)
  const [running, setRunning] = useState(false)
  const [stats, setStats] = useState(initialStats)
  const intervalRef = useRef(null)
  const sessionLengthRef = useRef(DEFAULT_DURATION)

  const persistStats = (next) => {
    localStorage.setItem('pomodoroStats', JSON.stringify(next))
    window.dispatchEvent(new CustomEvent('pomodoro:update', { detail: next }))
  }

  const handleSessionComplete = () => {
    setRunning(false)
    const minutes = Math.round(sessionLengthRef.current / 60)
    setStats(s => {
      const updated = { sessions: s.sessions + 1, focusMinutes: s.focusMinutes + minutes }
      persistStats(updated)
      return updated
    })
    sessionLengthRef.current = DEFAULT_DURATION
    setSeconds(DEFAULT_DURATION)
  }

  useEffect(() => {
    if(!running) return
    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
        if(prev <= 1){
          clearInterval(intervalRef.current)
          handleSessionComplete()
          return DEFAULT_DURATION
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running])

  useEffect(() => {
    const handler = (event) => {
      const { action, durationSeconds } = event.detail || {}
      if(action === 'start'){
        const target = durationSeconds || DEFAULT_DURATION
        sessionLengthRef.current = target
        setSeconds(target)
        setRunning(true)
      }
      if(action === 'stop'){
        setRunning(false)
      }
      if(action === 'reset'){
        reset()
      }
    }
    window.addEventListener('pomodoro:command', handler)
    return () => window.removeEventListener('pomodoro:command', handler)
  }, [])

  const reset = () => {
    setRunning(false)
    sessionLengthRef.current = DEFAULT_DURATION
    setSeconds(DEFAULT_DURATION)
  }

  const toggle = () => {
    if(running){
      setRunning(false)
    }else{
      sessionLengthRef.current = seconds || DEFAULT_DURATION
      setRunning(true)
    }
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Timer className="text-accent" size={20}/>
        </div>
        <h3 className="text-lg font-title text-slate">Pomodoro Timer</h3>
      </div>

      <div className="text-center space-y-6 py-8">
        <div className="text-7xl font-bold text-primary tracking-tight">{mm}:{ss}</div>
        <p className="text-sm text-muted">Focus Time</p>
        
        <div className="flex justify-center gap-3">
          <button 
            className="btn bg-accent hover:bg-accent/90 text-white flex items-center gap-2 px-8 py-3 rounded-xl font-semibold shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-all" 
            onClick={toggle}
          >
            <Play size={18}/> {running ? 'Pause' : 'Start'}
          </button>
          <button 
            className="btn bg-white dark:bg-[#182339] border border-border dark:border-[#1F2A44] hover:bg-gray-50 dark:hover:bg-[#1F2A44] text-slate dark:text-[#E6EAF4] flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all" 
            onClick={reset}
          >
            <RotateCcw size={18}/> Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border dark:border-[#1F2A44]">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate">{stats.sessions}</p>
          <p className="text-xs text-muted mt-1">Sessions Today</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-slate">{Math.floor(stats.focusMinutes / 60)}h {stats.focusMinutes % 60}m</p>
          <p className="text-xs text-muted mt-1">Total Focus</p>
        </div>
      </div>
    </div>
  )
}
