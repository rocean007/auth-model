import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
let client;
let clientPromise;

if (!uri) throw new Error('Please add MONGODB_URI to .env');

async function getClient() {
  const c = new MongoClient(uri);
  await c.connect();

  // Auto-delete unverified users when their otpExpiry time passes
  await c.db().collection('users').createIndex(
    { otpExpiry: 1 },
    {
      expireAfterSeconds: 0,
      partialFilterExpression: { verified: false },
      background: true,
    }
  );
  return c;
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = getClient();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // ── FIX: cache in production too ──
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = getClient();
  }
  clientPromise = global._mongoClientPromise;
}

export default clientPromise;