// services/scheduler.js
const cron = require('node-cron');
const { runIngestionPipeline } = require('./pipelineOrchestrator');

/**
 * SCHEDULER INITIALIZATION ENGINE
 * Connects expressions natively to isolated priority boundaries.
 */
function initScheduler() {
  console.log('[SCHEDULER SERVICE] Ingestion engine worker tasks mounting...');

  // 1. High-Priority Ingestion Task: Fires every 30 minutes
  // Expression layout: minute 0 and 30 of every hour
  cron.schedule('0,30 * * * *', async () => {
    console.log('[CRON ACTION] High-priority automation trigger executing...');
    await runIngestionPipeline('high');
  });

  // 2. Standard-Priority Ingestion Task: Fires every 2 hours
  // Expression layout: top of the hour, every second hour block
  cron.schedule('0 */2 * * *', async () => {
    console.log('[CRON ACTION] Standard-priority automation trigger executing...');
    await runIngestionPipeline('standard');
  });

  // 3. Low-Priority Ingestion Task: Fires every 6 hours
  // Expression layout: minute 0, hour 0, 6, 12, 18 every single day
  cron.schedule('0 */6 * * *', async () => {
    console.log('[CRON ACTION] Low-priority automation trigger executing...');
    await runIngestionPipeline('low');
  });

  console.log('[SCHEDULER SUCCESS] Automatic process tracking expressions mounted securely.');
}

module.exports = {
  initScheduler
};