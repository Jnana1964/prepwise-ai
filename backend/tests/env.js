process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-not-for-production';
process.env.JWT_EXPIRES_IN = '1h';
process.env.MOCK_ASSESSMENT_PASS_THRESHOLD = '80';
process.env.CLIENT_ORIGIN = 'http://localhost:5173';
