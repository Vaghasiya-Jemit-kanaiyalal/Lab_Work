import { useState } from 'react'

function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormData({ name: '', email: '', message: '' })
    }, 600)
  }

  const talkTopics = [
    {
      icon: '💻',
      title: 'Web Development',
      desc: 'Building responsive, scalable web applications and clean UI architectures.',
    },
    {
      icon: '🤝',
      title: 'Collaboration',
      desc: 'Partnering on open-source initiatives and innovative engineering ideas.',
    },
    {
      icon: '🎯',
      title: 'Internship Roles',
      desc: 'Exploring software engineering, frontend/backend, or data analyst positions.',
    },
    {
      icon: '☕',
      title: 'Friendly Chat',
      desc: 'Always glad to discuss new technologies, industry trends, or connect.',
    },
  ]

  return (
    <div>
      <div className="page-header-wrapper">
        <span className="section-label">Reach Out</span>
        <h1 className="page-main-heading">Let's Connect</h1>
        <p className="page-lead-text">
          Have an opportunity, a project proposal, or just want to discuss technology? Send a message below.
        </p>
      </div>

      <div className="contact-layout-grid">
        {/* Left Column: Contact Form */}
        <div className="contact-form-panel">
          <div className="form-header-row">
            <h2 className="form-panel-title">Send a Message</h2>
            <p className="form-panel-subtitle">
              Fill out this form and I will get back to you promptly.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group-item">
              <label htmlFor="contact-name">Your Full Name</label>
              <input
                type="text"
                id="contact-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Alex Smith"
                className="form-input-control"
                required
              />
            </div>

            <div className="form-group-item">
              <label htmlFor="contact-email">Your Email Address</label>
              <input
                type="email"
                id="contact-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. alex@example.com"
                className="form-input-control"
                required
              />
            </div>

            <div className="form-group-item">
              <label htmlFor="contact-message">Your Message</label>
              <textarea
                id="contact-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell me about your project or inquiry..."
                className="form-input-control"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={isSubmitting}
            >
              <span>📨</span>
              <span>{isSubmitting ? 'Sending Message...' : 'Send Message'}</span>
            </button>

            {isSubmitted && (
              <div className="form-alert form-alert-success">
                <span>✓</span>
                <span>Thank you! Your message has been received. I will respond soon.</span>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Talk Topics & Direct Channels */}
        <div className="contact-sidebar-panel">
          <div className="sidebar-box">
            <h3 className="sidebar-heading">Let's Talk About</h3>
            <div className="talk-about-grid">
              {talkTopics.map((topic, index) => (
                <div key={index} className="talk-mini-card">
                  <span className="talk-mini-icon">{topic.icon}</span>
                  <h4 className="talk-mini-title">{topic.title}</h4>
                  <p className="talk-mini-desc">{topic.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-box">
            <h3 className="sidebar-heading">Direct Channels</h3>
            <div className="direct-channels-list">
              <a
                href="mailto:jemitvaghasiya07@gmail.com"
                className="channel-link-item"
              >
                <span>📧</span>
                <span>jemitvaghasiya07@gmail.com</span>
              </a>

              <a
                href="https://www.linkedin.com/in/jemitvaghasiya/"
                target="_blank"
                rel="noopener noreferrer"
                className="channel-link-item"
              >
                <span>💼</span>
                <span>LinkedIn / jemitvaghasiya</span>
              </a>

              <a
                href="https://github.com/Vaghasiya-Jemit-kanaiyalal"
                target="_blank"
                rel="noopener noreferrer"
                className="channel-link-item"
              >
                <span>🔗</span>
                <span>GitHub / Vaghasiya-Jemit</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
