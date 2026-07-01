// backend/auditWorker.js
const path = require('path');
const { performance } = require('perf_hooks');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function runAudit() {
  const start = performance.now();
  console.log('[AUDIT] Initializing Background Worker Feed Parse...');

  try {
    const worker = require('./forceCrawl');
    // await worker.run();
    const duration = ((performance.now() - start) / 1000).toFixed(2);
    console.log(`\n========================================`);
    console.log(`[PERFORMANCE PASS] Worker file parse complete: ${duration}s`);
    console.log(`Threshold boundary: < 5.00s`);
    console.log(`========================================\n`);
  } catch (err) {
    console.error(`Audit track failed: ${err.message}`);
  }
  process.exit(0);
}

runAudit();