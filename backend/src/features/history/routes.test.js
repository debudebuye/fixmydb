const express = require('express');
const request = require('supertest');
const historyRoutes = require('./routes');

const app = express();
app.use(express.json());
app.use('/api/history', historyRoutes);

describe('history routes', () => {
  const sampleEntry = {
    healthScore: 85,
    tablesFound: 3,
    issuesCount: 2,
    recommendationsCount: 4,
    sqlPreview: 'CREATE TABLE users (id SERIAL PRIMARY KEY);',
    dialect: 'postgresql',
  };

  it('GET /api/history returns paginated list', async () => {
    const res = await request(app).get('/api/history');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta.pagination).toBeDefined();
    expect(res.body.meta.pagination.page).toBe(1);
    expect(res.body.meta.pagination.limit).toBe(20);
  });

  it('POST /api/history saves a new entry', async () => {
    const res = await request(app)
      .post('/api/history')
      .send(sampleEntry);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.timestamp).toBeDefined();
    expect(res.body.data.healthScore).toBe(85);
  });

  it('POST /api/history accepts empty body (all fields optional)', async () => {
    const res = await request(app)
      .post('/api/history')
      .send({});
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
  });

  it('GET /api/history/:id returns 404 for nonexistent id', async () => {
    const res = await request(app)
      .get('/api/history/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('GET /api/history/:id validates UUID format', async () => {
    const res = await request(app)
      .get('/api/history/invalid-uuid');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toContain('Invalid history ID');
  });

  it('DELETE /api/history clears all entries', async () => {
    const res = await request(app).delete('/api/history');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
