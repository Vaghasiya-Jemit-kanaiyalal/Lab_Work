import { EventEmitter } from 'events';

/**
 * Custom EventEmitter for Task Management Application
 * Provides centralized event bus for decoupling business logic
 * from background side-effects (e.g., notifications, logging, webhooks).
 */
class TaskEventEmitter extends EventEmitter {}

// Singleton event emitter instance
const taskEventEmitter = new TaskEventEmitter();

// Set max listeners to avoid false-positive memory leak warnings during load
taskEventEmitter.setMaxListeners(30);

export default taskEventEmitter;
