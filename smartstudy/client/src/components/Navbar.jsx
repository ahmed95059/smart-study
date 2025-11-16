import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ThemeToggle from './ThemeToggle.jsx'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/#features' },
  { label: 'About', href: '/#about' },
]

export default function Navbar(){
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if(location.pathname.startsWith('/dashboard')) return null

  return (
    <header className="bg-transparent dark:bg-opacity-50">
      <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-2xl font-title text-slate dark:text-dark-slate">
          <span className="h-9 w-9 rounded-2xl bg-primary text-white flex items-center justify-center font-bold">S</span>
          SmartStudy
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-label text-muted dark:text-dark-muted">
          {navLinks.map(link => (
            <a key={link.label} href={link.href} className="hover:text-primary dark:hover:text-primary transition-colors">{link.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-primary hidden sm:inline-flex">Dashboard</Link>
              <button className="btn btn-accent" onClick={()=>{ logout(); navigate('/'); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-muted dark:text-dark-muted hover:text-primary dark:hover:text-primary">Login</Link>
              <Link to="/signup" className="btn btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
