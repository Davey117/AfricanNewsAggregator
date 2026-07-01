// forceCrawl.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const { runIngestionPipeline } = require('./services/pipelineOrchestrator');

// Set interval duration: 30 minutes (30 * 60 * 1000 milliseconds)
const REFRESH_INTERVAL = 30 * 60 * 1000;

async function executePipelineCycle() {
  try {
    console.log(`\n[AUTOMATION] Synchronizing database tracking records with external news nodes...`);
    // Sweep all tiers so standard/low sources are not starved.
    for (const tier of ['high', 'standard', 'low']) {
      console.log(`[AUTOMATION] Running ingestion tier: ${tier}`);
      await runIngestionPipeline(tier);
    }
    console.log(`[AUTOMATION] Synchronization cycle complete. Going to sleep for 30 minutes...`);
  } catch (error) {
    console.error(`[AUTOMATION CRITICAL ERROR] Run cycle encountered a break:`, error);
  }
}

// Instantiate permanent database lifecycle pipeline
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('[AUTOMATION INITIALIZED] Connected securely to cluster tracking database.');
    console.log(`[AUTOMATION INITIALIZED] Background daemon active. Re-polling every 30 minutes.`);

    // 1. Execute immediately on launch so your dashboard isn't left empty on app restarts
    await executePipelineCycle();

    // 2. Schedule the pipeline to repeat seamlessly in the background 
    setInterval(async () => {
      await executePipelineCycle();
    }, REFRESH_INTERVAL);
  })
  .catch(err => {
    console.error('[AUTOMATION CRITICAL CRASH] Database connection refused:', err);
    process.exit(1);
  });