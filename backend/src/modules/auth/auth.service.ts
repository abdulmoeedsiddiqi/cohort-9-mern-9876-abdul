import { ApiError } from '../../utils/ApiError';
import { comparePassword, hashPassword } from '../../utils/hash';
import { signToken } from '../../utils/jwt';
import * as authRepository from './auth.repository';
import { LoginInput, PublicUser, SignupInput } from './auth.types';

type AuthRepository = typeof authRepository;

interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

function toPublicUser(user: StoredUser): PublicUser {
  return { id: user.id, name: user.name, email: user.email };
}

export async function signup(
  input: SignupInput,
  repository: AuthRepository = authRepository,
): Promise<{ user: PublicUser; token: string }> {
  const existing = await repository.findUserByEmail(input.email);
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await repository.createUser({
    name: input.name,
    email: input.email,
    passwordHash,
  });

  const token = signToken({ sub: user.id });
  return { user: toPublicUser(user), token };
}

export async function getCurrentUser(
  userId: string,
  repository: AuthRepository = authRepository,
): Promise<PublicUser> {
  const user = await repository.findUserById(userId);
  if (!user) {
    throw ApiError.unauthorized('Invalid or expired session');
  }

  return toPublicUser(user);
}

export async function login(
  input: LoginInput,
  repository: AuthRepository = authRepository,
): Promise<{ user: PublicUser; token: string }> {
  const user = await repository.findUserByEmail(input.email);
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const passwordMatches = await comparePassword(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = signToken({ sub: user.id });
  return { user: toPublicUser(user), token };
}
