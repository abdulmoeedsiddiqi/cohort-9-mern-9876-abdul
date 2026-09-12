import { expect } from 'chai';
import request from 'supertest';

import { prisma } from '../../../src/lib/prisma';
import { createApp } from '../../../src/app';

const EMAIL_DOMAIN = '@auth-controller-test.local';

describe('auth controller (integration)', () => {
  const app = createApp();

  afterEach(async () => {
    await prisma.user.deleteMany({ where: { email: { endsWith: EMAIL_DOMAIN } } });
  });

  after(async () => {
    await prisma.$disconnect();
  });

  describe('POST /auth/signup', () => {
    it('creates a user, sets the auth cookie, and returns the public user', async () => {
      const res = await request(app).post('/auth/signup').send({
        name: 'Ada Lovelace',
        email: `ada${EMAIL_DOMAIN}`,
        password: 'password123',
      });

      expect(res.status).to.equal(201);
      expect(res.body.user).to.include({ name: 'Ada Lovelace', email: `ada${EMAIL_DOMAIN}` });
      expect(res.body.user).to.not.have.property('passwordHash');
      expect(res.headers['set-cookie']?.[0]).to.include('auth_token=');
    });

    it('returns 409 when the email is already registered', async () => {
      await request(app).post('/auth/signup').send({
        name: 'Ada Lovelace',
        email: `dup${EMAIL_DOMAIN}`,
        password: 'password123',
      });

      const res = await request(app).post('/auth/signup').send({
        name: 'Someone Else',
        email: `dup${EMAIL_DOMAIN}`,
        password: 'password456',
      });

      expect(res.status).to.equal(409);
    });

    it('returns 400 for an invalid payload', async () => {
      const res = await request(app).post('/auth/signup').send({
        name: '',
        email: 'not-an-email',
        password: 'short',
      });

      expect(res.status).to.equal(400);
      expect(res.body.error.details).to.have.keys(['name', 'email', 'password']);
    });
  });

  describe('POST /auth/login', () => {
    it('logs in with correct credentials and sets the auth cookie', async () => {
      await request(app).post('/auth/signup').send({
        name: 'Grace Hopper',
        email: `grace${EMAIL_DOMAIN}`,
        password: 'password123',
      });

      const res = await request(app).post('/auth/login').send({
        email: `grace${EMAIL_DOMAIN}`,
        password: 'password123',
      });

      expect(res.status).to.equal(200);
      expect(res.body.user.email).to.equal(`grace${EMAIL_DOMAIN}`);
      expect(res.headers['set-cookie']?.[0]).to.include('auth_token=');
    });

    it('returns 401 for a wrong password', async () => {
      await request(app).post('/auth/signup').send({
        name: 'Grace Hopper',
        email: `grace2${EMAIL_DOMAIN}`,
        password: 'password123',
      });

      const res = await request(app).post('/auth/login').send({
        email: `grace2${EMAIL_DOMAIN}`,
        password: 'wrong-password',
      });

      expect(res.status).to.equal(401);
    });
  });

  describe('GET /auth/me', () => {
    it('returns the logged-in user when the auth cookie is valid', async () => {
      const signupRes = await request(app).post('/auth/signup').send({
        name: 'Alan Turing',
        email: `alan${EMAIL_DOMAIN}`,
        password: 'password123',
      });
      const cookie = signupRes.headers['set-cookie'][0];

      const res = await request(app).get('/auth/me').set('Cookie', cookie);

      expect(res.status).to.equal(200);
      expect(res.body.user.email).to.equal(`alan${EMAIL_DOMAIN}`);
    });

    it('returns 401 without an auth cookie', async () => {
      const res = await request(app).get('/auth/me');
      expect(res.status).to.equal(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('clears the auth cookie', async () => {
      const res = await request(app).post('/auth/logout');

      expect(res.status).to.equal(204);
      const cookie = res.headers['set-cookie']?.[0];
      expect(cookie).to.include('auth_token=;');
    });
  });
});
