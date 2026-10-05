function Contact() {
  const emailPlaceholder = 'jemitvaghasiya07@gmail.com'
  const linkedinPlaceholder = 'https://www.linkedin.com/in/jemitvaghasiya/'
  const messagePlaceholder = 'https://jemitportfolio.netlify.app/contact'

  const openLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="contact-info">
      <h2 className="section-heading">Get In Touch</h2>
      <p className="contact-subtitle">
        Feel free to reach out for collaborations, project inquiries, or software engineering opportunities.
      </p>

      <div className="contact-buttons">
        <button
          type="button"
          className="btn email-btn"
          onClick={() => openLink(`mailto:${emailPlaceholder}`)}
        >
          <span>✉️</span>
          <span>Email Me</span>
        </button>

        <button
          type="button"
          className="btn linkedin-btn"
          onClick={() => openLink(linkedinPlaceholder)}
        >
          <span>💼</span>
          <span>LinkedIn</span>
        </button>

        <button
          type="button"
          className="btn message-btn"
          onClick={() => openLink(messagePlaceholder)}
        >
          <span>💬</span>
          <span>Message Me</span>
        </button>
      </div>
    </div>
  )
}

export default Contact
