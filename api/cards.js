import clientPromise from './mongo.js';
import { ObjectId } from 'mongodb';

export default async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db('guest-card-system');
    const cards = db.collection('cards');
    const logs = db.collection('logs');

  if (req.method === 'POST') {
    if (req.query.action === 'assign') {
      // Assign card
      try {
        const { cardNumber, userName, requestId, userEmail, userPhone } = req.body;
        if (!cardNumber || !userName) {
          return res.status(400).json({ error: 'Card number and user name are required' });
        }
        // Check if card is already assigned
        const existingCard = await cards.findOne({ cardNumber });
        if (existingCard && existingCard.isAssigned) {
          return res.status(400).json({ error: 'Card already assigned' });
        }
        // Create or update card
        let card;
        if (existingCard) {
          await cards.updateOne(
            { cardNumber },
            {
              $set: {
                assignedTo: userName,
                assignedAt: new Date(),
                isAssigned: true,
              },
            }
          );
          card = await cards.findOne({ cardNumber });
        } else {
          const doc = {
            cardNumber,
            assignedTo: userName,
            assignedAt: new Date(),
            isAssigned: true,
          };
          await cards.insertOne(doc);
          card = doc;
        }
        // Update request status if requestId provided
        if (requestId) {
          await db.collection('requests').updateOne(
            { _id: new ObjectId(requestId) },
            { $set: { status: 'completed' } }
          );
        }
        // Create unique user identifier
        const userIdentifier = userEmail ? `${userName} (${userEmail})` : 
                              userPhone ? `${userName} (${userPhone})` : 
                              userName;
        
        // Log
        await logs.insertOne({
          action: 'assigned',
          cardNumber,
          user: userName,
          userIdentifier,
          userEmail: userEmail || null,
          userPhone: userPhone || null,
          requestId: requestId || null,
          timestamp: new Date(),
        });
        return res.status(200).json({ card, message: 'Card assigned successfully' });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    } else if (req.query.action === 'unassign') {
      // Unassign card
      try {
        const { cardNumber } = req.body;
        if (!cardNumber) {
          return res.status(400).json({ error: 'Card number is required' });
        }
        const card = await cards.findOne({ cardNumber });
        if (!card || !card.isAssigned) {
          return res.status(400).json({ error: 'Card is not currently assigned' });
        }
        const userName = card.assignedTo;
        
        // Find the most recent assignment log to get user details
        const assignmentLog = await logs.findOne(
          { cardNumber, action: 'assigned' },
          { sort: { timestamp: -1 } }
        );
        
        await cards.updateOne(
          { cardNumber },
          {
            $set: {
              assignedTo: null,
              assignedAt: null,
              isAssigned: false,
            },
          }
        );
        
        // Log with user details from assignment
        await logs.insertOne({
          action: 'unassigned',
          cardNumber,
          user: userName,
          userIdentifier: assignmentLog?.userIdentifier || userName,
          userEmail: assignmentLog?.userEmail || null,
          userPhone: assignmentLog?.userPhone || null,
          requestId: assignmentLog?.requestId || null,
          timestamp: new Date(),
        });
        return res.status(200).json({ message: 'Card returned successfully' });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
  } else if (req.method === 'GET') {
    // GET /api/cards?cardNumber=...
    try {
      const { cardNumber } = req.query;
      if (!cardNumber) {
        return res.status(400).json({ error: 'Card number is required' });
      }
      const card = await cards.findOne({ cardNumber });
      if (!card) {
        return res.status(200).json({ exists: false, isAssigned: false });
      }
      return res.status(200).json({ exists: true, ...card });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
