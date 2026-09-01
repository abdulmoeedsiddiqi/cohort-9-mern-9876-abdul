import dotenv from 'dotenv';

dotenv.config();

interface Env {
  nodeEnv: string;
  port: number;
  corsOrigin: string;
  logLevel: string;
}

export const env: Env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  logLevel: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
};
