import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Navbar from './components/Navbar.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
export default function App(){ return (
  <ThemeProvider>
    <AuthProvider>
      <div className="min-h-screen">
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/signup" element={<Signup/>}/>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
        </Routes>
      </div>
    </AuthProvider>
  </ThemeProvider>
)}