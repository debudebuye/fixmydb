const express = require('express');
const request = require('supertest');
const analyzeRoutes = require('./routes');

const app = express();
app.use(express.json());
app.use('/api/analyze', analyzeRoutes);

describe('POST /api/analyze', () => {
  it('rejects empty SQL', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({ sql: '' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toContain('SQL schema is required');
  });

  it('rejects invalid dialect', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({ sql: 'CREATE TABLE t (id INT)', dialect: 'invalid' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('Invalid dialect');
  });

  it('rejects invalid analysis mode', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({ sql: 'CREATE TABLE t (id INT)', analysisMode: 'invalid' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('Invalid analysis mode');
  });

  it('rejects SQL with no CREATE TABLE statements', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({ sql: 'SELECT 1' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toBe('No valid CREATE TABLE statements found');
  });

  it('analyzes a simple schema successfully', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({ sql: 'CREATE TABLE users (id SERIAL PRIMARY KEY, email VARCHAR(255));' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const data = res.body.data;
    expect(data.meta).toBeDefined();
    expect(data.meta.tablesFound).toBe(1);
    expect(data.healthScore).toBeGreaterThanOrEqual(0);
    expect(data.issues).toBeDefined();
    expect(data.recommendations).toBeDefined();
    expect(data.erDiagram).toBeDefined();
    expect(data.optimizedSQL).toBeDefined();
  });

  it('analyzes multiple tables', async () => {
    const sql = `
      CREATE TABLE users (id SERIAL PRIMARY KEY, email VARCHAR(255));
      CREATE TABLE posts (id SERIAL PRIMARY KEY, user_id INTEGER, title VARCHAR(255));
    `;
    const res = await request(app).post('/api/analyze').send({ sql });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.meta.tablesFound).toBe(2);
    expect(res.body.data.meta.relationshipsFound).toBe(0);
  });
});
