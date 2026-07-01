// routes/feedRoutes.js
const express = require('express');
const router = express.Router();
const { runIngestionPipeline } = require('../services/pipelineOrchestrator');
const { protectAdminRoute } = require('../services/authMiddleware');
const { Source } = require('../models');

/**
 * @route   GET /api/v1/feed
 * @desc    Fetch all active source registries for the admin dashboard
 * @access  Private (Administrators Only)
 */
router.get('/', protectAdminRoute, async (req, res) => {
  try {
    const sources = await Source.find({}).sort({ createdAt: -1 }).lean();
    res.status(200).json({
      status: 'success',
      data: { sources }
    });
  } catch (error) {
    console.error(`[FEED ROUTE ERROR] Source fetch failed: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve source registry records.'
    });
  }
});

/**
 * @route   POST /api/v1/feed
 * @desc    Add a news source registry entry
 * @access  Private (Administrators Only)
 */
router.post('/', protectAdminRoute, async (req, res) => {
  try {
    const source = await Source.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { source }
    });
  } catch (error) {
    console.error(`[FEED ROUTE ERROR] Source creation failed: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create source registry entry.'
    });
  }
});

/**
 * @route   DELETE /api/v1/feed/:id
 * @desc    Remove a source registry entry
 * @access  Private (Administrators Only)
 */
router.delete('/:id', protectAdminRoute, async (req, res) => {
  try {
    const source = await Source.findByIdAndDelete(req.params.id);
    if (!source) {
      return res.status(404).json({ status: 'fail', message: 'Source not found.' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Source deleted successfully.'
    });
  } catch (error) {
    console.error(`[FEED ROUTE ERROR] Source deletion failed: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete source registry entry.'
    });
  }
});

/**
 * @route   POST /api/v1/feed/refresh
 * @desc    Manually force a real-time ingestion cycle across target publishers
 * @access  Private (Administrators Only)
 */
router.post('/refresh', protectAdminRoute, async (req, res) => {
  try {
    // 1. Extract optional priority sorting flags from payload stream
    const { priority = 'all' } = req.body;
    const normalizedPriority = String(priority).toLowerCase();

    if (!['all', 'high', 'standard', 'low'].includes(normalizedPriority)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid priority tier parameter designated.'
      });
    }

    console.log(`[MANUAL TRIGGER] Admin user ${req.adminUser.email} initiated an immediate sync for tier: ${normalizedPriority}`);

    if (normalizedPriority === 'all') {
      for (const tier of ['high', 'standard', 'low']) {
        await runIngestionPipeline(tier);
      }
    } else {
      await runIngestionPipeline(normalizedPriority);
    }

    res.status(200).json({
      status: 'success',
      message: `Ingestion cycle swept and compiled successfully for priority tier: ${normalizedPriority}`
    });

  } catch (error) {
    console.error(`[MANUAL REFRESH CRASH] Admin trigger failed: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to complete real-time database synchronization.'
    });
  }
});

module.exports = router;