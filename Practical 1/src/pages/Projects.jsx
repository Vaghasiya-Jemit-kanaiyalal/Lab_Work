import { useState, useEffect, useCallback } from 'react'

const GITHUB_USERNAME = 'Vaghasiya-Jemit-kanaiyalal'

function getLanguageClass(language) {
  if (!language) return ''
  const lang = language.toLowerCase()
  if (lang.includes('script') || lang === 'js' || lang === 'ts') return 'tech-js'
  if (lang.includes('python')) return 'tech-python'
  if (lang.includes('c++') || lang.includes('cpp') || lang.includes('c#')) return 'tech-cpp'
  if (lang.includes('html') || lang.includes('css')) return 'tech-html'
  return ''
}

function Projects() {
  const [repos, setRepos] = useState([])
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
          throw new Error('GitHub API rate limit exceeded. Please try again shortly.')
        } else {
          throw new Error(`Failed to fetch repositories (HTTP status ${response.status}).`)
        }
      }

      const data = await response.json()
      setRepos(data)
    } catch (err) {
      setError(err.message || 'An error occurred while loading projects from GitHub.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    async function initialLoad() {
      try {
        const response = await fetch(
          `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`
        )
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`GitHub user "${GITHUB_USERNAME}" not found.`)
          } else if (response.status === 403) {
            throw new Error('GitHub API rate limit exceeded. Please try again shortly.')
          } else {
            throw new Error(`Failed to fetch repositories (HTTP status ${response.status}).`)
          }
        }
        const data = await response.json()
        if (!ignore) {
          setRepos(data)
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'An error occurred while loading projects from GitHub.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    initialLoad()
    return () => {
      ignore = true
    }
  }, [])

  // Filter repos based on search query
  const filteredRepos = repos.filter((repo) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    const nameMatch = repo.name?.toLowerCase().includes(q)
    const descMatch = repo.description?.toLowerCase().includes(q)
    const langMatch = repo.language?.toLowerCase().includes(q)
    return nameMatch || descMatch || langMatch
  })

  return (
    <div className="projects-page-container">
      {/* Header section with title and search */}
      <div className="projects-header-box">
        <div className="page-header-wrapper" style={{ marginBottom: '1.25rem' }}>
          <span className="section-label">GitHub Repositories</span>
          <h1 className="page-main-heading">Featured Projects</h1>
          <p className="page-lead-text">
            Live projects dynamically fetched from GitHub (@{GITHUB_USERNAME}). Search by project name, description, or technology.
          </p>
        </div>

        {/* Search input with clear button */}
        <div className="search-bar-wrapper">
          <span className="search-icon-symbol">🔍</span>
          <input
            type="text"
            className="search-text-input"
            placeholder="Search projects by name, description, or language (e.g. Python, React)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-action-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
              aria-label="Clear search query"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Loading Effect State */}
      {loading && (
        <div className="projects-loading-state">
          <div className="loading-spinner-ring" />
          <p className="projects-loading-text">Fetching repositories directly from GitHub...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="projects-error-banner">
          <span className="error-icon-symbol">⚠️</span>
          <div className="error-text-content">
            <p className="error-main-msg">{error}</p>
            <button type="button" onClick={fetchRepos} className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem' }}>
              🔄 Retry Fetching
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredRepos.length === 0 && (
        <div className="projects-empty-state">
          <span className="empty-icon-symbol">📂</span>
          <h3 className="empty-state-title">No repositories found</h3>
          <p className="empty-state-desc">
            No projects matched "{searchQuery}". Try searching with another keyword or clear the search.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setSearchQuery('')}
            style={{ marginTop: '0.75rem' }}
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && !error && filteredRepos.length > 0 && (
        <div className="github-projects-grid">
          {filteredRepos.map((repo) => {
            const langClass = getLanguageClass(repo.language)
            const cleanName = repo.name.replace(/-/g, ' ').replace(/_/g, ' ')

            return (
              <div key={repo.id} className="github-repo-card">
                <div className="repo-card-top">
                  <div className="repo-folder-icon">📁</div>
                  <div className="repo-stats-group">
                    <span className="repo-stat-badge" title="Stars">
                      ⭐ {repo.stargazers_count}
                    </span>
                    <span className="repo-stat-badge" title="Forks">
                      🍴 {repo.forks_count}
                    </span>
                  </div>
                </div>

                <h2 className="repo-project-name">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="repo-title-link"
                  >
                    {cleanName}
                  </a>
                </h2>

                <p className="repo-description-text">
                  {repo.description || 'No description provided for this GitHub repository.'}
                </p>

                <div className="repo-card-bottom">
                  <span className={`repo-language-badge ${langClass}`}>
                    {repo.language || 'Code'}
                  </span>

                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-accent btn-sm"
                  >
                    <span>View on GitHub</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Projects
