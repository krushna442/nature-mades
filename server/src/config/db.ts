import mongoose from 'mongoose';

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/naturemades';

  try {
    const conn = await mongoose.connect(uri, {
      maxPoolSize: 100, // Tuned for high concurrency (~1,000 active users)
      minPoolSize: 10,  // Pre-warmed connection pool
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,        // Use IPv4, skip IPv6 resolution delays
    });

    console.log(`[MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    // Don't crash immediately in dev mode to allow graceful frontend mock fallback
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
