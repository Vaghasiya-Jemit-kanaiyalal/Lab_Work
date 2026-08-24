import { useState } from 'react'
import Skills from './Skills'

function Home({ bio, education, skills }) {
  const [showDetails, setShowDetails] = useState(false)

  const toggleDetails = () => {
    setShowDetails(prev => !prev)
  }

  return (
    <div className="home-container">
      <section className="about-section">
        <h2>About Me</h2>
        <p className="bio-text">{bio}</p>
        
        <div className="education-box">
          <h3>Education</h3>
          <p className="education-main">{education}</p>
          
          <button onClick={toggleDetails} className="btn-toggle">
            {showDetails ? 'Hide Education Details' : 'Show Education Details'}
          </button>

          {showDetails && (
            <div className="education-details">
              <ul>
                <li><strong>Current Semester:</strong> 5<sup>th</sup> Semester</li>
                <li><strong>Current CGPA:</strong> 8.0</li>
                <li><strong>Key Subjects:</strong> DSA, Database Management, C++, Web Technologies,Python</li>
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
