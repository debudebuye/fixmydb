import { describe, it, expect, beforeEach } from 'vitest';
import { getDeviceId } from './device';

describe('getDeviceId', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns a UUID v4 format string', () => {
    const id = getDeviceId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('returns the same ID on subsequent calls', () => {
    const first = getDeviceId();
    const second = getDeviceId();
    expect(first).toBe(second);
  });

  it('creates a new ID when localStorage is cleared', () => {
    const first = getDeviceId();
    localStorage.clear();
    const second = getDeviceId();
    expect(second).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
});
