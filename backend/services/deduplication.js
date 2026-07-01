// services/deduplication.js
const { Article } = require('../models');

/**
 * HELPER: LEVENSHTEIN DISTANCE ALGORITHM
 * Computes the minimum number of single-character edits required to change 
 * string 'a' into string 'b'. Time Complexity: O(M * N)
 */
function getLevenshteinDistance(a, b) {
  const matrix = [];

  // Initialize matrix boundaries
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  // Compute edit costs matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]; // No edit needed
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // Substitution
          matrix[i][j - 1] + 1,     // Insertion
          matrix[i - 1][j] + 1      // Deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * TWO-LEVEL DEDUPLICATION ENGINE
 * Evaluates an incoming article candidate against database constraints and historical titles.
 * @returns {Promise<boolean>} True if it is a duplicate and should be dropped; False if unique.
 */
async function isDuplicate(candidateArticle) {
  const { url, title } = candidateArticle;

 // LEVEL 1: PRIMARY CANONICAL URL CHECK
  try {
    const existingUrl = await Article.findOne({ url: url.trim() }).select('_id').lean();
    if (existingUrl) {
      console.log(`[DEDUPLICATION L1] Dropped duplicate URL boundary: ${url}`);
      return true; // Match found at Gate 1
    }
  } catch (error) {
    console.error(`[DEDUPLICATION ERROR] L1 Lookup Exception: ${error.message}`);
    // Defensive posture: if DB check errors out, treat as risky to avoid unique collisions
    return true; 
  }

  // LEVEL 2: ROLLING 48-HOUR TITLE VARIANCE CHECK
  try {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    
    // Fetch titles from the past 48 hours for local distance evaluation
    const recentArticles = await Article.find({
      scrapedAt: { $gte: fortyEightHoursAgo }
    }).select('title').lean();

    const normalizedCandidateTitle = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

    for (const recent of recentArticles) {
      const normalizedRecentTitle = recent.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
      
      // Calculate character edit distance variance
      const editDistance = getLevenshteinDistance(normalizedCandidateTitle, normalizedRecentTitle);
      
      if (editDistance < 5) {
        console.log(`[DEDUPLICATION L2] Rejected republication variant.`);
        console.log(` -> Incoming: "${title}"`);
        console.log(` -> Matched:  "${recent.title}" (Distance: ${editDistance})`);
        return true; // Content matched at Gate 2
      }
    }
  } catch (error) {
    console.error(`[DEDUPLICATION ERROR] L2 Lookup Exception: ${error.message}`);
    return false;
  }

  // Clear through both levels cleanly
  return false;
}

module.exports = {
  isDuplicate
};