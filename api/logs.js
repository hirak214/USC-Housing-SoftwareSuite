import clientPromise from './mongo.js';

export default async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db('guest-card-system');
    const logs = db.collection('logs');

  if (req.method === 'GET') {
    try {
      const allLogs = await logs.find({}).sort({ timestamp: -1 }).toArray();
      return res.status(200).json(allLogs);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
