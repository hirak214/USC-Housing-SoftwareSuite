import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MongoDB URI not found in environment variables');
  console.log('📝 Please create a .env file with your MongoDB connection string:');
  console.log('   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database');
  console.log('   Or for local MongoDB: MONGODB_URI=mongodb://localhost:27017/guest-card-system');
  throw new Error('Please add your MongoDB URI to environment variables');
}

// Connection options tuned for a serverless host (Vercel) talking to MongoDB
// Atlas over TLS. The defaults are what caused the intermittent
// "Socket 'secureConnect' timed out" errors:
//   - maxIdleTimeMS closes idle sockets before Atlas/NAT silently reaps them,
//     which is what left stale/half-open sockets to be reused after a warm
//     container was frozen and thawed.
//   - serverSelectionTimeoutMS + connectTimeoutMS make a bad connection fail
//     fast (seconds) instead of hanging until the platform kills the request.
//   - retryReads/retryWrites let the driver transparently retry a single
//     operation on a fresh pooled socket if the first one is dead.
const options = {
  maxPoolSize: 10, // cap sockets per warm container so serverless doesn't exhaust Atlas
  minPoolSize: 0,
  maxIdleTimeMS: 60000, // proactively drop idle sockets before they go stale
  serverSelectionTimeoutMS: 8000, // fail fast instead of hanging for minutes
  connectTimeoutMS: 10000, // bound the TLS/connect handshake
  socketTimeoutMS: 45000, // bound a single stalled operation
  retryReads: true,
  retryWrites: true,
};

// Cache the client on the global object so warm serverless invocations (and
// HMR reloads in dev) reuse a single connection pool instead of opening a new
// one per request. We cache the connecting *promise* while it is in flight,
// but drop it the moment it fails — that is the fix for the "poisoned promise"
// bug where a single failed connect used to make every later request in the
// same container re-await the same rejected promise forever.
let cached = global._mongo;
if (!cached) {
  cached = global._mongo = { client: null, promise: null };
}

async function createConnection() {
  const client = new MongoClient(uri, options);
  try {
    await client.connect();
    return client;
  } catch (err) {
    // Tear down the half-open client before letting the caller retry so we
    // don't leak sockets on repeated connection failures.
    await client.close().catch(() => {});
    throw err;
  }
}

export default async function connectToDatabase() {
  // A live client's pool self-heals dead sockets internally, so reuse it.
  if (cached.client) {
    return cached.client;
  }

  if (!cached.promise) {
    cached.promise = createConnection();
  }

  try {
    cached.client = await cached.promise;
    return cached.client;
  } catch (err) {
    // First attempt failed (e.g. a stale socket from a frozen container, or a
    // transient Atlas hiccup). Clear the poisoned promise and give this
    // request one immediate retry with a brand-new client before surfacing
    // the error, so a single blip recovers without the user hitting Refresh.
    cached.promise = createConnection();
    try {
      cached.client = await cached.promise;
      return cached.client;
    } catch (retryErr) {
      cached.promise = null;
      throw retryErr;
    }
  }
}
