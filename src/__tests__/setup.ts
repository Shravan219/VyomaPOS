import { beforeEach, vi } from 'vitest';

// Global test setup: clear mocks and reset localStorage between tests
beforeEach(() => {
  vi.clearAllMocks();
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
});
