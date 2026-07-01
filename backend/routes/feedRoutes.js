// routes/feedRoutes.js
const express = require('express');
const router = express.Router();
const { runIngestionPipeline } = require('../services/pipelineOrchestrator');
const { protectAdminRoute } = require('../services/authMiddleware');

/**
 * @route   POST /api/v1/feed/refresh
 * @desc    Manually force a real-time ingestion cycle across target publishers
 * @access  Private (Administrators Only)
 */
router.post('/refresh', protectAdminRoute, async (req, res) => {
  try {
    // 1. Extract optional priority sorting flags from payload stream
    const { priority = 'high' } = req.body;

    if (!['high', 'standard', 'low'].includes(priority.toLowerCase())) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid priority tier parameter designated.'
      });
    }

    console.log(`[MANUAL TRIGGER] Admin user ${req.adminUser.email} initiated an immediate sync for tier: ${priority}`);
    // but running it inline allows us to report results directly to the admin panel.
    await runIngestionPipeline(priority.toLowerCase());

    res.status(200).json({
      status: 'success',
      message: `Ingestion cycle swept and compiled successfully for priority tier: ${priority}`
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