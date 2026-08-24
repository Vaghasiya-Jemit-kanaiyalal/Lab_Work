import React from 'react'

function Contact() {
  const emailPlaceholder = 'jemitvaghasiya07@gmail.com'
  const linkedinPlaceholder = 'https://www.linkedin.com/in/jemitvaghasiya/'
  const messagePlaceholder = 'https://jemitportfolio.netlify.app/contact'

  const openLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="contact-info">
      <h3>Contact Me</h3>

      <div className="contact-buttons">
        <button
          type="button"
          className="btn email-btn"
          onClick={() => openLink(`mailto:${emailPlaceholder}`)}
        >
          Email me
        </button>

        <button
          type="button"
          className="btn linkedin-btn"
          onClick={() => openLink(linkedinPlaceholder)}
        >
          LinkedIn
        </button>

        <button
          type="button"
          className="btn message-btn"
          onClick={() => openLink(messagePlaceholder)}
        >
          Message me
        </button>
      </div>
    </div>
  )
}

export default Contact
