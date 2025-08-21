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
    // POST /api/requests { firstName, lastName, email, phone } or { name } (backward compatibility)
    try {
      const { firstName, lastName, email, phone, name } = req.body;
      
      let fullName = '';
      let requestEmail = null;
      let requestPhone = null;
      
      if (firstName && lastName) {
        // New format with separate fields
        if (!firstName.trim() || !lastName.trim()) {
          return res.status(400).json({ error: 'First name and last name are required' });
        }
        if (!email || !email.trim()) {
          return res.status(400).json({ error: 'Email is required' });
        }
        if (!phone || !phone.trim()) {
          return res.status(400).json({ error: 'Phone number is required' });
        }
        
        fullName = `${firstName.trim()} ${lastName.trim()}`;
        requestEmail = email.trim();
        requestPhone = phone.trim();
      } else if (name) {
        // Old format for backward compatibility
        if (!name.trim()) {
          return res.status(400).json({ error: 'Name is required' });
        }
        fullName = name.trim();
      } else {
        return res.status(400).json({ error: 'Name or first/last name is required' });
      }
      
      const doc = {
        name: fullName,
        firstName: firstName ? firstName.trim() : null,
        lastName: lastName ? lastName.trim() : null,
        email: requestEmail,
        phone: requestPhone,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedCardId: null,
        processedBy: null
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
  } else if (req.method === 'DELETE') {
    // DELETE /api/requests?id=...
    try {
      if (!req.query || !req.query.id) {
        return res.status(400).json({ error: 'Request id is required' });
      }
      const result = await collection.deleteOne({ _id: new ObjectId(req.query.id) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Request not found' });
      }
      return res.status(200).json({ message: 'Request deleted' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
