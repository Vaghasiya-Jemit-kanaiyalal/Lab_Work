function Skills({ skills }) {
  return (
    <section>
      <h2>Skills</h2>
    <ul>
      {skills.map((skill, index) => (
        <li key={index} className="skill-badge">{skill}</li>
      ))}
    </ul>
    </section>
  )
}

export default Skills
