const path = require('path');
const mongoose = require('mongoose');
const { Source, Article } = require('./models');
const { ingestFromSource } = require('./services/ingestionEngine');

require('dotenv').config({ path: path.join(__dirname, '.env') });

function isValidDate(value) {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

async function backfillArticleDates() {
  const connectionUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!connectionUri) {
    throw new Error('Missing MONGODB_URI (or MONGO_URI) in environment.');
  }

  await mongoose.connect(connectionUri);

  const activeSources = await Source.find({ isActive: true }).lean();

  let sourceSuccess = 0;
  let sourceFailed = 0;
  let attemptedUpdates = 0;
  let modifiedUpdates = 0;

  for (const source of activeSources) {
    try {
      const candidates = await ingestFromSource(source);
      const datedCandidates = candidates.filter(item => item && item.url && isValidDate(item.publishedAt));

      if (datedCandidates.length === 0) {
        console.log(`[DATE BACKFILL] ${source.name}: no dated candidates.`);
        sourceSuccess += 1;
        continue;
      }

      const operations = datedCandidates.map(item => ({
        updateOne: {
          filter: { url: item.url },
          update: { $set: { publishedAt: item.publishedAt } }
        }
      }));

      const result = await Article.bulkWrite(operations, { ordered: false });

      attemptedUpdates += operations.length;
      modifiedUpdates += result.modifiedCount || 0;
      sourceSuccess += 1;

      console.log(`[DATE BACKFILL] ${source.name}: candidates=${datedCandidates.length}, modified=${result.modifiedCount || 0}`);
    } catch (error) {
      sourceFailed += 1;
      console.log(`[DATE BACKFILL] ${source.name}: failed -> ${error.message}`);
    }
  }

  console.log('');
  console.log('[DATE BACKFILL SUMMARY]');
  console.log(`Sources success: ${sourceSuccess}`);
  console.log(`Sources failed: ${sourceFailed}`);
  console.log(`Date updates attempted: ${attemptedUpdates}`);
  console.log(`Date updates modified: ${modifiedUpdates}`);
}

backfillArticleDates()
  .catch(error => {
    console.error('[DATE BACKFILL ERROR]', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch (error) {
      // Ignore disconnect errors during teardown.
    }
  });
