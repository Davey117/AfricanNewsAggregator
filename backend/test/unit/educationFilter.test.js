const { categorizeArticle } = require('../../services/categorization');

describe('Educational-only content filtering', () => {
  test('rejects non-educational headlines', () => {
    const result = categorizeArticle(
      'President announces new fuel subsidy plan',
      'The government unveils a new economic policy for citizens.',
      { defaultCategory: 'Higher Education' }
    );

    expect(result).toBeNull();
  });

  test('accepts education-focused headlines', () => {
    const result = categorizeArticle(
      'University students celebrate new scholarship opportunity',
      'A major bursary programme expands support for undergraduates.',
      { defaultCategory: 'Higher Education' }
    );

    expect(result).toBe('Higher Education');
  });
});
