// Deliberately empty. This used to hold demo entries (Google/Microsoft/
// Amazon/Swiggy) that linked to generic company careers homepages instead
// of a real, specific job posting a person could actually apply to -
// exactly the "Swiggy has no real job but it's displayed" problem. Real
// listings now come exclusively from the Internshala scraper
// (services/internshalaScraper.js), which links each job to its real,
// specific application page. scripts/seedJobs.js still purges any old
// `source: 'seed'` rows left over from before this change, then inserts
// nothing - run it once to clean up an existing database.
export const JOBS_SEED = [];
