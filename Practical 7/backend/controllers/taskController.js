import Task from '../models/Task.js';

// @desc    Get all tasks for current user
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task for current user
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res, next) => {
  try {
    const { title, desc, priority, date } = req.body;

    let formattedDate = date;
    if (date && date.includes('-')) {
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
      }
    } else if (!date) {
      formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    const newTask = await Task.create({
      title: title.trim(),
      desc: desc.trim(),
      priority: priority || 'medium',
      date: formattedDate,
      status: 'in-progress',
      user: req.user._id,
    });

    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing task owned by current user
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.body.date && req.body.date.includes('-')) {
      const d = new Date(req.body.date);
      if (!isNaN(d.getTime())) {
        req.body.date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
      }
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task owned by current user
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedTask = await Task.findOneAndDelete({ _id: id, user: req.user._id });

    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }

    res.status(200).json({ message: 'Task deleted successfully', id });
  } catch (error) {
    next(error);
  }
};
