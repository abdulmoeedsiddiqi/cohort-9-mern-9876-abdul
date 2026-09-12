import { expect } from 'chai';
import { Request, Response } from 'express';

import { asyncHandler } from '../../src/utils/asyncHandler';

describe('asyncHandler', () => {
  it('forwards the rejection to next() when the wrapped handler throws', async () => {
    const error = new Error('boom');
    const handler = asyncHandler(async () => {
      throw error;
    });

    let received: unknown;
    await handler({} as Request, {} as Response, (err) => {
      received = err;
    });

    expect(received).to.equal(error);
  });

  it('does not call next() when the wrapped handler resolves', async () => {
    const handler = asyncHandler(async () => undefined);

    let called = false;
    await handler({} as Request, {} as Response, () => {
      called = true;
    });

    expect(called).to.equal(false);
  });
});
