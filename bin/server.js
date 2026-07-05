import '../lib/dotenv-loader.js';
import { validateEnv } from '../lib/env.js';
import app from '../app.js';
import { connectDB } from '../lib/db.js';

validateEnv();

const PORT = Number(process.env.PORT) || 5000;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} [${app.get('env')}]`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
