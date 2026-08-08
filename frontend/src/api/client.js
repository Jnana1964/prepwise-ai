import axios from 'axios';

// Single axios instance. All real data flows through this client -
// no mock/fake data is hardcoded in any page component.
const client = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: { 'Content-Type': 'application/json' }
});

// Key name matches what Login.jsx / Signup.jsx write to localStorage
// (localStorage.setItem('token', data.token)) - these must stay in sync.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const PUBLIC_PATHS = ['/', '/login', '/signup'];

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!PUBLIC_PATHS.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (data) => client.post('/auth/login', data),
  signup: (data) => client.post('/auth/signup', data),
  me: () => client.get('/auth/me')
};

export const resumeApi = {
  upload: (formData) =>
    client.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  list: () => client.get('/resume'),
  getAnalysis: (resumeId) => client.get(`/resume/${resumeId}/analysis`),
  improve: (resumeId) => client.post(`/resume/${resumeId}/improve`),
  tailor: (resumeId, jobDescription) =>
    client.post(`/resume/${resumeId}/tailor`, { jobDescription }),
  generateTailored: (resumeId, jobDescription) =>
    client.post(`/resume/${resumeId}/tailor/generate`, { jobDescription }),
  applySuggestions: (resumeId, suggestionIds) =>
    client.post(`/resume/${resumeId}/apply-suggestions`, { suggestionIds }),
  getContent: (resumeId) => client.get(`/resume/${resumeId}/content`),
  updateContent: (resumeId, content) => client.put(`/resume/${resumeId}/content`, { content })
};

export const companiesApi = {
  search: (q) => client.get('/companies/search', { params: { q } })
};

export const assessmentApi = {
  eligibility: () => client.get('/assessment/eligibility'),
  submit: (data) => client.post('/assessment', data),
  latest: (company) => client.get('/assessment/latest', { params: { company } }),
  history: () => client.get('/assessment/history')
};

export const jobsApi = {
  matches: () => client.get('/jobs/matches'),
  detail: (jobId) => client.get(`/jobs/${jobId}`)
};

export const applicationsApi = {
  list: () => client.get('/applications'),
  create: (data) => client.post('/applications', data),
  update: (id, data) => client.patch(`/applications/${id}`, data),
  remove: (id) => client.delete(`/applications/${id}`)
};

export const skillsApi = {
  overview: () => client.get('/skills/overview'),
  practice: (category) => client.get(`/skills/practice/${category}`),
  submitAnswer: (attemptId, data) => client.post(`/skills/attempt/${attemptId}/answer`, data),
  reset: () => client.post('/skills/reset'),
  saveAttempt: (data) => client.post('/skills/attempts', data),
  history: () => client.get('/skills/history'),
  askTutor: (data) => client.post('/skills/ai-tutor/ask', data),
  getFeedback: (data) => client.post('/skills/feedback', data)
};

export const interviewApi = {
  start: (data) => client.post('/interview/start', data),
  answer: (sessionId, data) => client.post(`/interview/${sessionId}/answer`, data),
  end: (sessionId) => client.post(`/interview/${sessionId}/end`),
  history: () => client.get('/interview/history')
};

export const analyticsApi = {
  overview: () => client.get('/analytics/overview'),
  dashboard: () => client.get('/analytics/dashboard')
};

export default client;
