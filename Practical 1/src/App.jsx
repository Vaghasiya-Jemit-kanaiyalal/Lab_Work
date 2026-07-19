import Header from './components/Header'
import About from './components/About'
import Skills from './components/Skills'
import Footer from './components/Footer'

function App() {
  const portfolio = {
    name: 'Jemit Vaghasiya',
    role: 'Full Stack AI Developer',
    bio: 'I\'m Jemit Vaghasiya, a Computer Science Engineering student passionate about full-stack web development, AI, and open-source contributions.',
    education: 'B.Tech in Computer Science, Graduation: 2028',
    skills: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Vite', 'Git','node.js', 'Express.js','Data Analusis', 'Machine Learning', 'Python', 'C++'],
  }

  const currentYear = new Date().getFullYear()

  return (
    <div>
      <Header name={portfolio.name} role={portfolio.role} />
      <main>
        <About bio={portfolio.bio} education={portfolio.education} />
        <Skills skills={portfolio.skills} />
      </main>
      <Footer name={portfolio.name} year={currentYear} />
    </div>
  )
}

export default App
