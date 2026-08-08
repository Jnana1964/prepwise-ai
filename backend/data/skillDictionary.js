// Single shared skill vocabulary used across the app: the resume ATS engine
// detects skills from resume text against this list, and the Internshala
// sync uses the SAME list to normalize scraped "Skill(s) required" text into
// the identical lowercase tokens - so job matching (jobMatcher.js) compares
// apples to apples instead of two independently-drifting skill vocabularies.
export const SKILL_DICTIONARY = [
  'javascript', 'typescript', 'react', 'redux', 'node', 'node.js', 'express',
  'next.js', 'html', 'css', 'tailwind', 'sass', 'python', 'django', 'flask',
  'java', 'spring', 'c++', 'c#', '.net', 'go', 'rust', 'php', 'laravel',
  'ruby', 'rails', 'sql', 'mysql', 'postgresql', 'mongodb', 'redis',
  'graphql', 'rest api', 'rest', 'docker', 'kubernetes', 'aws', 'azure',
  'gcp', 'ci/cd', 'jenkins', 'git', 'github', 'linux', 'system design',
  'data structures', 'algorithms', 'machine learning', 'deep learning',
  'tensorflow', 'pytorch', 'pandas', 'numpy', 'data analysis', 'tableau',
  'power bi', 'excel', 'figma', 'agile', 'scrum', 'jira', 'testing',
  'jest', 'cypress', 'webpack', 'vite', 'firebase', 'supabase',
  // Extra terms common in Internshala internship postings that weren't
  // needed for resume detection but show up a lot in listing skill chips.
  'wordpress', 'bootstrap', 'jquery', 'seo', 'content writing',
  'digital marketing', 'social media marketing', 'canva', 'photoshop',
  'illustrator', 'video editing', 'ms office', 'communication skills',
  'android', 'kotlin', 'swift', 'flutter', 'react native', 'angular',
  'vue', 'vue.js'
];
