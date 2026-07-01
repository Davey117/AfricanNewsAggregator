// services/categorization.js

/**
 * THEMATIC CATEGORIES DICTIONARY
 * Curated keywords mapping directly to West African and international news domains.
 */
const CATEGORIES_DICTIONARY = {
  'Policy and Governance': [
    'policy', 'governance', 'ministry', 'regulation', 'reform', 'mandate',
    'jamb', 'nuc', 'waec', 'neco', 'asuu', 'agency', 'sector', 'bill', 'act',
    'legislation', 'education board', 'commission', 'parliament', 'council'
  ],
  'Institutional Funding': [
    'scholarship', 'bursary', 'grant', 'funding', 'fellowship', 'financial aid',
    'tetfund', 'endowment', 'tuition relief', 'donor', 'budget', 'allocation',
    'subsidy', 'loan', 'support', 'investment', 'capital'
  ],
  'Higher Education': [
    'university', 'polytechnic', 'undergraduate', 'postgraduate', 'convocation',
    'matriculation', 'vc', 'vice chancellor', 'campus', 'degree', 'varsity',
    'lecturer', 'academic', 'faculty', 'admission', 'semester'
  ],
  'Research and Innovation': [
    'research', 'innovation', 'edtech', 'technology', 'laboratory', 'study',
    'publication', 'paper', 'conference', 'experiment', 'curriculum', 'e-learning',
    'digital learning', 'scholar', 'invention', 'project', 'science', 'development'
  ]
};

const EDUCATION_GUARD_KEYWORDS = [
  'education', 'educational', 'student', 'students', 'school', 'schools',
  'university', 'universities', 'polytechnic', 'campus', 'curriculum',
  'syllabus', 'teacher', 'teachers', 'lecturer', 'lecturers', 'academic',
  'academics', 'research', 'scholarship', 'bursary', 'grant', 'learning',
  'teaching', 'classroom', 'admission', 'matriculation', 'degree', 'exam',
  'waec', 'jamb', 'neco', 'asuu', 'edtech', 'e learning', 'e-learning',
  'digital learning', 'science', 'stem', 'faculty', 'college', 'seminar',
  'laboratory', 'undergraduate', 'postgraduate', 'vocational', 'training'
];

/**
 * RULE-BASED CATEGORIZATION ENGINE
 * Tokenizes, normalizes, and assigns thematic domains to ingested content items.
 * @param {string} title - The article headline.
 * @param {string} summary - The raw snippet description.
 * @param {Object} source - The parent Source database document containing fallbacks.
 * @returns {string|null} Assigned category label or null when content is not educational.
 */
function categorizeArticle(title, summary, source) {
  // 1. Localized Text Normalization Vector
  const rawText = `${title || ''} ${summary || ''}`;
  const normalizedText = rawText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ') // Replace punctuation with space to preserve token boundaries
    .replace(/\s+/g, ' ')         // Collapse white spaces
    .trim();

  const hasEducationSignal = EDUCATION_GUARD_KEYWORDS.some(keyword => {
    const regex = new RegExp(`\\b${keyword.replace(/\s+/g, '\\s+')}\\b`, 'g');
    return normalizedText.match(regex);
  });

  if (!hasEducationSignal) {
    console.log(`[CATEGORIZER FILTER] Rejected non-educational content: "${title}"`);
    return null;
  }

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

    if (category === 'Higher Education') {
      const higherEducationBoostTerms = [
        'university', 'universities', 'polytechnic', 'student', 'students', 'campus',
        'academic', 'academics', 'lecturer', 'lecturers', 'faculty', 'admission',
        'matriculation', 'degree', 'college', 'school', 'schools', 'undergraduate',
        'postgraduate', 'vocational'
      ];

      higherEducationBoostTerms.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        if (normalizedText.match(regex)) {
          categoryScores[category] += 2;
        }
      });
    }

    if (category === 'Policy and Governance') {
      const policyBoostTerms = [
        'policy', 'government', 'ministry', 'minister', 'regulation', 'bill',
        'act', 'commission', 'board', 'council', 'parliament', 'governance',
        'kuccps', 'knec', 'tvet', 'cbc'
      ];

      policyBoostTerms.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        if (normalizedText.match(regex)) {
          categoryScores[category] += 2;
        }
      });
    }

    if (category === 'Research and Innovation') {
      const researchBoostTerms = [
        'research', 'innovation', 'technology', 'edtech', 'ai', 'laboratory',
        'study', 'publication', 'conference', 'startup', 'prototype', 'patent',
        'incubator', 'hackathon', 'stem'
      ];

      researchBoostTerms.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        if (normalizedText.match(regex)) {
          categoryScores[category] += 2;
        }
      });
    }

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
    // Scenario A: Zero keyword matches but educational signal exists -> return a safe default
    return source?.defaultCategory || 'Higher Education';
  }

  if (candidateCategories.length > 1) {
    // Scenario B: Parsing Deadlock (e.g., Title matches 'Super Eagles' and 'Government funding')
    console.log(`[CATEGORIZER TIEBREAKER] Deadlock detected for title: "${title}"`);
    console.log(` -> Matched Candidates: [${candidateCategories.join(', ')}]`);

    // If the publisher's default category matches one of the deadlocked candidates, select it
    if (candidateCategories.includes(source?.defaultCategory)) {
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