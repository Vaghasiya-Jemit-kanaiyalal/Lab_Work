import { Routes, Route, NavLink } from 'react-router-dom'
import Header from './components/Header'
import Home from './components/Home'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'

function App() {
  const portfolio = {
    name: 'Jemit Vaghasiya',
    role: 'Full Stack AI Developer',
    bio: "I'm Jemit Vaghasiya, a Computer Science Engineering student passionate about full-stack web development, AI, and open-source contributions.",
    education: 'B.Tech in Computer Science, Graduation: 2028',
    skills: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Vite', 'Git', 'Node.js', 'Express.js', 'Data Analysis', 'Machine Learning', 'Python', 'C++'],
  }

  const currentYear = new Date().getFullYear()

  return (
    <div className="app-shell">
      <Header name={portfolio.name} role={portfolio.role} />
      
      <nav className="navbar">
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Home
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Projects
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Contact
          </NavLink>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home bio={portfolio.bio} education={portfolio.education} skills={portfolio.skills} />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>

      <Footer year={currentYear} />
    </div>
  )
}

export default App

