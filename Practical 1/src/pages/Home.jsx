import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import profileImg from '../assets/profile.jpg'

const ROLES = [
  'Aspiring Data Analyst 📊',
  'Backend Developer 🧠',
  'AI Enthusiast 🤖',
  'Problem Solver 🔍',
  'Building Data-Driven Solutions 📈',
  'Open for Internship 🚀',
]

function Home() {
  const [roleIndex, setRoleIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  // Typewriter effect
  useEffect(() => {
    const current = ROLES[roleIndex]
    const speed = isDeleting ? 35 : 80

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(current.substring(0, displayText.length + 1))
        if (displayText.length + 1 === current.length) {
          setTimeout(() => setIsDeleting(true), 1600)
        }
      } else {
        setDisplayText(current.substring(0, displayText.length - 1))
        if (displayText.length - 1 === 0) {
          setIsDeleting(false)
          setRoleIndex((prev) => (prev + 1) % ROLES.length)
        }
      }
    }, speed)

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, roleIndex])

  return (
    <div className="home-hero-container">
      {/* Left Column: Introductions, Bio & Actions */}
      <div className="hero-content">
        <div className="status-badge">
          <span className="status-pulse-dot" />
          <span>Available for Projects & Opportunities</span>
        </div>

        <h1 className="hero-title">
          Hi, I'm <span className="highlight-name">Jemit</span>
        </h1>

        <div className="typewriter-container">
          <span className="typewriter-text">{displayText}</span>
          <span className="typewriter-cursor" />
        </div>

        <p className="hero-bio">
          I'm a passionate Computer Science student and software developer focused on building robust full-stack applications and exploring Data Analytics. I enjoy transforming complex problems into clean, practical solutions with modern web technologies and intelligent data processing.
        </p>

        <div className="hero-actions">
          <a
            href="/Jemit_resume.pdf"
            download="Jemit_resume.pdf"
            className="btn btn-primary"
          >
            <span>📥</span>
            <span>Download Resume</span>
          </a>

          <NavLink to="/projects" className="btn btn-secondary">
            <span>View GitHub Projects</span>
            <span>→</span>
          </NavLink>

          <NavLink to="/contact" className="btn btn-outline-accent">
            <span>Contact Me</span>
          </NavLink>
        </div>

        <div className="hero-social-row">
          <a
            href="https://github.com/Vaghasiya-Jemit-kanaiyalal"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-social-icon"
            title="GitHub Profile"
            aria-label="GitHub"
          >
            🔗
          </a>
          <a
            href="https://www.linkedin.com/in/jemitvaghasiya/"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-social-icon"
            title="LinkedIn Profile"
            aria-label="LinkedIn"
          >
            💼
          </a>
          <a
            href="mailto:jemitvaghasiya07@gmail.com"
            className="hero-social-icon"
            title="Send Email"
            aria-label="Email"
          >
            📧
          </a>
          <a
            href="https://x.com/Jemit_Vaghasiya?t=oEFa4aZnasNAfRZT4tLyRQ&s=09"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-social-icon"
            title="Twitter / X Profile"
            aria-label="Twitter"
          >
            🐦
          </a>
        </div>
      </div>

      {/* Right Column: User's Profile Photo */}
      <div className="hero-photo-column">
        <div className="hero-photo-wrapper">
          <img
            src={profileImg}
            alt="Jemit Vaghasiya"
            className="hero-photo-img"
          />
        </div>
      </div>
    </div>
  )
}

export default Home
