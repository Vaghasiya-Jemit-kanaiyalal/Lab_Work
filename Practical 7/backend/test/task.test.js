import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateTask, validateRegister, validateLogin } from '../middlewares/validationMiddleware.js';
import cache from '../cache.js';

describe('Task Management Application - Automated Test Suite', () => {
  describe('Task Input Validation Middleware', () => {
    it('should reject a task when title is missing', () => {
      let statusCode = null;
      let responseBody = null;
      let nextCalled = false;

      const req = { body: { desc: 'Test description', priority: 'high' } };
      const res = {
        status(code) {
          statusCode = code;
          return {
            json(data) {
              responseBody = data;
            }
          };
        }
      };
      const next = () => { nextCalled = true; };

      validateTask(req, res, next);

      assert.strictEqual(statusCode, 400, 'Expected status code 400 when title is missing');
      assert.strictEqual(responseBody?.error, 'Title is required and must be a non-empty string');
      assert.strictEqual(nextCalled, false, 'next() should not be called when validation fails');
    });

    it('should reject a task when description is missing', () => {
      let statusCode = null;
      let responseBody = null;
      let nextCalled = false;

      const req = { body: { title: 'Test Task', priority: 'medium' } };
      const res = {
        status(code) {
          statusCode = code;
          return {
            json(data) {
              responseBody = data;
            }
          };
        }
      };
      const next = () => { nextCalled = true; };

      validateTask(req, res, next);

      assert.strictEqual(statusCode, 400, 'Expected status code 400 when description is missing');
      assert.strictEqual(nextCalled, false);
    });

    it('should reject a task when priority is invalid', () => {
      let statusCode = null;
      let responseBody = null;

      const req = { body: { title: 'Test Task', desc: 'Valid description', priority: 'super-urgent' } };
      const res = {
        status(code) {
          statusCode = code;
          return {
            json(data) {
              responseBody = data;
            }
          };
        }
      };
      const next = () => {};

      validateTask(req, res, next);

      assert.strictEqual(statusCode, 400);
      assert.strictEqual(responseBody?.error, 'Priority must be high, medium, low, or urgent');
    });

    it('should call next() when task payload is valid', () => {
      let nextCalled = false;
      const req = { body: { title: 'Complete Practical 8', desc: 'Set up GitHub Actions CI/CD pipeline', priority: 'high' } };
      const res = {
        status() { return { json() {} }; }
      };
      const next = () => { nextCalled = true; };

      validateTask(req, res, next);

      assert.strictEqual(nextCalled, true, 'next() must be called for valid task payload');
    });
  });

  describe('User Authentication Validation', () => {
    it('should reject registration when email format is invalid', () => {
      let statusCode = null;
      let responseBody = null;

      const req = { body: { name: 'Alice', email: 'invalid-email', password: 'password123' } };
      const res = {
        status(code) {
          statusCode = code;
          return {
            json(data) { responseBody = data; }
          };
        }
      };
      const next = () => {};

      validateRegister(req, res, next);

      assert.strictEqual(statusCode, 400);
      assert.strictEqual(responseBody?.error, 'Please provide a valid email address');
    });

    it('should reject registration when password is under 6 characters', () => {
      let statusCode = null;
      let responseBody = null;

      const req = { body: { name: 'Alice', email: 'alice@example.com', password: '123' } };
      const res = {
        status(code) {
          statusCode = code;
          return {
            json(data) { responseBody = data; }
          };
        }
      };
      const next = () => {};

      validateRegister(req, res, next);

      assert.strictEqual(statusCode, 400);
      assert.strictEqual(responseBody?.error, 'Password must be at least 6 characters long');
    });

    it('should approve valid user registration payload', () => {
      let nextCalled = false;
      const req = { body: { name: 'Alice Doe', email: 'alice@example.com', password: 'securePassword123' } };
      const res = { status() { return { json() {} }; } };
      const next = () => { nextCalled = true; };

      validateRegister(req, res, next);

      assert.strictEqual(nextCalled, true);
    });
  });

  describe('In-Memory Task Cache Subsystem', () => {
    it('should store, retrieve, and delete cached tasks correctly', () => {
      const cacheKey = 'tasks:test_user_ci';
      const mockTasks = [
        { id: 1, title: 'Task 1', status: 'pending' },
        { id: 2, title: 'Task 2', status: 'completed' },
      ];

      cache.set(cacheKey, mockTasks);
      const retrieved = cache.get(cacheKey);

      assert.deepStrictEqual(retrieved, mockTasks, 'Cached tasks should match original tasks');

      cache.del(cacheKey);
      const afterDelete = cache.get(cacheKey);
      assert.strictEqual(afterDelete, undefined, 'Deleted cache key should return undefined');
    });
  });

  describe('CI/CD Pipeline Demonstration - Intentional Failure Mode', () => {
    it('DELIBERATELY BROKEN TEST: intentional failure to demonstrate CI/CD pipeline red status', () => {
      const expectedStatus = 200;
      const actualStatus = 500;
      // This assertion is intentionally designed to fail
      assert.strictEqual(
        actualStatus,
        expectedStatus,
        'DELIBERATE CI/CD DEMO FAILURE: Server returned 500 but test expected 200. This deliberately breaks the pipeline.'
      );
    });
  });
});
