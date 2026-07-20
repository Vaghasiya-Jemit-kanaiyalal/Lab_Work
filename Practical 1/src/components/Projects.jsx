function Projects() {
  const projectList = [
    {
      id: 1,
      title: 'Car dealership',
      description: 'Responsive Toyota car dealership website with 3D car model viewing and a connected database for managing cars, bookings, and customer enquiries.',
      tech: ['React', 'Node.js', 'MongoDB', 'CSS3']
    },
    {
      id: 2,
      title: 'DataForge',
      description: 'DataForge is an intelligent AutoML platform designed to simplify the complete machine learning workflow. The platform enables users to upload datasets, perform interactive preprocessing, and train multiple machine learning models with a single click through an intuitive UI. It automates tasks such as missing value handling, encoding, scaling, feature selection, and model training while still allowing workflow customization and preprocessing control. Built with a scalable microservice architecture using Redis and BullMQ, DataForge supports asynchronous task execution, workflow orchestration, and model performance analysis through detailed reports and evaluation metrics.',
      tech: ['Python', 'Machine Learning', 'Redis', 'Express.js']
    },
    {
      id: 3,
      title: 'AI Chat Assistant',
      description: 'An AI-powered scholarship recommendation platform that analyzes a student\'s profile to suggest the most suitable scholarships, eliminating the need to surf multiple websites and helping students save time while never missing financial opportunities ',
      tech: ['React', 'AI/ML', 'JavaScript', 'Node.js']
    }
  ]

  return (
    <div className="projects-container">
      <h2>My Projects</h2>
      <div className="projects-grid">
        {projectList.map((project) => (
          <div key={project.id} className="project-card">
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <div className="project-tech">
              {project.tech.map((t, idx) => (
                <span key={idx} className="tech-badge">{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Projects
