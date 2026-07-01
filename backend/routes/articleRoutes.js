// routes/articleRoutes.js
const express = require('express');
const router = express.Router();
const { Article } = require('../models');

/**
 * @route   GET /api/v1/articles
 * @desc    Fetch a paginated feed of normalized articles with dynamic criteria filtering
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // 1. Destructure query parameters with fallback conditions
    const { category, country, search, page = 1, limit = 20 } = req.query;
    
    // Parse pagination bounds safely into absolute base-10 integers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skipNum = (pageNum - 1) * limitNum;

    // 2. Build the dynamic MongoDB query vector object
    const mongoQuery = {};

    if (category) {
      mongoQuery.category = category.trim();
    }

    if (country) {
      mongoQuery.country = country.trim().toUpperCase();
    }

    if (search) {
      // Leverages the pre-compiled compound text index for keyword scoring
      mongoQuery.$text = { $search: search.trim() };
    }

    // 3. Execute database fetch transactions concurrently
    // Uses .lean() for high throughput performance optimization
    const [articles, totalDocuments] = await Promise.all([
      Article.find(mongoQuery)
        .select('-__v') // Strip internal version tags
        .sort(search ? { score: { $meta: 'textScore' } } : { publishedAt: -1 })
        .skip(skipNum)
        .limit(limitNum)
        .populate('sourceId', 'name siteUrl') // Join publisher details seamlessly
        .lean(),
      Article.countDocuments(mongoQuery)
    ]);

    // 4. Return formatted response tracking metadata boundaries
    res.status(200).json({
      status: 'success',
      results: articles.length,
      pagination: {
        totalArticles: totalDocuments,
        totalPages: Math.ceil(totalDocuments / limitNum),
        currentPage: pageNum,
        limit: limitNum
      },
      data: { articles }
    });

  } catch (error) {
    console.error(`[API ROUTE ERROR] Articles retrieval failure: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve educational news feed records.'
    });
  }
});

/**
 * @route   GET /api/v1/articles/:id
 * @desc    Fetch a single detailed article record by its absolute ObjectId reference
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('sourceId', 'name siteUrl country')
      .lean();

    if (!article) {
      return res.status(404).json({
        status: 'fail',
        message: 'The requested educational article record was not found.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { article }
    });

  } catch (error) {
    console.error(`[API ROUTE ERROR] Single item fetch failure: ${error.message}`);
    // Handle invalid cast format execution blocks cleanly
    if (error.name === 'CastError') {
      return res.status(400).json({ status: 'error', message: 'Malformed resource ID format reference.' });
    }
    res.status(500).json({ status: 'error', message: 'Internal server configuration processing failure.' });
  }
});

/**
 * @route   GET /api/v1/articles/sources
 * @desc    Fetch a list of all active educational news targets for frontend dropdown menus
 * @access  Public
 */
router.get('/meta/sources', async (req, res) => {
  try {
    const { Source } = require('../models'); // Lazy load to prevent file looping
    const sources = await Source.find({ isActive: true }).select('name siteUrl country defaultCategory').lean();
    
    res.status(200).json({
      status: 'success',
      results: sources.length,
      data: { sources }
    });
  } catch (error) {
    console.error(`[API ROUTE ERROR] Sources meta fetch failure: ${error.message}`);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve media sources.' });
  }
});

/**
 * @route   GET /api/v1/articles/meta/status
 * @desc    Fetch the operational state and last sync timestamp of the ingestion engine
 * @access  Public
 */
router.get('/meta/status', async (req, res) => {
  try {
    const { FeedLog } = require('../models');
    // Grab the absolute newest log entry committed by the cron orchestrator
    const lastLog = await FeedLog.findOne().sort({ fetchedAt: -1 }).lean();

    res.status(200).json({
      status: 'success',
      data: {
        lastSyncCheck: lastLog ? lastLog.fetchedAt : null,
        lastExecutionStatus: lastLog ? lastLog.status : 'idle',
        msg: 'Ingestion background worker running normally.'
      }
    });
  } catch (error) {
    console.error(`[API ROUTE ERROR] Telemetry meta fetch failure: ${error.message}`);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve system status.' });
  }
});

module.exports = router;