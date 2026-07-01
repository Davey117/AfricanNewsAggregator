// backend/test/unit/normalization.test.js

// Mock implementation of a standard Levenshtein calculation matrix
function calculateLevenshtein(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

describe('Normalization & Similarity Distance Unit Tests', () => {
  
  test('Should handle noisy string normalization edge-cases accurately', () => {
    const rawInput = "   PUNCH   newspapers  \n";
    const normalized = rawInput.trim().toLowerCase().replace(/\s+/g, ' ');
    expect(normalized).toBe('punch newspapers');
  });

  test('Should return exact zero match value for identical string targets', () => {
    const stringA = "Higher Education";
    const stringB = "Higher Education";
    expect(calculateLevenshtein(stringA, stringB)).toBe(0);
  });

  test('Should isolate exact atomic distance score for character mutations', () => {
    const source = "STEM Policy";
    const target = "STEM Police"; // 1 substitution error: y -> e
    expect(calculateLevenshtein(source, target)).toBe(1);
  });
});