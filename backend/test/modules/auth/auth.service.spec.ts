import { expect } from 'chai';

import * as authService from '../../../src/modules/auth/auth.service';
import { hashPassword } from '../../../src/utils/hash';

interface FakeUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

function makeFakeRepository(initialUsers: FakeUser[] = []) {
  const users = [...initialUsers];

  return {
    users,
    findUserByEmail: async (email: string) => users.find((u) => u.email === email) ?? null,
    createUser: async (data: { name: string; email: string; passwordHash: string }) => {
      const user: FakeUser = { id: `user-${users.length + 1}`, ...data };
      users.push(user);
      return user;
    },
  };
}

describe('auth.service', () => {
  describe('signup', () => {
    it('creates a new user and returns a token when the email is unused', async () => {
      const repository = makeFakeRepository();

      const result = await authService.signup(
        { name: 'Ada Lovelace', email: 'ada@example.com', password: 'password123' },
        repository,
      );

      expect(result.user).to.deep.equal({ id: 'user-1', name: 'Ada Lovelace', email: 'ada@example.com' });
      expect(result.token).to.be.a('string').with.length.greaterThan(0);
      expect(repository.users).to.have.length(1);
      expect(repository.users[0].passwordHash).to.not.equal('password123');
    });

    it('throws a conflict error when the email is already registered', async () => {
      const repository = makeFakeRepository([
        { id: 'user-1', name: 'Existing', email: 'taken@example.com', passwordHash: 'x' },
      ]);

      try {
        await authService.signup(
          { name: 'New Person', email: 'taken@example.com', password: 'password123' },
          repository,
        );
        expect.fail('expected signup to throw');
      } catch (err) {
        expect((err as { statusCode: number }).statusCode).to.equal(409);
      }
    });
  });

  describe('login', () => {
    it('returns a token when the credentials are correct', async () => {
      const passwordHash = await hashPassword('correct-password');
      const repository = makeFakeRepository([
        { id: 'user-1', name: 'Ada Lovelace', email: 'ada@example.com', passwordHash },
      ]);

      const result = await authService.login(
        { email: 'ada@example.com', password: 'correct-password' },
        repository,
      );

      expect(result.user.email).to.equal('ada@example.com');
      expect(result.token).to.be.a('string').with.length.greaterThan(0);
    });

    it('throws unauthorized when the email is unknown', async () => {
      const repository = makeFakeRepository();

      try {
        await authService.login({ email: 'nobody@example.com', password: 'whatever' }, repository);
        expect.fail('expected login to throw');
      } catch (err) {
        expect((err as { statusCode: number }).statusCode).to.equal(401);
      }
    });

    it('throws unauthorized when the password is wrong', async () => {
      const passwordHash = await hashPassword('correct-password');
      const repository = makeFakeRepository([
        { id: 'user-1', name: 'Ada Lovelace', email: 'ada@example.com', passwordHash },
      ]);

      try {
        await authService.login({ email: 'ada@example.com', password: 'wrong-password' }, repository);
        expect.fail('expected login to throw');
      } catch (err) {
        expect((err as { statusCode: number }).statusCode).to.equal(401);
      }
    });
  });
});
