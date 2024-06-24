import { expect } from 'chai';
import { describe, it } from 'mocha';
import request from 'supertest';
import app from '../server'; 

describe('TestController', () => {
  it('should connect to the database successfully', async () => {
    const response = await request(app)
      .get('/api/db-test')
      .expect(200);

    expect(response.text).to.equal('Database connection OK');
  });
});