const path = require('path');
const mongoose = require('mongoose');
const { Source, Article } = require('./models');
const { ingestFromSource } = require('./services/ingestionEngine');

require('dotenv').config({ path: path.join(__dirname, '.env') });

async function backfillArticleImages() {
  const connectionUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!connectionUri) {
    throw new Error('Missing MONGODB_URI (or MONGO_URI) in environment.');
  }

  await mongoose.connect(connectionUri);

  const beforeTotal = await Article.countDocuments({});
  const beforeWithImage = await Article.countDocuments({ imageUrl: { $type: 'string', $ne: '' } });

  const activeSources = await Source.find({ isActive: true }).lean();

  console.log(`[BACKFILL] Active sources: ${activeSources.length}`);
  console.log(`[BACKFILL] Before: ${beforeWithImage}/${beforeTotal} articles have images.`);

  let sourceSuccess = 0;
  let sourceFailed = 0;
  let attemptedUpdates = 0;
  let modifiedUpdates = 0;

  for (const source of activeSources) {
    try {
      const candidates = await ingestFromSource(source);
      const imageCandidates = candidates.filter(item => item && item.url && item.imageUrl);

      if (imageCandidates.length === 0) {
        console.log(`[BACKFILL] ${source.name}: no image candidates.`);
        sourceSuccess += 1;
        continue;
      }

      const operations = imageCandidates.map(item => ({
        updateOne: {
          filter: {
            url: item.url,
            $or: [
              { imageUrl: null },
              { imageUrl: '' },
              { imageUrl: { $exists: false } }
            ]
          },
          update: {
            $set: { imageUrl: item.imageUrl }
          }
        }
      }));

      const result = await Article.bulkWrite(operations, { ordered: false });

      attemptedUpdates += operations.length;
      modifiedUpdates += result.modifiedCount || 0;
      sourceSuccess += 1;

      console.log(`[BACKFILL] ${source.name}: candidates=${imageCandidates.length}, modified=${result.modifiedCount || 0}`);
    } catch (error) {
      sourceFailed += 1;
      console.log(`[BACKFILL] ${source.name}: failed -> ${error.message}`);
    }
  }

  const afterTotal = await Article.countDocuments({});
  const afterWithImage = await Article.countDocuments({ imageUrl: { $type: 'string', $ne: '' } });

  console.log('');
  console.log('[BACKFILL SUMMARY]');
  console.log(`Sources success: ${sourceSuccess}`);
  console.log(`Sources failed: ${sourceFailed}`);
  console.log(`Article updates attempted: ${attemptedUpdates}`);
  console.log(`Article updates modified: ${modifiedUpdates}`);
  console.log(`Coverage before: ${beforeWithImage}/${beforeTotal} (${beforeTotal ? ((beforeWithImage / beforeTotal) * 100).toFixed(1) : '0.0'}%)`);
  console.log(`Coverage after: ${afterWithImage}/${afterTotal} (${afterTotal ? ((afterWithImage / afterTotal) * 100).toFixed(1) : '0.0'}%)`);
}

backfillArticleImages()
  .catch(error => {
    console.error('[BACKFILL ERROR]', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch (error) {
      // Ignore disconnect errors during teardown.
    }
  });
