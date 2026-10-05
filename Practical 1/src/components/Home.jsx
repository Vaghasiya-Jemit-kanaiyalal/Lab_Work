import { useState } from 'react'
import Skills from './Skills'

function Home({ bio, education, skills }) {
  const [showDetails, setShowDetails] = useState(false)

  const toggleDetails = () => {
    setShowDetails((prev) => !prev)
  }

  return (
    <div className="home-container">
      <section className="about-section">
        <h2 className="section-heading">About Me</h2>
        <div className="bio-card">
          <p className="bio-text">{bio}</p>
        </div>

        <div className="education-box">
          <h3 className="education-header-title">
            <span>🎓</span> Education
          </h3>
          <p className="education-main">{education}</p>

          <button onClick={toggleDetails} className="btn-toggle">
            <span>{showDetails ? '▼' : '▶'}</span>
            <span>{showDetails ? 'Hide Academic Details' : 'Show Academic Details'}</span>
          </button>

          {showDetails && (
            <div className="education-details">
              <ul>
                <li>
                  <strong>Current Semester:</strong> 5<sup>th</sup> Semester
                </li>
                <li>
                  <strong>Current CGPA:</strong> 8.0 / 10.0
                </li>
                <li>
                  <strong>Core Coursework:</strong> Data Structures & Algorithms, DBMS, C++, Advanced Web Technologies, Machine Learning, Python
                </li>
              </ul>
            </div>
          )}
        </div>
      </section>

      <Skills skills={skills} />
    </div>
  )
}

export default Home
