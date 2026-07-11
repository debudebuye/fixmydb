import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';

import statsRoutes from './routes';

const app = express();
app.use('/api/stats', statsRoutes);

describe('GET /api/stats', () => {
  it('returns analytics stats with valid structure', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const data = res.body.data;
    expect(data).toHaveProperty('totalUsers');
    expect(data).toHaveProperty('totalSchemasProcessed');
    expect(data).toHaveProperty('recentAnalyses');
    expect(Array.isArray(data.recentAnalyses)).toBe(true);
  });
});
