// Static, real question bank. Not AI-generated, not placeholders. Content is
// intentionally interview-difficulty, not intro-level trivia.
//
// Shape contract (do not break without updating dependents):
// - mcq / aptitude: { id, prompt, options[], correctIndex } - MockAssessment.jsx
//   grades these by exact correctIndex match, and skills.controller.js's
//   getPractice sends correctIndex to the client as-is (this is a personal
//   prep tool, not a proctored exam - the "answer key" IS visible in the
//   payload, same as before).
// - coding: { id, prompt, difficulty, functionName, starterCode, testCases }
//   - testCases: [{ args: [...], expected }]. Graded live in the browser by
//     frontend/src/utils/runCodingTests.js (no server-side code execution -
//     that would be an arbitrary-code-execution risk). MockAssessment.jsx
//     doesn't know about testCases/functionName/starterCode; it just renders
//     `q.prompt` in a plain textarea since these questions have no
//     `options`, so adding these fields is additive and safe.
// - hr / company: { id, prompt } - open-ended, no objective right answer.
//   MockAssessment.jsx credits any answer over 20 characters; the dedicated
//   Skill Builder practice page instead offers real OpenAI-generated feedback
//   on what was written (see services/aiTutor.js), never a fake score.

export const QUESTION_BANK = {
  mcq: [
    { id: 'mcq-1', prompt: 'A process is blocked on I/O and its time slice has not expired. What does the OS scheduler do?', options: ['Preempts it and moves it to the ready queue', 'Moves it to the waiting/blocked queue and schedules another ready process', 'Terminates the process', 'Keeps it running until I/O completes'], correctIndex: 1 },
    { id: 'mcq-2', prompt: 'In a relational database, which normal form eliminates transitive dependencies on the primary key?', options: ['1NF', '2NF', '3NF', 'BCNF'], correctIndex: 2 },
    { id: 'mcq-3', prompt: 'What is the time complexity of building a heap from an unsorted array of n elements?', options: ['O(n log n)', 'O(n)', 'O(log n)', 'O(n^2)'], correctIndex: 1 },
    { id: 'mcq-4', prompt: 'Two threads increment a shared counter without synchronization. What class of bug does this cause?', options: ['Deadlock', 'Race condition', 'Memory leak', 'Stack overflow'], correctIndex: 1 },
    { id: 'mcq-5', prompt: 'In TCP, what mechanism prevents a fast sender from overwhelming a slow receiver?', options: ['Congestion control', 'Flow control', 'Nagle\'s algorithm', 'Slow start'], correctIndex: 1 },
    { id: 'mcq-6', prompt: 'Which SQL clause would you use to filter groups after a GROUP BY, based on an aggregate condition?', options: ['WHERE', 'HAVING', 'FILTER', 'ON'], correctIndex: 1 },
    { id: 'mcq-7', prompt: 'What does the CAP theorem say a distributed system must sacrifice during a network partition?', options: ['Either consistency or availability', 'Either consistency or durability', 'Either availability or durability', 'Either latency or throughput'], correctIndex: 0 },
    { id: 'mcq-8', prompt: 'In Java/C++-style OOP, which principle does an interface (or pure abstract class) primarily enable?', options: ['Encapsulation', 'Inheritance', 'Polymorphism', 'Garbage collection'], correctIndex: 2 },
    { id: 'mcq-9', prompt: 'What is the worst-case time complexity of quicksort, and when does it occur?', options: ['O(n log n), on already-sorted input', 'O(n^2), on already-sorted or reverse-sorted input with a naive pivot', 'O(n^2), only on random input', 'O(n log n) always, regardless of pivot choice'], correctIndex: 1 },
    { id: 'mcq-10', prompt: 'Which HTTP status code is a TEMPORARY redirect that also guarantees the client repeats the request with the same HTTP method (unlike 302/303)?', options: ['301', '307', '308', '304'], correctIndex: 1 },
    { id: 'mcq-11', prompt: 'In a hash table with separate chaining, what is the expected time complexity of a lookup when the load factor is kept constant?', options: ['O(1) amortized', 'O(log n)', 'O(n)', 'O(n log n)'], correctIndex: 0 },
    { id: 'mcq-12', prompt: 'What does ACID\'s "Isolation" guarantee in a database transaction?', options: ['Transactions survive a crash', 'Concurrent transactions don\'t see each other\'s uncommitted changes', 'All statements in a transaction succeed or none do', 'The database stays in a valid state after the transaction'], correctIndex: 1 },
    { id: 'mcq-13', prompt: 'Which data structure is most naturally suited to implement an LRU cache with O(1) get and put?', options: ['Array + binary search', 'Hash map + doubly linked list', 'Min-heap', 'Balanced BST'], correctIndex: 1 },
    { id: 'mcq-14', prompt: 'In virtual memory, what is a "page fault"?', options: ['A CPU instruction error', 'An attempt to access a page not currently in physical memory', 'A segmentation violation only', 'A disk write failure'], correctIndex: 1 },
    { id: 'mcq-15', prompt: 'What is the primary purpose of a load balancer\'s health check?', options: ['Encrypt traffic between client and server', 'Detect and stop routing traffic to unhealthy backend instances', 'Cache static assets', 'Compress response payloads'], correctIndex: 1 },
    { id: 'mcq-16', prompt: 'Which of these correctly describes "idempotent" in the context of REST APIs?', options: ['The request always returns the same status code', 'Making the same request multiple times has the same effect as making it once', 'The request is cached by the browser', 'The request cannot be retried'], correctIndex: 1 }
  ],

  coding: [
    {
      id: 'code-1',
      difficulty: 'Hard',
      prompt:
        'Write lisLength(nums) that returns the length of the longest strictly increasing subsequence in the integer array nums. ' +
        'Example: lisLength([10,9,2,5,3,7,101,18]) === 4 (the subsequence [2,3,7,18] or [2,3,7,101]). ' +
        'An O(n^2) DP solution is fine; O(n log n) is a bonus.',
      functionName: 'lisLength',
      starterCode: 'function lisLength(nums) {\n  // your code here\n  return 0;\n}',
      testCases: [
        { args: [[10, 9, 2, 5, 3, 7, 101, 18]], expected: 4 },
        { args: [[0, 1, 0, 3, 2, 3]], expected: 4 },
        { args: [[7, 7, 7, 7]], expected: 1 },
        { args: [[]], expected: 0 }
      ]
    },
    {
      id: 'code-2',
      difficulty: 'Hard',
      prompt:
        'Write longestUniqueSubstring(s) that returns the LENGTH of the longest substring of s with no repeating characters. ' +
        'Example: longestUniqueSubstring("abcabcbb") === 3 (the substring "abc").',
      functionName: 'longestUniqueSubstring',
      starterCode: 'function longestUniqueSubstring(s) {\n  // your code here\n  return 0;\n}',
      testCases: [
        { args: ['abcabcbb'], expected: 3 },
        { args: ['bbbbb'], expected: 1 },
        { args: ['pwwkew'], expected: 3 },
        { args: [''], expected: 0 }
      ]
    },
    {
      id: 'code-3',
      difficulty: 'Hard',
      prompt:
        'Write pairsWithSum(nums, target) that returns every UNIQUE pair [a, b] (with a <= b) from nums whose sum equals target - ' +
        'no duplicate pairs even if a value repeats in nums. Sort the result ascending by a, then by b. ' +
        'Example: pairsWithSum([2,7,11,15,-2,9,4,3], 9) === [[-2,11],[2,7]]. ' +
        'Example: pairsWithSum([1,1,1,1], 2) === [[1,1]] (only counted once, even though many index pairs sum to 2).',
      functionName: 'pairsWithSum',
      starterCode: 'function pairsWithSum(nums, target) {\n  // your code here\n  return [];\n}',
      testCases: [
        { args: [[2, 7, 11, 15, -2, 9, 4, 3], 9], expected: [[-2, 11], [2, 7]] },
        { args: [[1, 1, 1, 1], 2], expected: [[1, 1]] },
        { args: [[1, 2, 3, 4, 5], 100], expected: [] }
      ]
    }
  ],

  ai_tutor: [],

  aptitude: [
    { id: 'apt-1', prompt: 'A can finish a job in 12 days, B in 18 days. Working together, how many days will it take?', options: ['6.5 days', '7.2 days', '8 days', '9 days'], correctIndex: 1 },
    { id: 'apt-2', prompt: 'The average of 5 numbers is 27. If one number is removed, the average of the remaining 4 becomes 25. What was the removed number?', options: ['30', '32', '35', '37'], correctIndex: 2 },
    { id: 'apt-3', prompt: 'A sum of money doubles itself in 8 years at simple interest. In how many years will it become 4 times itself?', options: ['16 years', '20 years', '24 years', '32 years'], correctIndex: 2 },
    { id: 'apt-4', prompt: 'Two trains 150m and 100m long run in opposite directions at 54 km/h and 36 km/h. How long do they take to cross each other?', options: ['8 seconds', '10 seconds', '11.1 seconds', '12.5 seconds'], correctIndex: 2 },
    { id: 'apt-5', prompt: 'In a class, the ratio of boys to girls is 5:4. If there are 27 more boys than a third of the class, and total students = 36, how many girls are there?', options: ['14', '15', '16', '18'], correctIndex: 2 },
    { id: 'apt-6', prompt: 'What is the next number in the series: 2, 6, 12, 20, 30, ?', options: ['36', '40', '42', '44'], correctIndex: 2 },
    { id: 'apt-7', prompt: 'A shopkeeper marks an item 40% above cost price and gives a 25% discount. What is his net profit percentage?', options: ['5%', '10%', '12%', '15%'], correctIndex: 1 },
    { id: 'apt-8', prompt: 'If the probability of an event is 0.35, what is the probability of it NOT happening across 2 independent trials at least once?', options: ['0.4225', '0.5775', '0.65', '0.1225'], correctIndex: 0 },
    { id: 'apt-9', prompt: 'A boat goes 30 km downstream in 2 hours and returns upstream in 3 hours. What is the speed of the boat in still water?', options: ['10 km/h', '11 km/h', '12.5 km/h', '13 km/h'], correctIndex: 2 },
    { id: 'apt-10', prompt: 'A sum is divided among P, Q, R in the ratio 3:5:7. If R gets ₹1,400 more than P, what is the total sum?', options: ['₹4,200', '₹5,250', '₹6,300', '₹7,000'], correctIndex: 1 },
    { id: 'apt-11', prompt: 'Find the missing number in the series: 3, 8, 15, 24, 35, ?', options: ['46', '48', '50', '52'], correctIndex: 1 },
    { id: 'apt-12', prompt: 'A container has milk and water in the ratio 4:1. If 10 litres of the mixture is replaced with pure water and the new ratio becomes 2:3, what was the original quantity of the mixture?', options: ['15 litres', '20 litres', '25 litres', '30 litres'], correctIndex: 1 },
    { id: 'apt-13', prompt: 'A man invests at compound interest and his money grows from ₹8,000 to ₹9,680 in 2 years. What is the annual rate of interest?', options: ['8%', '9%', '10%', '11%'], correctIndex: 2 },
    { id: 'apt-14', prompt: 'In how many ways can the letters of the word "MANAGE" be arranged so that the two A\'s are always together?', options: ['120', '240', '360', '720'], correctIndex: 0 },
    { id: 'apt-15', prompt: 'A pipe can fill a tank in 6 hours; another can empty it in 10 hours. If both are opened together, how long will it take to fill the tank?', options: ['12 hours', '15 hours', '18 hours', '20 hours'], correctIndex: 1 },
    { id: 'apt-16', prompt: 'The sum of ages of a father and son is 62 years. Six years ago, the father\'s age was 4 times the son\'s age. What is the son\'s current age?', options: ['12 years', '14 years', '16 years', '18 years'], correctIndex: 2 }
  ],

  hr: [
    { id: 'hr-1', prompt: 'Tell me about a time you disagreed with your manager or team lead. How did you handle it, and what was the outcome?' },
    { id: 'hr-2', prompt: 'Describe the most technically difficult problem you have solved. What made it hard, and what was your approach?' },
    { id: 'hr-3', prompt: 'Give an example of a time you had to learn something completely new under a tight deadline. How did you approach it?' },
    { id: 'hr-4', prompt: 'Tell me about a time you made a mistake that affected your team or a project. How did you handle it afterward?' },
    { id: 'hr-5', prompt: 'Why should we hire you over another candidate with a similar background?' },
    { id: 'hr-6', prompt: 'Describe a situation where you had to influence someone without having authority over them.' },
    { id: 'hr-7', prompt: 'Tell me about a time you had to work with a difficult teammate. How did you manage the relationship and get the work done?' },
    { id: 'hr-8', prompt: 'Describe a project that failed or fell short of expectations. What did you learn from it?' },
    { id: 'hr-9', prompt: 'Where do you see yourself in five years, and how does this role fit into that path?' },
    { id: 'hr-10', prompt: 'Tell me about a time you had to prioritize between multiple urgent tasks. How did you decide what came first?' }
  ],

  company: [
    { id: 'comp-1', prompt: '(TCS NQT pattern) Explain the difference between an abstract class and an interface, and give a concrete example of when you would choose one over the other in a real project.' },
    { id: 'comp-2', prompt: '(Amazon Leadership Principles) Describe a time you went above and beyond what was asked of you ("Bias for Action"). What was the outcome?' },
    { id: 'comp-3', prompt: '(Infosys/Wipro pattern) Explain normalization vs denormalization in databases, and describe a real scenario where denormalizing would be the right call despite the redundancy.' },
    { id: 'comp-4', prompt: '(Google/product-heavy interview pattern) How would you design a URL shortener like bit.ly? Cover the data model, the ID-generation strategy, and how you would handle scale.' },
    { id: 'comp-5', prompt: '(Microsoft pattern) Tell me about a time your code caused a production bug. How did you find the root cause, and what did you change afterward to prevent it recurring?' },
    { id: 'comp-6', prompt: '(Flipkart/e-commerce systems pattern) How would you design the backend for a flash-sale feature that must handle a sudden 100x traffic spike without overselling limited stock?' },
    { id: 'comp-7', prompt: '(Wipro NLTH pattern) What is the difference between process and thread, and describe a real scenario where you would prefer multiple processes over multiple threads.' },
    { id: 'comp-8', prompt: '(Accenture pattern) Describe a time you had to deliver a solution under an unreasonable deadline set by a client. How did you scope the work?' },
    { id: 'comp-9', prompt: '(Meta/social systems pattern) How would you design a news-feed ranking system? Cover data sources, ranking signals, and how you would handle a user with very few connections (cold start).' },
    { id: 'comp-10', prompt: '(TCS Ninja/digital pattern) Explain ACID properties with a real banking transaction example, and describe what could go wrong if the "Isolation" property were violated.' }
  ]
};
