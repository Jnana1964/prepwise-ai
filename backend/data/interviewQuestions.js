export const HR_QUESTIONS = [
  { prompt: 'Tell me about yourself.', type: 'hr' },
  { prompt: 'Why do you want to work with us?', type: 'hr' },
  { prompt: 'Where do you see yourself in five years?', type: 'hr' }
];

export const BEHAVIORAL_QUESTIONS = [
  { prompt: 'Describe a time you had to work under a tight deadline.', type: 'behavioral' },
  { prompt: 'Tell me about a time you disagreed with a teammate. How did you resolve it?', type: 'behavioral' }
];

export const TECHNICAL_QUESTIONS_BY_COMPANY = {
  TCS: [{ prompt: 'Explain the difference between an abstract class and an interface.', type: 'technical' }],
  Infosys: [{ prompt: 'What is normalization in databases? Explain with an example.', type: 'technical' }],
  Accenture: [{ prompt: 'Explain the concept of the event loop in JavaScript.', type: 'technical' }],
  Amazon: [{ prompt: 'Explain time and space complexity of quicksort.', type: 'technical' }],
  Wipro: [{ prompt: 'What is the difference between REST and GraphQL?', type: 'technical' }]
};
