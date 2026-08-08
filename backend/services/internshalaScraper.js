// Best-effort sync of live internship listings from Internshala into the
// jobs table, so Opportunity Matcher has real, current opportunities to
// match against - not just the static local seed catalog.
//
// IMPORTANT CAVEATS (read before relying on this in production):
// - Internshala has no public API for third parties. This works by
//   fetching their public, unauthenticated listing/detail pages and
//   parsing the HTML - the same pages any signed-out visitor sees in a
//   browser. There is no guarantee they keep this markup/copy stable.
// - Parsing is deliberately anchored on stable, visible label text
//   ("Duration", "Stipend", the <title> tag) rather than CSS class names,
//   so it tolerates visual redesigns better than a class-based scraper
//   would. If Internshala changes their wording or blocks automated
//   traffic, a sync can return 0 results - it fails soft (logs a warning,
//   leaves existing jobs untouched) and never crashes the server.
// - Be a reasonable citizen: capped listings per run, short delay between
//   requests. Don't crank INTERNSHALA_MAX_PER_CATEGORY way up or drop
//   INTERNSHALA_REQUEST_DELAY_MS to zero.

import * as cheerio from 'cheerio';
import { Job } from '../models/index.js';
import { SKILL_DICTIONARY } from '../data/skillDictionary.js';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const DEFAULT_CATEGORIES = (
  process.env.INTERNSHALA_CATEGORIES ||
  'computer-science-internship,web-development-internship,work-from-home-internships,digital-marketing-internship,data-science-internship'
)
  .split(',')
  .map((c) => c.trim())
  .filter(Boolean);

const MAX_PER_CATEGORY = Number(process.env.INTERNSHALA_MAX_PER_CATEGORY || 10);
const REQUEST_DELAY_MS = Number(process.env.INTERNSHALA_REQUEST_DELAY_MS || 600);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

// Detail-page URLs are the one part of Internshala's markup that has been
// stable for years (SEO slug + numeric id) - extracted with a plain regex
// on the raw HTML rather than depending on listing-card CSS classes, which
// redesign far more often than the URL scheme does.
function extractDetailLinks(html, baseUrl = 'https://internshala.com') {
  const links = new Set();
  // Real hrefs often carry a query string (?referral=...) before the
  // closing quote - match anything up to the quote, then strip it off,
  // rather than a character class that silently fails to match those URLs.
  const re = /href="(\/internship\/detail\/[^"]+)"/gi;
  let m;
  while ((m = re.exec(html))) {
    links.add(baseUrl + m[1].split('?')[0]);
  }
  return [...links];
}

// Pulls the value that sits right after a visible label (e.g. "Duration",
// "Stipend") in the page's flattened text. Anchoring on visible copy
// instead of a CSS selector is deliberate - Internshala's user-facing
// wording is far less likely to change than its class names. Restricted to
// the first slice of the page (the summary block always renders before the
// long job-description text) so it can't accidentally match unrelated
// mentions of the same words deeper in the posting.
function valueAfterLabel(metaText, label, stopLabelPattern) {
  const pattern = new RegExp(`${label}\\s*(.+?)\\s*(?:${stopLabelPattern})`, 'i');
  const match = metaText.match(pattern);
  return match ? match[1].trim() : null;
}

function extractSkills(text) {
  const lower = text.toLowerCase();
  return SKILL_DICTIONARY.filter((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:[^a-z0-9]|$)`, 'i');
    return re.test(lower);
  });
}

// The <title> tag is SEO-critical for Internshala, so its format -
// "<Role> Internship in <Location> at <Company>", or for work-from-home
// postings "<Role> Internship at <Company>" - is the single most stable
// source we have for role/location/company, more durable than any CSS
// class we could target instead.
function parseTitleTag(titleTag) {
  const clean = titleTag.replace(/\s*[-|]\s*Internshala.*$/i, '').trim();
  let m = clean.match(/^(.+?)\s+Internship\s+in\s+(.+?)\s+at\s+(.+)$/i);
  if (m) return { title: m[1].trim(), location: m[2].trim(), company: m[3].trim() };
  m = clean.match(/^(.+?)\s+Internship\s+at\s+(.+)$/i);
  if (m) return { title: m[1].trim(), location: 'Remote', company: m[2].trim() };
  return null;
}

async function parseDetailPage(url) {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const parsed = parseTitleTag($('title').first().text());
  if (!parsed) return null; // couldn't confidently identify role/company - skip rather than guess

  const flatText = $('body').text().replace(/\s+/g, ' ').trim();
  const metaText = flatText.slice(0, 3000); // summary block always renders first

  const duration = valueAfterLabel(metaText, 'Duration', 'Stipend');
  const stipend = valueAfterLabel(metaText, 'Stipend', 'APPLY BY|Posted');
  const skills = extractSkills(flatText);

  const salaryParts = [stipend, duration].filter(Boolean);

  return {
    title: parsed.title,
    company: parsed.company,
    location: parsed.location,
    salary: salaryParts.join(' · ') || '',
    jobType: 'Internship',
    requiredSkills: skills,
    tags: skills.slice(0, 6).map((s) => s.replace(/\b\w/g, (c) => c.toUpperCase())),
    applyUrl: url,
    source: 'internshala'
  };
}

async function scrapeCategory(categorySlug) {
  const listingUrl = `https://internshala.com/internships/${categorySlug}`;
  const html = await fetchHtml(listingUrl);
  const links = extractDetailLinks(html).slice(0, MAX_PER_CATEGORY);

  const jobs = [];
  for (const link of links) {
    try {
      await sleep(REQUEST_DELAY_MS);
      const job = await parseDetailPage(link);
      if (job) jobs.push(job);
    } catch (err) {
      console.warn(`[internshala] skipped ${link}: ${err.message}`);
    }
  }
  return jobs;
}

// Upserts by applyUrl (the internship detail page URL, unique per posting)
// so re-running the sync refreshes existing rows instead of duplicating
// them - the same discipline as the Opportunity Matcher "Save"
// duplicate-prevention fix on the applications table.
async function upsertJobs(jobs) {
  let created = 0;
  let updated = 0;
  for (const job of jobs) {
    const existing = await Job.findOne({ where: { applyUrl: job.applyUrl } });
    if (existing) {
      await existing.update(job);
      updated += 1;
    } else {
      await Job.create(job);
      created += 1;
    }
  }
  return { created, updated };
}

export async function syncInternshala(categories = DEFAULT_CATEGORIES) {
  const summary = { categories: categories.length, scraped: 0, created: 0, updated: 0, errors: [] };

  for (const category of categories) {
    try {
      const jobs = await scrapeCategory(category);
      summary.scraped += jobs.length;
      const { created, updated } = await upsertJobs(jobs);
      summary.created += created;
      summary.updated += updated;
    } catch (err) {
      console.warn(`[internshala] category "${category}" failed: ${err.message}`);
      summary.errors.push({ category, message: err.message });
    }
  }

  console.log(
    `[internshala] sync done: ${summary.scraped} scraped, ${summary.created} new, ${summary.updated} updated` +
      (summary.errors.length ? `, ${summary.errors.length} category error(s)` : '')
  );
  return summary;
}
