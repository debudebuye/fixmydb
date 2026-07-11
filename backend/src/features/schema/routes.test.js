const express = require('express');
const request = require('supertest');
const schemaRoutes = require('./routes');

const app = express();
app.use('/api/schema', schemaRoutes);

describe('GET /api/schema/examples', () => {
  it('returns example schemas', async () => {
    const res = await request(app).get('/api/schema/examples');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);
  });

  it('each example has required fields', async () => {
    const res = await request(app).get('/api/schema/examples');
    for (const example of res.body.data) {
      expect(example).toHaveProperty('id');
      expect(example).toHaveProperty('name');
      expect(example).toHaveProperty('description');
      expect(example).toHaveProperty('sql');
      expect(typeof example.sql).toBe('string');
      expect(example.sql).toContain('CREATE TABLE');
    }
  });
});
