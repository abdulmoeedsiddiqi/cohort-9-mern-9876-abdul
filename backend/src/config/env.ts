import dotenv from 'dotenv';

dotenv.config();

interface Env {
  nodeEnv: string;
  port: number;
  corsOrigin: string;
  logLevel: string;
  jwtSecret: string;
  jwtExpiresInDays: number;
  cookieName: string;
  grokApiKey: string | undefined;
  grokBaseUrl: string;
  grokModel: string;
}

export const env: Env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  logLevel: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-insecure-secret-change-me',
  jwtExpiresInDays: Number(process.env.JWT_EXPIRES_IN_DAYS ?? 7),
  cookieName: process.env.COOKIE_NAME ?? 'auth_token',
  grokApiKey: process.env.GROK_API_KEY,
  grokBaseUrl: process.env.GROK_BASE_URL ?? 'https://api.x.ai/v1',
  grokModel: process.env.GROK_MODEL ?? 'grok-4-fast-non-reasoning',
};
