// Content negotiation between text/html and text/markdown.
// Compares q-values (no substring matching); ties go to Markdown only when the
// client explicitly named text/markdown, so `Accept: */*` keeps getting HTML.

/**
 * @param {string} header
 * @returns {{ type: string, subtype: string, q: number }[]}
 */
export function parseAccept(header) {
  return header
    .split(',')
    .map((part) => {
      const [range, ...params] = part.trim().split(';');
      const [type = '', subtype = ''] = range.trim().toLowerCase().split('/');
      let q = 1;
      for (const param of params) {
        const [key, value] = param.trim().split('=');
        if (key?.trim().toLowerCase() === 'q') {
          const parsed = Number.parseFloat(value);
          q = Number.isNaN(parsed) ? 0 : Math.min(Math.max(parsed, 0), 1);
        }
      }
      return { type, subtype, q };
    })
    .filter((entry) => entry.type && entry.subtype);
}

/**
 * q-value of the most specific range matching `mime`, or 0 when none matches.
 * @param {{ type: string, subtype: string, q: number }[]} entries
 * @param {string} mime
 */
function qualityOf(entries, mime) {
  const [type, subtype] = mime.split('/');
  let best = { specificity: -1, q: 0 };
  for (const entry of entries) {
    let specificity = -1;
    if (entry.type === type && entry.subtype === subtype) specificity = 2;
    else if (entry.type === type && entry.subtype === '*') specificity = 1;
    else if (entry.type === '*' && entry.subtype === '*') specificity = 0;
    if (specificity > best.specificity) best = { specificity, q: entry.q };
  }
  return best.q;
}

/**
 * @param {string | undefined} header the request's Accept header
 * @returns {'html' | 'markdown' | null} null means 406 Not Acceptable
 */
export function negotiate(header) {
  if (!header || !header.trim()) return 'html';

  const entries = parseAccept(header);
  if (entries.length === 0) return 'html';

  const htmlQ = qualityOf(entries, 'text/html');
  const markdownQ = qualityOf(entries, 'text/markdown');
  const namesMarkdown = entries.some(
    (e) => e.type === 'text' && e.subtype === 'markdown' && e.q > 0,
  );

  if (namesMarkdown && markdownQ >= htmlQ) return 'markdown';
  if (htmlQ > 0) return 'html';
  if (markdownQ > 0) return 'markdown';
  return null;
}
