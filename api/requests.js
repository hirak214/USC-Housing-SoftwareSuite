import clientPromise from './mongo.js';
import { ObjectId } from 'mongodb';

export default async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db('guest-card-system');
    const collection = db.collection('requests');

  if (req.method === 'GET') {
    // GET /api/requests?pending=true or /api/requests?id=...
    if (req.query && req.query.id) {
      // Get by ID
      try {
        const request = await collection.findOne({ _id: new ObjectId(req.query.id) });
        if (!request) {
          return res.status(404).json({ error: 'Request not found' });
        }
        return res.status(200).json(request);
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    } else if (req.query && req.query.pending === 'true') {
      // Get all pending
      try {
        const requests = await collection.find({ status: 'pending' }).sort({ createdAt: -1 }).toArray();
        return res.status(200).json(requests);
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    } else {
      // Get all
      try {
        const requests = await collection.find({}).sort({ createdAt: -1 }).toArray();
        return res.status(200).json(requests);
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }
  } else if (req.method === 'POST') {
    // POST /api/requests { name }
    try {
      const { name } = req.body;
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name is required' });
      }
      const doc = {
        name: name.trim(),
        status: 'pending',
        createdAt: new Date(),
      };
      const result = await collection.insertOne(doc);
      return res.status(201).json({ ...doc, _id: result.insertedId });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PUT') {
    // PUT /api/requests?id=... { status }
    try {
      const { status } = req.body;
      if (!req.query || !req.query.id) {
        return res.status(400).json({ error: 'Request id is required' });
      }
      const result = await collection.updateOne(
        { _id: new ObjectId(req.query.id) },
        { $set: { status } }
      );
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Request not found' });
      }
      return res.status(200).json({ message: 'Request updated' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
