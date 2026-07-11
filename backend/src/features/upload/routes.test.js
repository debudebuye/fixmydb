const path = require('path');
const fs = require('fs');
const express = require('express');
const request = require('supertest');
const uploadRoutes = require('./routes');

const app = express();
app.use('/api/upload', uploadRoutes);

describe('POST /api/upload', () => {
  const fixturesDir = path.join(__dirname, 'test-fixtures');
  const sqlPath1 = path.join(fixturesDir, 'test-schema.sql');
  const sqlPath2 = path.join(fixturesDir, 'test-schema2.sql');

  beforeAll(() => {
    if (!fs.existsSync(fixturesDir)) fs.mkdirSync(fixturesDir, { recursive: true });
    fs.writeFileSync(sqlPath1, 'CREATE TABLE users (id SERIAL PRIMARY KEY);');
    fs.writeFileSync(sqlPath2, 'CREATE TABLE posts (id SERIAL PRIMARY KEY, user_id INTEGER);');
  });

  afterAll(() => {
    [sqlPath1, sqlPath2].forEach(p => { if (fs.existsSync(p)) fs.unlinkSync(p); });
    if (fs.existsSync(fixturesDir)) {
      try {
        fs.readdirSync(fixturesDir).forEach(f => {
          const fp = path.join(fixturesDir, f);
          if (fs.statSync(fp).isFile()) fs.unlinkSync(fp);
        });
        fs.rmdirSync(fixturesDir);
      } catch {}
    }
  });

  it('uploads a single .sql file', async () => {
    const res = await request(app)
      .post('/api/upload')
      .attach('files', sqlPath1);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fileCount).toBe(1);
    expect(res.body.data.sql).toContain('CREATE TABLE');
    expect(res.body.data.files[0].filename).toBe('test-schema.sql');
  });

  it('uploads multiple .sql files and concatenates', async () => {
    const res = await request(app)
      .post('/api/upload')
      .attach('files', sqlPath1)
      .attach('files', sqlPath2);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fileCount).toBe(2);
    expect(res.body.data.sql).toContain('CREATE TABLE users');
    expect(res.body.data.sql).toContain('CREATE TABLE posts');
    expect(res.body.data.files).toHaveLength(2);
  });

  it('rejects missing file', async () => {
    const res = await request(app).post('/api/upload');
    expect(res.status).toBe(400);
  });
});
