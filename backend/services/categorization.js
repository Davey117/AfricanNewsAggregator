// services/categorization.js

/**
 * THEMATIC CATEGORIES DICTIONARY
 * Curated keywords mapping directly to West African and international news domains.
 */
const CATEGORIES_DICTIONARY = {
  'Policy and Governance': [
    'policy', 'governance', 'ministry', 'regulation', 'reform', 'mandate', 
    'jamb', 'nuc', 'waec', 'neco', 'asuu', 'government', 'strike', 'gazette',
    'parliament', 'senate', 'legislation', 'parliamentary', 'bureaucracy'
  ],
  'Institutional Funding': [
    'scholarship', 'bursary', 'grant', 'funding', 'fellowship', 'financial aid', 
    'tetfund', 'endowment', 'tuition relief', 'donor', 'budget', 'allocation'
  ],
  'Higher Education': [
    'university', 'polytechnic', 'undergraduate', 'postgraduate', 'convocation', 
    'matriculation', 'vc', 'vice chancellor', 'campus', 'degree', 'varsity', 'lecturer'
  ],
  'Sports': [
    'sport', 'sports', 'football', 'soccer', 'match', 'chelsea', 'arsenal', 'manchester',
    'caf', 'fifa', 'afcon', 'athletics', 'stadium', 'coach', 'trophy', 'super eagles',
    'black stars', 'harambee stars', 'npfl', 'league', 'tournament', 'cup', 'goal',
    'striker', 'training', 'winger', 'referee', 'championship', 'olympics', 'derby'
  ]
};

/**
 * RULE-BASED CATEGORIZATION ENGINE
 * Tokenizes, normalizes, and assigns thematic domains to ingested content items.
 * @param {string} title - The article headline.
 * @param {string} summary - The raw snippet description.
 * @param {Object} source - The parent Source database document containing fallbacks.
 * @returns {string} Assigned category label.
 */
function categorizeArticle(title, summary, source) {
  // 1. Localized Text Normalization Vector
  const rawText = `${title || ''} ${summary || ''}`;
  const normalizedText = rawText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ') // Replace punctuation with space to preserve token boundaries
    .replace(/\s+/g, ' ')         // Collapse white spaces
    .trim();

  const categoryScores = {};
  let maxScore = 0;
  let candidateCategories = [];

  // 2. Map Keyword Occurrences Against Defined Dictionary
  for (const [category, keywords] of Object.entries(CATEGORIES_DICTIONARY)) {
    categoryScores[category] = 0;

    keywords.forEach(keyword => {
      // Use boundary-safe inclusion checks to prevent sub-string false positives
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = normalizedText.match(regex);
      if (matches) {
        categoryScores[category] += matches.length;
      }
    });

    const currentScore = categoryScores[category];

    if (currentScore > maxScore) {
      maxScore = currentScore;
      candidateCategories = [category]; // Reset grid to current clear winner
    } else if (currentScore === maxScore && currentScore > 0) {
      candidateCategories.push(category); // Log deadlock scenario candidate
    }
  }
  // RESOLUTION LAYER (Deadlock Tiebreaker)
  if (maxScore === 0 || candidateCategories.length === 0) {
    // Scenario A: Zero keyword matches -> Drop clean back to publisher default tag
    return source.defaultCategory || 'Higher Education';
  }

  if (candidateCategories.length > 1) {
    // Scenario B: Parsing Deadlock (e.g., Title matches 'Super Eagles' and 'Government funding')
    console.log(`[CATEGORIZER TIEBREAKER] Deadlock detected for title: "${title}"`);
    console.log(` -> Matched Candidates: [${candidateCategories.join(', ')}]`);
    
    // If the publisher's default category matches one of the deadlocked candidates, select it
    if (candidateCategories.includes(source.defaultCategory)) {
      console.log(` -> Resolved via Source alignment fallback: "${source.defaultCategory}"`);
      return source.defaultCategory;
    }
    
    // Otherwise, pick the first matched category systematically
    console.log(` -> Resolved via absolute vector index pattern: "${candidateCategories[0]}"`);
    return candidateCategories[0];
  }

  // Single definitive winner path cleared
  return candidateCategories[0];
}

module.exports = {
  categorizeArticle,
  CATEGORIES_DICTIONARY
};