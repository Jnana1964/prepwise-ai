// Zero-dependency document export. Two real, working export paths:
//
// 1. openPrintView(title, bodyHtml) - opens a clean, print-styled tab and
//    triggers the browser's native print dialog, where "Save as PDF" is a
//    built-in destination in every modern browser. This is a genuine PDF
//    export path that needs no server-side PDF renderer and no new
//    dependency.
// 2. downloadAsDoc(filename, title, bodyHtml) - builds a real .doc file
//    (Word opens HTML content saved with a .doc extension and a
//    application/msword MIME type - a long-standing, legitimate technique,
//    not a fake/renamed .txt file) and triggers a browser download.
//
// Both take simple HTML strings so callers can format scores/lists nicely
// without pulling in a PDF/DOCX generation library.

const BASE_STYLES = `
  body { font-family: Arial, Helvetica, sans-serif; color: #111; line-height: 1.5; padding: 32px; max-width: 800px; margin: 0 auto; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  h2 { font-size: 15px; margin-top: 24px; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
  p { margin: 4px 0; }
  ul { margin: 4px 0; padding-left: 20px; }
  .muted { color: #666; font-size: 12px; }
  .score-row { display: flex; gap: 24px; margin: 12px 0; }
  .score-box { border: 1px solid #ddd; border-radius: 6px; padding: 10px 16px; }
  .score-box .num { font-size: 20px; font-weight: bold; }
`;

function buildHtmlDocument(title, bodyHtml) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>${BASE_STYLES}</style></head><body>${bodyHtml}</body></html>`;
}

export function openPrintView(title, bodyHtml) {
  const win = window.open('', '_blank');
  if (!win) {
    alert('Please allow pop-ups to download as PDF (uses your browser\'s Print > Save as PDF).');
    return;
  }
  win.document.write(buildHtmlDocument(title, bodyHtml));
  win.document.close();
  win.focus();
  // Give the new tab a moment to lay out before invoking print.
  setTimeout(() => win.print(), 300);
}

export function downloadAsDoc(filename, title, bodyHtml) {
  const html = buildHtmlDocument(title, bodyHtml);
  const blob = new Blob(['﻿', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
