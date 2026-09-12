import { expect } from 'chai';
import { Request, Response } from 'express';

import { authenticate } from '../../src/middleware/authenticate';
import { env } from '../../src/config/env';
import { signToken } from '../../src/utils/jwt';

function makeReq(cookies: Record<string, string>): Request {
  return { cookies } as unknown as Request;
}

describe('authenticate middleware', () => {
  it('attaches req.user and calls next() with a valid cookie', () => {
    const token = signToken({ sub: 'user-1' });
    const req = makeReq({ [env.cookieName]: token });

    let nextArg: unknown = 'not-called';
    authenticate(req, {} as Response, (err) => {
      nextArg = err;
    });

    expect(nextArg).to.equal(undefined);
    expect(req.user).to.deep.equal({ id: 'user-1' });
  });

  it('calls next() with an unauthorized error when the cookie is missing', () => {
    const req = makeReq({});

    let nextArg: unknown;
    authenticate(req, {} as Response, (err) => {
      nextArg = err;
    });

    expect((nextArg as { statusCode: number }).statusCode).to.equal(401);
  });

  it('calls next() with an unauthorized error when the token is invalid', () => {
    const req = makeReq({ [env.cookieName]: 'not-a-real-token' });

    let nextArg: unknown;
    authenticate(req, {} as Response, (err) => {
      nextArg = err;
    });

    expect((nextArg as { statusCode: number }).statusCode).to.equal(401);
  });
});
