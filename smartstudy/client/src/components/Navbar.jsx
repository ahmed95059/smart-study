import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { Moon, Sun } from 'lucide-react'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/#features' },
  { label: 'About', href: '/#about' },
]

export default function Navbar(){
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggle } = useTheme()

  if(location.pathname.startsWith('/dashboard')) return null

  return (
    <header className="bg-transparent">
      <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-2xl font-title text-slate">
          <span className="h-9 w-9 rounded-2xl bg-primary text-white flex items-center justify-center font-bold">S</span>
          SmartStudy
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-label text-muted">
          {navLinks.map(link => (
            <a key={link.label} href={link.href} className="hover:text-primary transition-colors">{link.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-primary hidden sm:inline-flex">Dashboard</Link>
              <button className="btn btn-accent" onClick={()=>{ logout(); navigate('/'); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-muted hover:text-primary">Login</Link>
              <Link to="/signup" className="btn btn-primary">Get Started</Link>
            </>
          )}
          <button
            aria-label="Toggle theme"
            className="btn border border-border flex items-center gap-2"
            onClick={toggle}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}
            <span className="text-xs">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
