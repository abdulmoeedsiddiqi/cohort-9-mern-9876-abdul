import { expect } from 'chai';
import request from 'supertest';

import { createApp } from '../../src/app';

describe('error handling middleware', () => {
  const app = createApp();

  it('returns 200 with the health payload for GET /health', async () => {
    const res = await request(app).get('/health');

    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal({ status: 'ok', env: 'development' });
  });

  it('returns a JSON 404 error for unknown routes', async () => {
    const res = await request(app).get('/does-not-exist');

    expect(res.status).to.equal(404);
    expect(res.body.error.message).to.include('Route not found');
    expect(res.body.error.requestId).to.be.a('string');
  });
});
