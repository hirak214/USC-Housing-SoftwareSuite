import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!uri) {
  console.error('❌ MongoDB URI not found in environment variables');
  console.log('📝 Please create a .env file with your MongoDB connection string:');
  console.log('   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database');
  console.log('   Or for local MongoDB: MONGODB_URI=mongodb://localhost:27017/guest-card-system');
  throw new Error('Please add your MongoDB URI to environment variables');
}

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production/Vercel, create a new connection for each function
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
