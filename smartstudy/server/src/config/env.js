import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envCandidates = [
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../.env'),
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
    break;
  }
}

/**
 * Validate required environment variables
 */
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('[ERROR] Missing required environment variables:');
  missingEnvVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease create a .env file with the required variables.');
  process.exit(1);
}

// Warn about optional but recommended env vars
const recommendedEnvVars = {
  GROQ_API_KEY: 'for chatbot functionality',
  CORS_ORIGIN: 'for frontend CORS (defaults to http://localhost:5173)',
  JWT_EXPIRE: 'for token expiration (defaults to 30d)',
  NODE_ENV: 'for environment mode (defaults to development)'
};

const warnings = [];
Object.entries(recommendedEnvVars).forEach(([varName, purpose]) => {
  if (!process.env[varName]) {
    warnings.push(`[WARNING] ${varName} not set - ${purpose}`);
  }
});

if (warnings.length > 0 && process.env.NODE_ENV !== 'production') {
  console.warn('\n[WARNING] Optional environment variables not set:');
  warnings.forEach(warning => console.warn(`   ${warning}`));
  console.warn('');
}

export default {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  GROQ_MODEL: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
