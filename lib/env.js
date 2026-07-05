const REQUIRED_ENV_VARS = ['URI_DB', 'JWT_SECRET_KEY'];

const RECOMMENDED_ENV_VARS = [
  'CLOUD_NAME',
  'CLOUD_API_KEY',
  'CLOUD_API_SECRET',
  'USER_NODEMAILER',
  'PASSWORD_NODEMAILER',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHAT_ID',
];

export const validateEnv = () => {
  const missingRequired = REQUIRED_ENV_VARS.filter(key => !process.env[key]);

  if (missingRequired.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missingRequired.join(', ')}. ` +
        'Check your .env file (see .env.example).',
    );
  }

  const missingRecommended = RECOMMENDED_ENV_VARS.filter(key => !process.env[key]);
  if (missingRecommended.length > 0) {
    console.warn(
      `⚠️  Missing optional environment variable(s): ${missingRecommended.join(', ')}. ` +
        'Related features (file uploads, email, Telegram notifications) will not work until they are set.',
    );
  }
};
