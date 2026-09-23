import connectToDatabase from './mongo.js';
import { ObjectId } from 'mongodb';

// Persists processed USC Package Auditor runs — raw rows only (no PDF).
// The saved rows are the same array-of-arrays the DataTable renders, so a run
// can be re-opened online and printed from the stored values.
export default async (req, res) => {
  try {
    const client = await connectToDatabase();
    const db = client.db('guest-card-system');
    const collection = db.collection('audit-runs');

    if (req.method === 'GET') {
      // GET /api/audit-runs?id=... -> full run (includes rows)
      if (req.query && req.query.id) {
        try {
          const run = await collection.findOne({ _id: new ObjectId(req.query.id) });
          if (!run) {
            return res.status(404).json({ error: 'Audit run not found' });
          }
          return res.status(200).json(run);
        } catch (error) {
          return res.status(500).json({ error: error.message });
        }
      } else {
        // List (metadata only — exclude the heavy rows payload)
        try {
          const runs = await collection
            .find({}, { projection: { rows: 0 } })
            .sort({ createdAt: -1 })
            .toArray();
          return res.status(200).json(runs);
        } catch (error) {
          return res.status(500).json({ error: error.message });
        }
      }
    } else if (req.method === 'POST') {
      // POST /api/audit-runs { fileName, rows }
      try {
        const { fileName, rows } = req.body;

        if (!Array.isArray(rows) || rows.length === 0) {
          return res.status(400).json({ error: 'No processed rows to save' });
        }

        const header = Array.isArray(rows[0]) ? rows[0] : [];
        const doc = {
          fileName: (fileName && String(fileName).trim()) || 'Untitled',
          rows,
          rowCount: Math.max(rows.length - 1, 0),
          columnCount: header.length,
          createdAt: new Date(),
        };

        const result = await collection.insertOne(doc);
        return res.status(201).json({ ...doc, _id: result.insertedId });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    } else if (req.method === 'DELETE') {
      // DELETE /api/audit-runs?id=...
      try {
        if (!req.query || !req.query.id) {
          return res.status(400).json({ error: 'Run id is required' });
        }
        const result = await collection.deleteOne({ _id: new ObjectId(req.query.id) });
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: 'Audit run not found' });
        }
        return res.status(200).json({ message: 'Audit run deleted' });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
