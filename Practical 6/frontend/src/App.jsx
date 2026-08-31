import React, { useState, useEffect } from 'react';
import './pixel-modal.css';
const getTodayString = () => new Date().toISOString().split('T')[0];

function App() {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // Add Task Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({ title: '', desc: '', priority: 'medium', date: getTodayString() });

  // Edit Task Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTaskForm, setEditTaskForm] = useState({ id: '', title: '', desc: '', priority: 'medium', status: 'in-progress', date: '' });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

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
        setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
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
        setTasks(prev => [createdTask, ...prev]);
        setIsAddOpen(false);
      } else {
        console.error('Validation failed');
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleOpenEdit = (task) => {
    setEditTaskForm({
      id: task.id,
      title: task.title,
      desc: task.desc || '',
      priority: task.priority || 'medium',
      status: task.status || 'in-progress',
      date: task.date || getTodayString()
    });
    setIsEditOpen(true);
  };

  const handleEditTaskSubmit = async (e) => {
    e.preventDefault();
    if (!editTaskForm.title.trim() || !editTaskForm.desc.trim()) return;

    try {
      const response = await fetch(`/api/tasks/${editTaskForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTaskForm.title,
          desc: editTaskForm.desc,
          priority: editTaskForm.priority,
          status: editTaskForm.status,
          date: editTaskForm.date
        })
      });
      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        setIsEditOpen(false);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setTasks(prev => prev.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getTasksByStatus = (status) => tasks.filter(t => t.status === status);

  const getFilteredColumnTasks = (status) => {
    return tasks.filter(task => {
      if (task.status !== status) return false;
      const matchesSearch = searchQuery === '' ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.desc && task.desc.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesTab = activeTab === 'all' || activeTab === status;
      return matchesSearch && matchesPriority && matchesTab;
    });
  };

  const renderTaskCard = (task) => (
    <div key={task.id} className="task-card">
      <div className="card-title">
        <input 
          type="checkbox" 
          checked={task.status === 'completed'} 
          onChange={async (e) => {
            const newStatus = e.target.checked ? 'completed' : 'in-progress';
            try {
              const res = await fetch(`/api/tasks/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
              });
              if (res.ok) {
                const updated = await res.json();
                setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
              }
            } catch (err) {
              console.error(err);
            }
          }} 
        /> 
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
        <button 
          className="move-btn edit-btn" 
          onClick={() => handleOpenEdit(task)} 
          title="Edit Task" 
          style={{ marginLeft: task.status === 'in-progress' ? '0' : '6px' }}
        >
          <i className="fa-solid fa-pen-to-square"></i>
        </button>
        <button 
          className="move-btn delete-btn" 
          onClick={() => handleDeleteTask(task.id)} 
          title="Delete Task" 
          style={{ marginLeft: '6px', color: '#e53e3e' }}
        >
          <i className="fa-solid fa-trash-can"></i>
        </button>
        {task.status !== 'completed' && (
          <button className="move-btn right" onClick={() => moveTask(task.id, 'right')} title="Move Right">
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        )}
      </div>
    </div>
  );

  const completedCount = getTasksByStatus('completed').length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
              <div className="progress-bar-fill sidebar-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div className="xp-text">{completedCount * 100} / 500 XP</div>
            <div className="next-level">Next Level: {Math.max(0, 500 - completedCount * 100)} XP</div>
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
              <h2>My Tasks</h2>
              <p>Let's crush your tasks today!</p>
            </div>
          </div>
          <div className="header-right">
            <div className="search-box">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input 
                type="text" 
                placeholder="Search tasks..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
              />
            </div>
            <button className="btn-filter" onClick={() => setIsSummaryOpen(true)}>
              <i className="fa-solid fa-chart-pie"></i> Task Summary
            </button>
            <button className="btn-filter" onClick={() => setIsFilterOpen(true)}>
              <i className="fa-solid fa-filter"></i> Filter {priorityFilter !== 'all' ? `(${priorityFilter})` : ''} <i className="fa-solid fa-chevron-down"></i>
            </button>
            <div className="notification">
              <i className="fa-regular fa-bell"></i>
              <span className="badge">{getTasksByStatus('in-progress').length}</span>
            </div>
            <div className="avatar-small">🧑🏻</div>
            <i className="fa-solid fa-chevron-down"></i>
          </div>
        </header>

        {/* Action Bar */}
        <div className="action-bar">
          <div className="tabs">
            <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
              All Tasks <span className="count">{tasks.length}</span>
            </button>
            <button className={`tab ${activeTab === 'in-progress' ? 'active' : ''}`} onClick={() => setActiveTab('in-progress')}>
              In Progress <span className="count">{getTasksByStatus('in-progress').length}</span>
            </button>
            <button className={`tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
              Pending <span className="count">{getTasksByStatus('pending').length}</span>
            </button>
            <button className={`tab ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
              Completed <span className="count">{getTasksByStatus('completed').length}</span>
            </button>
          </div>
          <div className="view-toggles">
            <button className="view-btn active"><i className="fa-solid fa-border-all"></i> Board View</button>
            <button className="btn-primary" onClick={handleOpenAdd}><i className="fa-solid fa-plus"></i> Add Task</button>
          </div>
        </div>

        {/* Content Body */}
        <div className="content-body">
          <div className="kanban-board full-width">
            {/* Column 1: In Progress */}
            {(activeTab === 'all' || activeTab === 'in-progress') && (
              <div className="column in-progress-col glass">
                <div className="column-header">
                  <span className="icon">⚔️</span> <h3>IN PROGRESS</h3> <span className="col-count">{getTasksByStatus('in-progress').length}</span>
                  <button className="header-add-btn" onClick={handleOpenAdd} title="Add Task">
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </div>
                <div className="cards-container">
                  {getFilteredColumnTasks('in-progress').map(renderTaskCard)}
                </div>
              </div>
            )}

            {/* Column 2: Pending */}
            {(activeTab === 'all' || activeTab === 'pending') && (
              <div className="column pending-col glass">
                <div className="column-header">
                  <span className="icon">🛡️</span> <h3>PENDING</h3> <span className="col-count">{getTasksByStatus('pending').length}</span>
                </div>
                <div className="cards-container">
                  {getFilteredColumnTasks('pending').map(renderTaskCard)}
                </div>
              </div>
            )}

            {/* Column 3: Completed */}
            {(activeTab === 'all' || activeTab === 'completed') && (
              <div className="column completed-col glass">
                <div className="column-header">
                  <span className="icon">🚩</span> <h3>COMPLETED</h3> <span className="col-count">{getTasksByStatus('completed').length}</span>
                </div>
                <div className="cards-container">
                  {getFilteredColumnTasks('completed').map(renderTaskCard)}
                </div>
              </div>
            )}
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
                <div className={`node ${completedCount >= 1 ? 'active' : ''}`}></div>
                <div className={`node ${completedCount >= 2 ? 'active' : ''}`}></div>
                <div className={`node ${completedCount >= 3 ? 'active' : ''}`}></div>
                <div className={`node ${completedCount >= 4 ? 'active' : ''}`}></div>
                <div className={`node ${completedCount >= 5 ? 'active' : ''}`}></div>
                <div className="castle">🏰🚩</div>
              </div>
            </div>
            <div className="bottom-progress-container">
              <div className="progress-bar-bg bottom-bg">
                <div className="progress-bar-fill bottom-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <span className="progress-text">{completedCount} / {totalCount} Tasks Done</span>
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
      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="modal-overlay" onClick={() => setIsFilterOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fa-solid fa-filter"></i> Filters</h3>
              <button className="close-btn" onClick={() => setIsFilterOpen(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body">
              <div className="filter-group">
                <label>Priority Filter</label>
                <div className="priority-filters">
                  <button className={`prio-btn ${priorityFilter === 'all' ? 'active' : ''}`} onClick={() => setPriorityFilter('all')}>All</button>
                  <button className={`prio-btn high ${priorityFilter === 'high' ? 'active' : ''}`} onClick={() => setPriorityFilter('high')}>High</button>
                  <button className={`prio-btn medium ${priorityFilter === 'medium' ? 'active' : ''}`} onClick={() => setPriorityFilter('medium')}>Medium</button>
                  <button className={`prio-btn low ${priorityFilter === 'low' ? 'active' : ''}`} onClick={() => setPriorityFilter('low')}>Low</button>
                  <button className={`prio-btn urgent ${priorityFilter === 'urgent' ? 'active' : ''}`} onClick={() => setPriorityFilter('urgent')}>Urgent</button>
                </div>
              </div>
              <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button className="btn-primary" onClick={() => setIsFilterOpen(false)}>Apply Filter</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Summary Modal */}
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
                    <path className="circle-completed" strokeDasharray={`${totalCount > 0 ? (getTasksByStatus('completed').length / totalCount) * 100 : 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="circle-pending" strokeDasharray={`${totalCount > 0 ? (getTasksByStatus('pending').length / totalCount) * 100 : 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="circle-inprogress" strokeDasharray={`${totalCount > 0 ? (getTasksByStatus('in-progress').length / totalCount) * 100 : 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
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

      {/* Add Task Modal */}
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
                      placeholder="Enter description..."
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

      {/* Edit Task Modal */}
      {isEditOpen && (
        <div className="modal-overlay" onClick={() => setIsEditOpen(false)}>
          <div className="pixel-modal" onClick={e => e.stopPropagation()}>
            <div className="pixel-modal-inner">
              <div className="pixel-modal-header">
                <div className="pixel-modal-title">
                  <span style={{ fontSize: '24px' }}>✏️✨</span> Edit Task
                </div>
                <button className="pixel-close-btn" onClick={() => setIsEditOpen(false)}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="pixel-divider"></div>

              <form onSubmit={handleEditTaskSubmit}>
                <div className="pixel-form-group">
                  <div className="pixel-icon-container">📓</div>
                  <div className="pixel-input-wrapper">
                    <label>Task Name</label>
                    <input 
                      type="text" 
                      className="pixel-input" 
                      value={editTaskForm.title} 
                      onChange={e => setEditTaskForm({...editTaskForm, title: e.target.value})} 
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
                      value={editTaskForm.desc} 
                      onChange={e => setEditTaskForm({...editTaskForm, desc: e.target.value})} 
                      required 
                      placeholder="Enter description..."
                    />
                  </div>
                </div>

                <div className="pixel-form-group">
                  <div className="pixel-icon-container">🚩</div>
                  <div className="pixel-input-wrapper">
                    <label>Priority</label>
                    <div className="pixel-segmented-control">
                      <div className={`pixel-segment ${editTaskForm.priority === 'low' ? 'active' : ''}`} onClick={() => setEditTaskForm({...editTaskForm, priority: 'low'})}>
                        <div className="dot dot-low"></div> Low
                      </div>
                      <div className={`pixel-segment ${editTaskForm.priority === 'medium' ? 'active' : ''}`} onClick={() => setEditTaskForm({...editTaskForm, priority: 'medium'})}>
                        <div className="dot dot-medium"></div> Medium
                      </div>
                      <div className={`pixel-segment ${editTaskForm.priority === 'high' ? 'active' : ''}`} onClick={() => setEditTaskForm({...editTaskForm, priority: 'high'})}>
                        <div className="dot dot-high"></div> High
                      </div>
                      <div className={`pixel-segment ${editTaskForm.priority === 'urgent' ? 'active' : ''}`} onClick={() => setEditTaskForm({...editTaskForm, priority: 'urgent'})}>
                        <div className="dot dot-urgent"></div> Urgent
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pixel-form-group">
                  <div className="pixel-icon-container">📌</div>
                  <div className="pixel-input-wrapper">
                    <label>Status</label>
                    <select 
                      className="pixel-input" 
                      style={{ height: '40px', padding: '0 12px' }}
                      value={editTaskForm.status}
                      onChange={e => setEditTaskForm({...editTaskForm, status: e.target.value})}
                    >
                      <option value="in-progress">In Progress</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="pixel-form-group">
                  <div className="pixel-icon-container">📅</div>
                  <div className="pixel-input-wrapper">
                    <label>Date</label>
                    <input 
                      type="text" 
                      className="pixel-input" 
                      value={editTaskForm.date}
                      onChange={e => setEditTaskForm({...editTaskForm, date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pixel-modal-actions">
                  <button type="button" className="btn-pixel-cancel" onClick={() => setIsEditOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-pixel-submit">💾 Save Changes</button>
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
