function Skills({ skills }) {
  const getSkillIcon = (skillName) => {
    const name = skillName.toLowerCase()
    if (name.includes('html')) return '⚡'
    if (name.includes('css')) return '🎨'
    if (name.includes('js') || name.includes('javascript')) return '🟨'
    if (name.includes('react')) return '⚛️'
    if (name.includes('vite')) return '⚡'
    if (name.includes('node')) return '🟩'
    if (name.includes('express')) return '🚀'
    if (name.includes('python')) return '🐍'
    if (name.includes('machine') || name.includes('ai')) return '🤖'
    if (name.includes('data')) return '📊'
    if (name.includes('c++')) return '💻'
    if (name.includes('git')) return '📦'
    return '✨'
  }

  return (
    <section className="skills-section">
      <h2 className="section-heading">Tech Stack & Skills</h2>
      <ul className="skills-grid">
        {skills.map((skill, index) => (
          <li key={index} className="skill-badge">
            <span className="skill-icon">{getSkillIcon(skill)}</span>
            <span>{skill}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Skills
