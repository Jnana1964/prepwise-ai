// 8 resume templates. All render the SAME AI-tailored content object
// (see TailoredResume.jsx / generateTailoredResume backend endpoint) into
// different, real, downloadable layouts - nothing here is a screenshot or
// a static mockup. Each template is plain HTML + inline CSS so the exact
// same markup can be shown as a live in-app preview and handed to
// exportDocument.js's openPrintView/downloadAsDoc for a real PDF/.doc
// download, with zero drift between what you see and what you get.

export const TEMPLATES = [
  { id: 'classic-ats', name: 'Classic ATS', description: 'Single column, serif headers - the safest layout for ATS parsers.', atsFriendly: true },
  { id: 'modern-minimal', name: 'Modern Minimal', description: 'Clean sans-serif with a subtle accent color.', atsFriendly: true },
  { id: 'compact-technical', name: 'Compact Technical', description: 'Dense, small-font layout that fits more on one page.', atsFriendly: true },
  { id: 'sidebar', name: 'Two-Column Sidebar', description: 'Skills & contact in a sidebar, experience on the right.', atsFriendly: false },
  { id: 'bold-header', name: 'Bold Header', description: 'Large name banner up top, single-column body.', atsFriendly: true },
  { id: 'timeline', name: 'Timeline', description: 'Experience laid out along a left-hand timeline marker.', atsFriendly: true },
  { id: 'skills-forward', name: 'Skills-Forward', description: 'Skills grid featured near the top - good for career switches.', atsFriendly: true },
  { id: 'executive', name: 'Executive', description: 'Formal serif type with wide margins and understated rules.', atsFriendly: true }
];

