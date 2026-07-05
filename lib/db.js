import mongoose from 'mongoose';

const { connect, connection } = mongoose;

export const connectDB = async () => {
  await connect(process.env.URI_DB);
};

connection.on('connected', () => console.log('✅ MongoDB connected'));
// BUG FIX: event name was "err" — correct name is "error"
connection.on('error', err => console.error('❌ MongoDB error:', err.message));
connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));

process.on('SIGINT', async () => {
  await connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});
