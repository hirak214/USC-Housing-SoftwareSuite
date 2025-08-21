import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Please set MONGODB_URI environment variable');
  process.exit(1);
}

async function migrateToRelationalSchema() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('guest-card-system');
    const requests = db.collection('requests');
    const cards = db.collection('cards');
    const logs = db.collection('logs');
    const users = db.collection('users');
    const cardHistory = db.collection('card_history');
    
    console.log('🔄 Starting migration to relational schema...\n');
    
    // PHASE 1: Create default admin user
    console.log('1. Creating default admin user...');
    const defaultAdmin = {
      _id: new ObjectId(),
      name: 'System Admin',
      email: 'admin@troycsc.edu',
      role: 'admin',
      createdAt: new Date(),
      isActive: true
    };
    
    await users.updateOne(
      { email: defaultAdmin.email },
      { $setOnInsert: defaultAdmin },
      { upsert: true }
    );
    
    const adminUser = await users.findOne({ email: defaultAdmin.email });
    console.log(`✅ Admin user created: ${adminUser.name} (${adminUser._id})\n`);
    
    // PHASE 2: Enhance requests collection
    console.log('2. Enhancing requests collection...');
    const requestsToUpdate = await requests.find({}).toArray();
    let requestsUpdated = 0;
    
    for (const request of requestsToUpdate) {
      const updateDoc = {};
      
      // Add new fields if they don't exist
      if (!request.email) updateDoc.email = null;
      if (!request.phone) updateDoc.phone = null;
      if (!request.updatedAt) updateDoc.updatedAt = request.createdAt || new Date();
      if (!request.assignedCardId) updateDoc.assignedCardId = null;
      if (!request.processedBy) updateDoc.processedBy = null;
      
      if (Object.keys(updateDoc).length > 0) {
        await requests.updateOne({ _id: request._id }, { $set: updateDoc });
        requestsUpdated++;
      }
    }
    console.log(`✅ Enhanced ${requestsUpdated} requests\n`);
    
    // PHASE 3: Enhance cards collection
    console.log('3. Enhancing cards collection...');
    const cardsToUpdate = await cards.find({}).toArray();
    let cardsUpdated = 0;
    
    for (const card of cardsToUpdate) {
      const updateDoc = {};
      
      // Add new fields
      if (!card.status) {
        updateDoc.status = card.isAssigned ? 'assigned' : 'available';
      }
      if (!card.createdAt) updateDoc.createdAt = card.assignedAt || new Date();
      if (!card.lastUsed) updateDoc.lastUsed = card.assignedAt || new Date();
      if (!card.currentRequestId) updateDoc.currentRequestId = null;
      if (card.isActive === undefined) updateDoc.isActive = true;
      
      if (Object.keys(updateDoc).length > 0) {
        await cards.updateOne({ _id: card._id }, { $set: updateDoc });
        cardsUpdated++;
      }
    }
    console.log(`✅ Enhanced ${cardsUpdated} cards\n`);
    
    // PHASE 4: Link cards to requests (where possible)
    console.log('4. Linking cards to requests...');
    let linksCreated = 0;
    
    const assignedCards = await cards.find({ isAssigned: true }).toArray();
    for (const card of assignedCards) {
      if (card.assignedTo && !card.currentRequestId) {
        // Try to find a completed request with matching name
        const matchingRequest = await requests.findOne({
          name: card.assignedTo,
          status: { $in: ['completed', 'pending'] }
        });
        
        if (matchingRequest) {
          // Link card to request
          await cards.updateOne(
            { _id: card._id },
            { $set: { currentRequestId: matchingRequest._id } }
          );
          
          // Update request with card reference
          await requests.updateOne(
            { _id: matchingRequest._id },
            { 
              $set: { 
                assignedCardId: card._id,
                status: 'assigned',
                processedBy: adminUser._id
              } 
            }
          );
          
          linksCreated++;
        }
      }
    }
    console.log(`✅ Created ${linksCreated} card-request links\n`);
    
    // PHASE 5: Enhance logs collection
    console.log('5. Enhancing logs collection...');
    const logsToUpdate = await logs.find({}).toArray();
    let logsUpdated = 0;
    
    for (const log of logsToUpdate) {
      const updateDoc = {};
      
      // Find corresponding card by cardNumber
      if (log.cardNumber && !log.cardId) {
        const correspondingCard = await cards.findOne({ cardNumber: log.cardNumber });
        if (correspondingCard) {
          updateDoc.cardId = correspondingCard._id;
          
          // Try to find corresponding request
          if (correspondingCard.currentRequestId) {
            updateDoc.requestId = correspondingCard.currentRequestId;
          }
        }
      }
      
      // Add new fields
      if (!log.userId) updateDoc.userId = adminUser._id; // Default to admin
      if (!log.details) updateDoc.details = 'Migrated from legacy system';
      if (!log.previousStatus) updateDoc.previousStatus = null;
      if (!log.newStatus) {
        updateDoc.newStatus = log.action === 'assigned' ? 'assigned' : 'available';
      }
      
      if (Object.keys(updateDoc).length > 0) {
        await logs.updateOne({ _id: log._id }, { $set: updateDoc });
        logsUpdated++;
      }
    }
    console.log(`✅ Enhanced ${logsUpdated} logs\n`);
    
    // PHASE 6: Create card history from existing data
    console.log('6. Creating card history records...');
    let historyRecordsCreated = 0;
    
    const assignmentLogs = await logs.find({ action: 'assigned' }).toArray();
    for (const assignLog of assignmentLogs) {
      if (assignLog.cardId) {
        // Look for corresponding unassign log
        const unassignLog = await logs.findOne({
          cardId: assignLog.cardId,
          action: 'unassigned',
          timestamp: { $gt: assignLog.timestamp }
        });
        
        const historyRecord = {
          cardId: assignLog.cardId,
          requestId: assignLog.requestId,
          assignedAt: assignLog.timestamp,
          returnedAt: unassignLog ? unassignLog.timestamp : null,
          assignedBy: assignLog.user || 'System Admin',
          returnedBy: unassignLog ? unassignLog.user : null,
          durationHours: unassignLog ? 
            Math.round((unassignLog.timestamp - assignLog.timestamp) / (1000 * 60 * 60)) : 
            null
        };
        
        await cardHistory.insertOne(historyRecord);
        historyRecordsCreated++;
      }
    }
    console.log(`✅ Created ${historyRecordsCreated} card history records\n`);
    
    // PHASE 7: Create indexes for better performance
    console.log('7. Creating database indexes...');
    await Promise.all([
      requests.createIndex({ status: 1 }),
      requests.createIndex({ assignedCardId: 1 }),
      requests.createIndex({ createdAt: -1 }),
      cards.createIndex({ cardNumber: 1 }, { unique: true }),
      cards.createIndex({ status: 1 }),
      cards.createIndex({ currentRequestId: 1 }),
      logs.createIndex({ cardId: 1 }),
      logs.createIndex({ requestId: 1 }),
      logs.createIndex({ userId: 1 }),
      logs.createIndex({ timestamp: -1 }),
      cardHistory.createIndex({ cardId: 1 }),
      cardHistory.createIndex({ assignedAt: -1 }),
      users.createIndex({ email: 1 }, { unique: true })
    ]);
    console.log('✅ Database indexes created\n');
    
    // MIGRATION SUMMARY
    console.log('🎉 MIGRATION COMPLETE!\n');
    console.log('📊 Summary:');
    console.log(`   • ${requestsUpdated} requests enhanced`);
    console.log(`   • ${cardsUpdated} cards enhanced`);
    console.log(`   • ${linksCreated} card-request relationships created`);
    console.log(`   • ${logsUpdated} logs enhanced`);
    console.log(`   • ${historyRecordsCreated} history records created`);
    console.log(`   • 1 admin user created`);
    console.log(`   • Database indexes created for performance\n`);
    
    console.log('✅ All existing data preserved and enhanced!');
    console.log('✅ New relational structure is ready for use!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateToRelationalSchema()
    .then(() => {
      console.log('Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export default migrateToRelationalSchema;
