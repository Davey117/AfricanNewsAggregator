const express = require('express');
const router = express.Router();
const { Category } = require('../models');

/**
 * @route   GET /api/v1/categories
 * @desc    Fetch the list of active educational news categories
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select('name slug description')
      .sort('name')
      .lean();

    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: { categories }
    });
  } catch (error) {
    console.error(`[CATEGORY ROUTE ERROR] Failed to retrieve categories: ${error.message}`);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve category list.' });
  }
});

module.exports = router;
