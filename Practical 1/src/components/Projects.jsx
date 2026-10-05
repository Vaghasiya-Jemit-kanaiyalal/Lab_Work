import { useState, useEffect, useCallback } from 'react'

const GITHUB_USERNAME = 'Vaghasiya-Jemit-kanaiyalal'

function Spinner() {
  return (
    <div className="spinner-container">
      <div className="loading-spinner"></div>
      <p>Fetching repositories from GitHub...</p>
    </div>
  )
}

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="repo-error-message">
      <p>⚠️ Error: {message}</p>
      <button onClick={onRetry} className="retry-btn">
        Retry
      </button>
    </div>
  )
}

function getLanguageClass(language) {
  if (!language) return ''
  const lang = language.toLowerCase()
  if (lang.includes('script') || lang === 'js' || lang === 'ts') return 'js'
  if (lang.includes('python')) return 'python'
  if (lang.includes('c++') || lang.includes('cpp') || lang.includes('c#')) return 'cpp'
  if (lang.includes('html') || lang.includes('css')) return 'html'
  return ''
}

function RepoList({ data }) {
  return (
    <div className="projects-grid">
      {data.map((repo) => {
        const langClass = getLanguageClass(repo.language)
        return (
          <div key={repo.id} className="project-card">
            <div className="project-header">
              <h3>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-title-link"
                >
                  {repo.name.replace(/-/g, ' ').replace(/_/g, ' ')}
                </a>
              </h3>
            </div>

            <p className="project-desc">
              {repo.description || 'No description provided for this repository.'}
            </p>

            <div className="project-meta">
              {repo.language ? (
                <span className={`tech-badge ${langClass}`}>{repo.language}</span>
              ) : (
                <span className="tech-badge">Code</span>
              )}
              <div className="repo-stats">
                <span title="Stars">⭐ {repo.stargazers_count}</span>
                <span title="Forks">🍴 {repo.forks_count}</span>
              </div>
            </div>

            <div className="project-footer">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="view-repo-btn"
              >
                View on GitHub →
              </a>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Projects() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchRepos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`
      )

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`GitHub user "${GITHUB_USERNAME}" not found.`)
        } else if (response.status === 403) {
          throw new Error('API rate limit exceeded. Please try again later.')
        } else {
          throw new Error(`Failed to fetch repositories (Status ${response.status}).`)
        }
      }

      const repos = await response.json()
      setData(repos)
    } catch (err) {
      setError(err.message || 'An error occurred while fetching repositories.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const response = await fetch(
          `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`
        )
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`GitHub user "${GITHUB_USERNAME}" not found.`)
          } else if (response.status === 403) {
            throw new Error('API rate limit exceeded. Please try again later.')
          } else {
            throw new Error(`Failed to fetch repositories (Status ${response.status}).`)
          }
        }
        const repos = await response.json()
        if (!ignore) {
          setData(repos)
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'An error occurred while fetching repositories.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [])

  const filteredData = data.filter((repo) => {
    const query = searchQuery.toLowerCase()
    const nameMatch = repo.name?.toLowerCase().includes(query)
    const descMatch = repo.description?.toLowerCase().includes(query)
    const langMatch = repo.language?.toLowerCase().includes(query)
    return nameMatch || descMatch || langMatch
  })

  return (
    <div className="projects-container">
      <h2 className="section-heading">Featured Projects & Repositories</h2>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search projects by name, description, or tech..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="search-clear-btn"
            title="Clear search"
          >
            &times;
          </button>
        )}
      </div>

      {loading && <Spinner />}
      {!loading && error && <ErrorMessage message={error} onRetry={fetchRepos} />}
      {!loading && !error && <RepoList data={filteredData} />}

      {!loading && !error && filteredData.length === 0 && (
        <div className="no-repos-found">
          <p>No repositories found matching "{searchQuery}".</p>
        </div>
      )}
    </div>
  )
}

export default Projects
