import mongoose from 'mongoose';

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/broadstreet-publishing';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Connection options for optimal performance
const connectionOptions = {
  bufferCommands: false,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true,
  retryReads: true
};

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
declare global {
  var mongoose: {
    conn: any | null;
    promise: Promise<any> | null;
  };
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, connectionOptions);
  }

  try {
    cached.conn = await cached.promise;
    
    // Set up connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected successfully');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
  } catch (e) {
    cached.promise = null;
    console.error('Failed to connect to MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

// Database health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await dbConnect();
        if (!mongoose.connection.db) {
      throw new Error('Database connection is not established.');
    }
    const adminDb = mongoose.connection.db.admin();
    await adminDb.ping();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Initialize database with indexes
export async function initializeDatabase(): Promise<void> {
  try {
    await dbConnect();
    
    // Import models to ensure indexes are created
    await import('../models/Network');
    await import('../models/Advertiser');
    await import('../models/campaign');
    await import('../models/Advertisement');
    await import('../models/Zone');
    await import('../models/SyncMetadata');
    
    console.log('Database initialized with all indexes');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Check if database is empty (for initialization detection)
export async function isDatabaseEmpty(): Promise<boolean> {
  try {
    await dbConnect();
        if (!mongoose.connection.db) {
      throw new Error('Database connection is not established.');
    }
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    // Check if any of our main collections have data
    const mainCollections = ['networks', 'campaigns', 'advertisers'];
    for (const collectionInfo of collections) {
      if (mainCollections.includes(collectionInfo.name)) {
        const collection = mongoose.connection.db.collection(collectionInfo.name);
        const count = await collection.countDocuments();
        if (count > 0) {
          return false;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error checking if database is empty:', error);
    return true; // Assume empty on error to trigger initialization
  }
}

export default dbConnect;
