// services/pipelineOrchestrator.js
const { Source, Article, FeedLog } = require('../models');
const { ingestFromSource } = require('./ingestionEngine');
const { isDuplicate } = require('./deduplication');
const { categorizeArticle } = require('./categorization');

async function runIngestionPipeline(priorityFilter = null) {
  const timestamp = new Date();
  console.log(`\n[PIPELINE START] Ingestion loop initiated at ${timestamp.toISOString()}`);

  try {
    const query = { isActive: true };
    if (priorityFilter) query.priority = priorityFilter;

    const activeSources = await Source.find(query);
    console.log(`[PIPELINE] Found ${activeSources.length} active sources matching target criteria.`);

    for (const source of activeSources) {
      let candidateArticles = [];
      let savedCount = 0;
      let executionSuccess = false;
      let finalErrorMsg = "";

      // Definitive Strategy Fallback Chain Core Array Matrix
      const strategyQueue = ['rss', 'scrape-static', 'scrape-dynamic'];
      
      // Override the queue if a source specifically demands an explicit configuration path
      const activeStrategies = source.feedType && strategyQueue.includes(source.feedType) 
        ? [source.feedType, ...strategyQueue.filter(s => s !== source.feedType)]
        : strategyQueue;

      console.log(`\n[STRATEGY ENGINE] Executing fallback pipeline queue for: ${source.name}`);

      for (const strategy of activeStrategies) {
        try {
          console.log(`   -> Attempting strategy layer: [${strategy}]`);
          
          // Temporary override to test the execution vector natively
          const runtimeSourceMock = { ...source._doc, feedType: strategy };
          
          // Adjust target feed URL structures for HTML scraping fallbacks gracefully
          if (strategy !== 'rss') {
            runtimeSourceMock.feedUrl = source.siteUrl; 
          }

          candidateArticles = await ingestFromSource(runtimeSourceMock);
          
          if (candidateArticles && candidateArticles.length > 0) {
            executionSuccess = true;
            console.log(`   ✅ Layer [${strategy}] pulled ${candidateArticles.length} candidate documents successfully.`);
            break; // Break the strategy loop immediately since we found valid items
          }
        } catch (strategyError) {
          console.log(`   ⚠️ Layer [${strategy}] failed: ${strategyError.message}`);
          finalErrorMsg = strategyError.message;
        }
      }

      if (!executionSuccess) {
        console.error(`❌ [PIPELINE CRITICAL SOURCE FAILURE] All strategy fallbacks exhausted for ${source.name}`);
        await new FeedLog({
          sourceId: source._id,
          articlesFound: 0,
          status: 'error',
          errorMsg: `All tiers failed. Last error: ${finalErrorMsg}`
        }).save();
        continue; // Advance to the next active database source element safely
      }

      // Process collected candidate elements sequentially
      try {
        for (const candidate of candidateArticles) {
          const duplicateCheck = await isDuplicate(candidate);
          if (duplicateCheck) continue;

          const finalCategory = categorizeArticle(candidate.title, candidate.summary, source);

          const newArticle = new Article({
            title: candidate.title,
            summary: candidate.summary || 'No summary available.',
            url: candidate.url,
            sourceId: source._id,
            category: finalCategory,
            country: source.country,
            publishedAt: candidate.publishedAt || new Date()
          });

          await newArticle.save();
          savedCount++;
        }

        await new FeedLog({
          sourceId: source._id,
          articlesFound: savedCount,
          status: 'success'
        }).save();

        source.lastFetchedAt = new Date();
        await source.save();

        console.log(`[PIPELINE SUCCESS] Processed ${source.name}: ${savedCount} new articles written.`);
      } catch (processingError) {
        console.error(`[PROCESSING ERROR] Failed writing entries for ${source.name}: ${processingError.message}`);
      }
    }
    console.log(`\n[PIPELINE COMPLETE] Ingestion cycle wrapped cleanly.\n`);
  } catch (globalError) {
    console.error(`[PIPELINE CRITICAL CRASH] Ingestion routine aborted: ${globalError.message}`);
  }
}

module.exports = { runIngestionPipeline };