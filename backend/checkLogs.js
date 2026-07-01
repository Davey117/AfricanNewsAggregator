// backend/checkLogs.js
const mongoose = require('mongoose');
const { FeedLog, Source } = require('./models'); 
require('dotenv').config();

async function runDiagnostics() {
  try {
    // Modify connection string if your local setup differs
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/news');
    console.log('[DIAGNOSTICS] Connected to Database.');

    console.log('\n--- ACTIVE SOURCES REGISTERED ---');
    const sources = await Source.find();
    if (sources.length === 0) {
      console.log('❌ NO SOURCES FOUND IN DATABASE! Run your seed script.');
    }
    sources.forEach(s => {
      console.log(`- [${s.country}] ${s.name} (Active: ${s.isActive}) -> URL: ${s.feedUrl}`);
    });

    console.log('\n--- LATEST INGESTION PIPELINE LOGS ---');
    const logs = await FeedLog.find().sort({ createdAt: -1 }).limit(10);
    
    if (logs.length === 0) {
      console.log('No telemetry logs found.');
    }

    for (const log of logs) {
      const sourceObj = await Source.findById(log.sourceId);
      const sourceName = sourceObj ? sourceObj.name : 'Unknown Source';
      console.log(`\nSource: ${sourceName}`);
      console.log(`Status: ${log.status === 'success' ? '✅ SUCCESS' : '❌ ERROR'}`);
      console.log(`Articles Found & Written: ${log.articlesFound}`);
      if (log.errorMsg) {
        console.log(`Error Trace: "${log.errorMsg}"`);
      }
    }

  } catch (err) {
    console.error('Diagnostics failed:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runDiagnostics();