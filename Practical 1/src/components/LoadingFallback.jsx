function LoadingFallback({ message = 'Loading component chunk...' }) {
  return (
    <div className="lazy-loading-fallback">
      <div className="fallback-card">
        <div className="fallback-spinner"></div>
        <div className="fallback-text-group">
          <p className="fallback-title">Loading Page Chunk</p>
          <p className="fallback-subtitle">{message}</p>
        </div>
        <div className="fallback-progress-bar">
          <div className="fallback-progress-indicator"></div>
        </div>
      </div>
    </div>
  )
}

export default LoadingFallback
