import React, { useState, useEffect } from 'react';
import './pixel-modal.css';
const getTodayString = () => new Date().toISOString().split('T')[0];

function App() {
  const [tasks, setTasks] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({ title: '', desc: '', priority: 'medium', date: getTodayString() });

  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.error('Error fetching tasks:', err));
  }, []);

  const moveTask = async (id, direction) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    let newStatus = task.status;
    if (task.status === 'in-progress' && direction === 'right') newStatus = 'pending';
    else if (task.status === 'pending' && direction === 'right') newStatus = 'completed';
    else if (task.status === 'pending' && direction === 'left') newStatus = 'in-progress';
    else if (task.status === 'completed' && direction === 'left') newStatus = 'pending';
    
    if (newStatus === task.status) return;

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(t => t.id === id ? updatedTask : t));
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleOpenAdd = () => {
    setNewTaskForm({ title: '', desc: '', priority: 'medium', date: getTodayString() });
    setIsAddOpen(true);
  };

  const handleAddTaskSubmit = async (e) => {
    e.preventDefault();
    if (!newTaskForm.title.trim() || !newTaskForm.desc.trim()) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTaskForm)
      });
      if (response.ok) {
        const createdTask = await response.json();
        setTasks([...tasks, createdTask]);
        setIsAddOpen(false);
      } else {
        console.error('Validation failed');
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const getTasksByStatus = (status) => tasks.filter(t => t.status === status);

  const renderTaskCard = (task) => (
    <div key={task.id} className="task-card">
      <div className="card-title">
        <input type="checkbox" checked={task.status === 'completed'} readOnly /> 
        <h4>{task.title}</h4>
        {task.bookmarked && <i className={`fa-solid fa-bookmark bookmark-${task.bookmarked}`}></i>}
      </div>
      {task.desc && <p className="card-desc">{task.desc}</p>}
      <div className="card-footer">
        <span className="date"><i className="fa-regular fa-calendar"></i> {task.date}</span>
        <span className={`priority ${task.priority}`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
        <div className="card-avatar">🧑🏻</div>
      </div>
      <div className="card-actions">
        {task.status !== 'in-progress' && (
          <button className="move-btn left" onClick={() => moveTask(task.id, 'left')} title="Move Left">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
        )}
        {task.status !== 'completed' && (
          <button className="move-btn right" onClick={() => moveTask(task.id, 'right')} title="Move Right">
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo-area">
            <div className="logo-icon">📋</div>
            <div className="logo-text">
              <h1>Taskorama</h1>
              <p>Plan it. Do it. Level up!</p>
            </div>
          </div>
          
          <nav className="side-nav">
            <a href="#" className="nav-item">
              <i className="fa-solid fa-house"></i> Home
            </a>
            <a href="#" className="nav-item active">
              <i className="fa-solid fa-clipboard-list"></i> My Tasks
              <i className="fa-solid fa-chevron-right arrow"></i>
            </a>
            <a href="#" className="nav-item">
              <i className="fa-regular fa-calendar"></i> Calendar
            </a>
            <a href="#" className="nav-item">
              <i className="fa-solid fa-gear"></i> Settings
            </a>
            <a href="#" className="nav-item">
              <i className="fa-regular fa-trash-can"></i> Trash
            </a>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-landscape">
            🏠 🌲 🌳
          </div>
          <div className="level-box">
            <div className="level-header">
              <span className="crown">👑</span> LEVEL 5
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill sidebar-fill"></div>
            </div>
            <div className="xp-text">320 / 500 XP</div>
            <div className="next-level">Next Level: 180 XP</div>
            <div className="motivate-text">Keep going, champ! 💪</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="top-header">
          <div className="header-left">
            <div className="avatar-large">📝</div>
            <div className="greeting">
              <h2>My Task</h2>
              <p>Let's crush your tasks today!</p>
            </div>
          </div>
          <div className="header-right">
            <div className="search-box">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input type="text" placeholder="Search tasks..." />
            </div>
            <button className="btn-filter" onClick={() => setIsSummaryOpen(true)}>
              <i className="fa-solid fa-chart-pie"></i> Task Summary
            </button>
            <button className="btn-filter" onClick={() => setIsFilterOpen(true)}>
              <i className="fa-solid fa-filter"></i> Filter <i className="fa-solid fa-chevron-down"></i>
            </button>
            <div className="notification">
              <i className="fa-regular fa-bell"></i>
              <span className="badge">3</span>
            </div>
            <div className="avatar-small">🧑🏻</div>
            <i className="fa-solid fa-chevron-down"></i>
          </div>
        </header>

        {/* Action Bar */}
        <div className="action-bar">
          <div className="tabs">
            <button className="tab active">All Tasks <span className="count">{tasks.length}</span></button>
            <button className="tab">In Progress <span className="count">{getTasksByStatus('in-progress').length}</span></button>
            <button className="tab">Pending <span className="count">{getTasksByStatus('pending').length}</span></button>
            <button className="tab">Completed <span className="count">{getTasksByStatus('completed').length}</span></button>
          </div>
          <div className="view-toggles">
            <button className="view-btn active"><i className="fa-solid fa-border-all"></i> Board View</button>
            <button className="view-btn"><i className="fa-solid fa-list-ul"></i> List View</button>
            <button className="btn-primary" onClick={handleOpenAdd}><i className="fa-solid fa-plus"></i> Add Task</button>
          </div>
        </div>

        {/* Content Body */}
        <div className="content-body">
          {/* Kanban Board - Now takes full width as right panel is removed */}
          <div className="kanban-board full-width">
            {/* Column 1 */}
            <div className="column in-progress-col glass">
              <div className="column-header">
                <span className="icon">⚔️</span> <h3>IN PROGRESS</h3> <span className="col-count">{getTasksByStatus('in-progress').length}</span>
                <button className="header-add-btn" onClick={handleOpenAdd} title="Add Task">
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>
              <div className="cards-container">
                {getTasksByStatus('in-progress').map(renderTaskCard)}
              </div>
            </div>

            {/* Column 2 */}
            <div className="column pending-col glass">
              <div className="column-header">
                <span className="icon">🛡️</span> <h3>PENDING</h3> <span className="col-count">{getTasksByStatus('pending').length}</span>
              </div>
              <div className="cards-container">
                {getTasksByStatus('pending').map(renderTaskCard)}
              </div>
            </div>

            {/* Column 3 */}
            <div className="column completed-col glass">
              <div className="column-header">
                <span className="icon">🚩</span> <h3>COMPLETED</h3> <span className="col-count">{getTasksByStatus('completed').length}</span>
              </div>
              <div className="cards-container">
                {getTasksByStatus('completed').map(renderTaskCard)}
              </div>
            </div>
          </div>
        </div>

        {/* Adventure Progress */}
        <footer className="adventure-progress">
          <div className="adv-left">
            <h3>YOUR ADVENTURE PROGRESS 🌲</h3>
            <p>Complete tasks and<br />move toward your goal!</p>
          </div>
          <div className="adv-middle">
            <div className="map-illustration">
              <span className="avatar-map">🧑🏻</span>
              <div className="map-path">
                <div className="sign">START</div>
                <div className="node active"></div>
                <div className="node active"></div>
                <div className="node active"></div>
                <div className="node"></div>
                <div className="node"></div>
                <div className="castle">🏰🚩</div>
              </div>
            </div>
            <div className="bottom-progress-container">
              <div className="progress-bar-bg bottom-bg">
                <div className="progress-bar-fill bottom-fill" style={{ width: '60%' }}></div>
              </div>
              <span className="progress-text">3 / 5 Tasks Done</span>
            </div>
          </div>
          <div className="adv-right">
            <div className="reward-box">
              <div className="chest">🧰</div>
              <div className="reward-info">
                <h4>NEXT REWARD</h4>
                <span className="xp-gain">⭐ +100 XP</span>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Modals */}
      {isFilterOpen && (
        <div className="modal-overlay" onClick={() => setIsFilterOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fa-solid fa-filter"></i> Filters</h3>
              <button className="close-btn" onClick={() => setIsFilterOpen(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body">
              <div className="filter-group">
                <label>Priority</label>
                <div className="priority-filters">
                  <button className="prio-btn active">All</button>
                  <button className="prio-btn high">High</button>
                  <button className="prio-btn medium">Medium</button>
                  <button className="prio-btn low">Low</button>
                </div>
              </div>
              <div className="filter-group">
                <label>Due Date</label>
                <select className="custom-select" defaultValue="All Time">
                  <option>All Time</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Sort By</label>
                <select className="custom-select" defaultValue="Due Date (Earliest)">
                  <option>Due Date (Earliest)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSummaryOpen && (
        <div className="modal-overlay" onClick={() => setIsSummaryOpen(false)}>
          <div className="modal-content textured-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fa-solid fa-chart-pie"></i> Task Summary</h3>
              <button className="close-btn" onClick={() => setIsSummaryOpen(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body">
              <div className="summary-content">
                <div className="chart-container">
                  <svg viewBox="0 0 36 36" className="donut-chart">
                    <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="circle-completed" strokeDasharray="41.6, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="circle-pending" strokeDasharray="25, 100" strokeDashoffset="-41.6" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="circle-inprogress" strokeDasharray="33.4, 100" strokeDashoffset="-66.6" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                </div>
                <div className="legend">
                  <div className="legend-item"><span className="dot total"></span> Total <span className="val">{tasks.length}</span></div>
                  <div className="legend-item"><span className="dot in-prog"></span> In Progress <span className="val">{getTasksByStatus('in-progress').length}</span></div>
                  <div className="legend-item"><span className="dot pend"></span> Pending <span className="val">{getTasksByStatus('pending').length}</span></div>
                  <div className="legend-item"><span className="dot comp"></span> Completed <span className="val">{getTasksByStatus('completed').length}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {isAddOpen && (
        <div className="modal-overlay" onClick={() => setIsAddOpen(false)}>
          <div className="pixel-modal" onClick={e => e.stopPropagation()}>
            <div className="pixel-modal-inner">
              <div className="pixel-modal-header">
                <div className="pixel-modal-title">
                  <span style={{ fontSize: '24px' }}>🧑🏻‍🎤✨</span> Create New Task
                </div>
                <button className="pixel-close-btn" onClick={() => setIsAddOpen(false)}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="pixel-divider"></div>

              <form onSubmit={handleAddTaskSubmit}>
                <div className="pixel-form-group">
                  <div className="pixel-icon-container">📓</div>
                  <div className="pixel-input-wrapper">
                    <label>Task Name</label>
                    <input 
                      type="text" 
                      className="pixel-input" 
                      value={newTaskForm.title} 
                      onChange={e => setNewTaskForm({...newTaskForm, title: e.target.value})} 
                      required 
                      placeholder="Enter task name..."
                    />
                  </div>
                </div>

                <div className="pixel-form-group">
                  <div className="pixel-icon-container">💬</div>
                  <div className="pixel-input-wrapper">
                    <label>Description</label>
                    <textarea 
                      className="pixel-input" 
                      value={newTaskForm.desc} 
                      onChange={e => setNewTaskForm({...newTaskForm, desc: e.target.value})} 
                      required 
                      placeholder="Enter description (optional)..."
                    />
                  </div>
                </div>

                <div className="pixel-form-group">
                  <div className="pixel-icon-container">🚩</div>
                  <div className="pixel-input-wrapper">
                    <label>Priority</label>
                    <div className="pixel-segmented-control">
                      <div className={`pixel-segment ${newTaskForm.priority === 'low' ? 'active' : ''}`} onClick={() => setNewTaskForm({...newTaskForm, priority: 'low'})}>
                        <div className="dot dot-low"></div> Low
                      </div>
                      <div className={`pixel-segment ${newTaskForm.priority === 'medium' ? 'active' : ''}`} onClick={() => setNewTaskForm({...newTaskForm, priority: 'medium'})}>
                        <div className="dot dot-medium"></div> Medium
                      </div>
                      <div className={`pixel-segment ${newTaskForm.priority === 'high' ? 'active' : ''}`} onClick={() => setNewTaskForm({...newTaskForm, priority: 'high'})}>
                        <div className="dot dot-high"></div> High
                      </div>
                      <div className={`pixel-segment ${newTaskForm.priority === 'urgent' ? 'active' : ''}`} onClick={() => setNewTaskForm({...newTaskForm, priority: 'urgent'})}>
                        <div className="dot dot-urgent"></div> Urgent
                      </div>
                    </div>
                  </div>
                </div>



                <div className="pixel-form-group">
                  <div className="pixel-icon-container">📅</div>
                  <div className="pixel-input-wrapper">
                    <label>Date <span style={{ fontWeight: 'normal', color: '#6c5a88' }}>(Optional)</span></label>
                    <input 
                      type="date" 
                      className="pixel-input" 
                      value={newTaskForm.date}
                      onChange={e => setNewTaskForm({...newTaskForm, date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pixel-modal-actions">
                  <button type="button" className="btn-pixel-cancel" onClick={() => setIsAddOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-pixel-submit">✨ Create Task ✨</button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default App;
