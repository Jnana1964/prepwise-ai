// Real, deterministic grading for Coding Practice questions - runs the
// candidate's own JavaScript function against the question's testCases
// right in the browser and compares actual vs expected output. This is
// what makes "Submit" produce a genuine right/wrong per test case instead
// of a fake/self-reported pass.
//
// Deliberately client-side, not a server-side judge: executing arbitrary
// user-submitted code on the backend would be a real code-execution
// security risk. Running it in the user's own browser tab, on their own
// machine, against their own account, carries no such risk - it's the same
// trust boundary as any other JS running on the page.
//
// Known limitation: there's no timeout guard, so a genuine infinite loop in
// the submitted code will hang the tab (the user would have to reload).
// Acceptable for a personal practice tool; a production judge would run
// this in a Web Worker with a hard timeout instead.
export function runCodingTests(userCode, functionName, testCases) {
  let fn;
  try {
    // eslint-disable-next-line no-new-func
    fn = new Function(`${userCode}\nreturn typeof ${functionName} === 'function' ? ${functionName} : null;`)();
  } catch (err) {
    return { error: `Syntax error: ${err.message}`, results: [], allPassed: false };
  }

  if (typeof fn !== 'function') {
    return { error: `Define a function named "${functionName}".`, results: [], allPassed: false };
  }

  const results = testCases.map((tc, index) => {
    try {
      const actual = fn(...tc.args);
      const pass = JSON.stringify(actual) === JSON.stringify(tc.expected);
      return { index, pass, actual, expected: tc.expected, args: tc.args };
    } catch (err) {
      return { index, pass: false, error: err.message, expected: tc.expected, args: tc.args };
    }
  });

  return { error: null, results, allPassed: results.length > 0 && results.every((r) => r.pass) };
}