function esc(str) {
  return String(str || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function bulletList(bullets) {
  if (!bullets?.length) return '';
  return `<ul>${bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`;
}

function experienceBlock(experience) {
  if (!experience?.length) return '';
  return experience
    .map(
      (e) => `
      <div class="entry">
        <div class="entry-head"><span class="entry-title">${esc(e.role)}${e.company ? ` · ${esc(e.company)}` : ''}</span><span class="entry-dates">${esc(e.dates)}</span></div>
        ${bulletList(e.bullets)}
      </div>`
    )
    .join('');
}

function educationBlock(education) {
  if (!education?.length) return '';
  return education
    .map(
      (e) => `
      <div class="entry">
        <div class="entry-head"><span class="entry-title">${esc(e.degree)}${e.school ? ` · ${esc(e.school)}` : ''}</span><span class="entry-dates">${esc(e.dates)}</span></div>
      </div>`
    )
    .join('');
}

function projectsBlock(projects) {
  if (!projects?.length) return '';
  return projects
    .map(
      (p) => `
      <div class="entry">
        <div class="entry-head"><span class="entry-title">${esc(p.name)}</span></div>
        ${bulletList(p.bullets)}
      </div>`
    )
    .join('');
}

function skillsBlock(skills) {
  if (!skills?.length) return '';
  return `<div class="skills-row">${skills.map((s) => `<span class="skill-pill">${esc(s)}</span>`).join('')}</div>`;
}

const TEMPLATE_CSS = {
  'classic-ats': `
    .resume-doc { font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.5; }
    .name { font-size: 26px; font-weight: bold; margin-bottom: 2px; }
    .title { font-size: 14px; color: #444; margin-bottom: 4px; }
    .contact { font-size: 12px; color: #555; margin-bottom: 18px; }
    .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #999; padding-bottom: 3px; margin: 18px 0 8px; }
    .entry { margin-bottom: 10px; }
    .entry-head { display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; }
    .entry-dates { font-weight: normal; color: #555; }
    ul { margin: 4px 0 0; padding-left: 18px; font-size: 12.5px; }
    li { margin-bottom: 2px; }
    .skills-row { font-size: 12.5px; }
    .skill-pill { display: inline; }
    .skill-pill:not(:last-child)::after { content: ' · '; }
  `,
  'modern-minimal': `
    .resume-doc { font-family: 'Helvetica Neue', Arial, sans-serif; color: #222; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.55; }
    .name { font-size: 28px; font-weight: 700; color: #ff6a1a; margin-bottom: 2px; }
    .title { font-size: 14px; color: #555; margin-bottom: 4px; }
    .contact { font-size: 12px; color: #777; margin-bottom: 20px; }
    .section-title { font-size: 13px; font-weight: 700; color: #ff6a1a; text-transform: uppercase; letter-spacing: 1px; margin: 20px 0 8px; }
    .entry { margin-bottom: 12px; }
    .entry-head { display: flex; justify-content: space-between; font-size: 13.5px; font-weight: 600; }
    .entry-dates { font-weight: 400; color: #888; }
    ul { margin: 4px 0 0; padding-left: 18px; font-size: 12.5px; }
    .skills-row { display: flex; flex-wrap: wrap; gap: 6px; }
    .skill-pill { background: #fff1e8; color: #b6470f; border-radius: 999px; padding: 3px 10px; font-size: 11.5px; }
  `,
  'compact-technical': `
    .resume-doc { font-family: 'Courier New', monospace; color: #111; max-width: 800px; margin: 0 auto; padding: 28px; line-height: 1.35; font-size: 12px; }
    .name { font-size: 20px; font-weight: bold; }
    .title { font-size: 12px; color: #444; }
    .contact { font-size: 11px; color: #555; margin-bottom: 12px; }
    .section-title { font-size: 12px; font-weight: bold; border-bottom: 1px solid #ccc; margin: 12px 0 5px; }
    .entry { margin-bottom: 6px; }
    .entry-head { display: flex; justify-content: space-between; font-weight: bold; }
    .entry-dates { font-weight: normal; }
    ul { margin: 2px 0 0; padding-left: 16px; }
    li { margin-bottom: 1px; }
    .skills-row { font-size: 11.5px; }
    .skill-pill:not(:last-child)::after { content: ', '; }
  `,
  sidebar: `
    .resume-doc { display: flex; font-family: Arial, sans-serif; color: #222; max-width: 800px; margin: 0 auto; min-height: 100%; }
    .rd-sidebar { width: 220px; background: #1a1a1a; color: #eee; padding: 28px 18px; box-sizing: border-box; }
    .rd-main { flex: 1; padding: 28px 24px; box-sizing: border-box; }
    .name { font-size: 20px; font-weight: 700; color: #fff; }
    .title { font-size: 12px; color: #ccc; margin-bottom: 10px; }
    .contact { font-size: 11px; color: #bbb; margin-bottom: 16px; word-break: break-word; }
    .rd-sidebar .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #ff8a4a; margin: 14px 0 6px; }
    .rd-main .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #ff6a1a; padding-bottom: 3px; margin: 16px 0 8px; }
    .rd-main .section-title:first-child { margin-top: 0; }
    .entry { margin-bottom: 10px; }
    .entry-head { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; }
    .entry-dates { font-weight: 400; color: #777; font-size: 11px; }
    ul { margin: 3px 0 0; padding-left: 16px; font-size: 12px; }
    .skills-row { display: flex; flex-direction: column; gap: 4px; }
    .skill-pill { font-size: 11px; color: #eee; }
  `,
  'bold-header': `
    .resume-doc { font-family: Arial, sans-serif; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
    .rd-banner { background: #ff6a1a; color: #fff; padding: 30px 40px; }
    .name { font-size: 30px; font-weight: 800; }
    .title { font-size: 14px; opacity: 0.9; }
    .contact { font-size: 12px; opacity: 0.85; margin-top: 4px; }
    .rd-body { padding: 24px 40px 40px; }
    .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; margin: 18px 0 8px; color: #ff6a1a; }
    .entry { margin-bottom: 10px; }
    .entry-head { display: flex; justify-content: space-between; font-size: 13.5px; font-weight: 600; }
    .entry-dates { font-weight: 400; color: #777; }
    ul { margin: 4px 0 0; padding-left: 18px; font-size: 12.5px; }
    .skills-row { display: flex; flex-wrap: wrap; gap: 6px; }
    .skill-pill { border: 1px solid #ff6a1a; color: #ff6a1a; border-radius: 6px; padding: 2px 8px; font-size: 11.5px; }
  `,
  timeline: `
    .resume-doc { font-family: Arial, sans-serif; color: #222; max-width: 800px; margin: 0 auto; padding: 36px; }
    .name { font-size: 26px; font-weight: 700; }
    .title { font-size: 14px; color: #555; }
    .contact { font-size: 12px; color: #777; margin-bottom: 18px; }
    .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin: 18px 0 10px; color: #333; }
    .entry { position: relative; padding-left: 18px; margin-bottom: 14px; border-left: 2px solid #ff6a1a; }
    .entry::before { content: ''; position: absolute; left: -5px; top: 3px; width: 8px; height: 8px; border-radius: 50%; background: #ff6a1a; }
    .entry-head { display: flex; justify-content: space-between; font-size: 13.5px; font-weight: 600; }
    .entry-dates { font-weight: 400; color: #888; }
    ul { margin: 4px 0 0; padding-left: 18px; font-size: 12.5px; }
    .skills-row { display: flex; flex-wrap: wrap; gap: 6px; }
    .skill-pill { background: #f2f2f2; border-radius: 4px; padding: 3px 9px; font-size: 11.5px; }
  `,
  'skills-forward': `
    .resume-doc { font-family: Arial, sans-serif; color: #1e1e1e; max-width: 800px; margin: 0 auto; padding: 36px; }
    .name { font-size: 26px; font-weight: 700; }
    .title { font-size: 14px; color: #555; margin-bottom: 4px; }
    .contact { font-size: 12px; color: #777; margin-bottom: 14px; }
    .rd-skills-banner { background: #fafafa; border: 1px solid #eee; border-radius: 8px; padding: 14px 16px; margin-bottom: 16px; }
    .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin: 16px 0 8px; }
    .entry { margin-bottom: 10px; }
    .entry-head { display: flex; justify-content: space-between; font-size: 13.5px; font-weight: 600; }
    .entry-dates { font-weight: 400; color: #888; }
    ul { margin: 4px 0 0; padding-left: 18px; font-size: 12.5px; }
    .skills-row { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill-pill { background: #ff6a1a; color: #fff; border-radius: 999px; padding: 4px 12px; font-size: 12px; font-weight: 500; }
  `,
  executive: `
    .resume-doc { font-family: 'Times New Roman', Georgia, serif; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 48px 56px; line-height: 1.6; }
    .name { font-size: 24px; font-weight: bold; letter-spacing: 1px; text-align: center; }
    .title { font-size: 13px; color: #555; text-align: center; margin-bottom: 4px; }
    .contact { font-size: 11.5px; color: #666; text-align: center; margin-bottom: 22px; }
    .section-title { font-size: 12.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; text-align: center; margin: 20px 0 10px; }
    .entry { margin-bottom: 12px; }
    .entry-head { display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; }
    .entry-dates { font-weight: normal; color: #555; font-style: italic; }
    ul { margin: 4px 0 0; padding-left: 20px; font-size: 12.5px; }
    .skills-row { text-align: center; font-size: 12.5px; }
    .skill-pill:not(:last-child)::after { content: ' — '; }
  `
};

export function renderResumeHtml(content, templateId) {
  const tpl = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];
  const css = TEMPLATE_CSS[tpl.id];

  const sections = `
    ${content.summary ? `<div class="section-title">Summary</div><p>${esc(content.summary)}</p>` : ''}
    ${content.skills?.length ? `<div class="section-title">Skills</div>${skillsBlock(content.skills)}` : ''}
    ${content.experience?.length ? `<div class="section-title">Experience</div>${experienceBlock(content.experience)}` : ''}
    ${content.projects?.length ? `<div class="section-title">Projects</div>${projectsBlock(content.projects)}` : ''}
    ${content.education?.length ? `<div class="section-title">Education</div>${educationBlock(content.education)}` : ''}
  `;

  let body;
  if (tpl.id === 'sidebar') {
    body = `
      <div class="resume-doc" data-tpl="${tpl.id}">
        <div class="rd-sidebar">
          <div class="name">${esc(content.fullName)}</div>
          <div class="title">${esc(content.title)}</div>
          <div class="contact">${esc(content.contact)}</div>
          ${content.skills?.length ? `<div class="section-title">Skills</div>${skillsBlock(content.skills)}` : ''}
          ${content.education?.length ? `<div class="section-title">Education</div>${educationBlock(content.education)}` : ''}
        </div>
        <div class="rd-main">
          ${content.summary ? `<div class="section-title">Summary</div><p>${esc(content.summary)}</p>` : ''}
          ${content.experience?.length ? `<div class="section-title">Experience</div>${experienceBlock(content.experience)}` : ''}
          ${content.projects?.length ? `<div class="section-title">Projects</div>${projectsBlock(content.projects)}` : ''}
        </div>
      </div>`;
  } else if (tpl.id === 'bold-header') {
    body = `
      <div class="resume-doc" data-tpl="${tpl.id}">
        <div class="rd-banner">
          <div class="name">${esc(content.fullName)}</div>
          <div class="title">${esc(content.title)}</div>
          <div class="contact">${esc(content.contact)}</div>
        </div>
        <div class="rd-body">${sections}</div>
      </div>`;
  } else if (tpl.id === 'skills-forward') {
    body = `
      <div class="resume-doc" data-tpl="${tpl.id}">
        <div class="name">${esc(content.fullName)}</div>
        <div class="title">${esc(content.title)}</div>
        <div class="contact">${esc(content.contact)}</div>
        ${content.skills?.length ? `<div class="rd-skills-banner">${skillsBlock(content.skills)}</div>` : ''}
        ${content.summary ? `<div class="section-title">Summary</div><p>${esc(content.summary)}</p>` : ''}
        ${content.experience?.length ? `<div class="section-title">Experience</div>${experienceBlock(content.experience)}` : ''}
        ${content.projects?.length ? `<div class="section-title">Projects</div>${projectsBlock(content.projects)}` : ''}
        ${content.education?.length ? `<div class="section-title">Education</div>${educationBlock(content.education)}` : ''}
      </div>`;
  } else {
    body = `
      <div class="resume-doc" data-tpl="${tpl.id}">
        <div class="name">${esc(content.fullName)}</div>
        <div class="title">${esc(content.title)}</div>
        <div class="contact">${esc(content.contact)}</div>
        ${sections}
      </div>`;
  }

  return `<style>${css}</style>${body}`;
}
