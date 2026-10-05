function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="footer-inner-content">
        <p className="footer-copy-text">
          &copy; {currentYear} Jemit Vaghasiya. All Rights Reserved.
        </p>

        <div className="footer-social-links">
          <a
            href="https://github.com/Vaghasiya-Jemit-kanaiyalal"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-btn"
            title="GitHub Profile"
            aria-label="GitHub"
          >
            🔗
          </a>
          <a
            href="https://www.linkedin.com/in/jemitvaghasiya/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-btn"
            title="LinkedIn Profile"
            aria-label="LinkedIn"
          >
            💼
          </a>
          <a
            href="mailto:jemitvaghasiya07@gmail.com"
            className="footer-social-btn"
            title="Send Email"
            aria-label="Email"
          >
            📧
          </a>
          <a
            href="https://x.com/Jemit_Vaghasiya?t=oEFa4aZnasNAfRZT4tLyRQ&s=09"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-btn"
            title="Twitter / X Profile"
            aria-label="Twitter"
          >
            🐦
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
