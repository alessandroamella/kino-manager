// Markdown representations of the public pages, built from the same sources
// the SPA uses: the Italian locale strings, venue.json and the backend API.
import { readFile } from 'fs/promises';
import { join } from 'path';

const CACHE_TTL_MS = 60 * 1000;
const DOC_IDS = new Set(['tos', 'privacy']);

/** @type {Map<string, { expires: number, value: unknown }>} */
const cache = new Map();

async function cached(key, load) {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;
  const value = await load();
  cache.set(key, { expires: Date.now() + CACHE_TTL_MS, value });
  return value;
}

async function readJson(path) {
  return JSON.parse(await readFile(join(process.cwd(), path), 'utf-8'));
}

async function fetchBackend(path, as = 'json') {
  const res = await fetch(`${process.env.BACKEND_URL}${path}`);
  if (!res.ok) throw new Error(`Backend ${path} responded ${res.status}`);
  return as === 'json' ? res.json() : res.text();
}

const romeDate = new Intl.DateTimeFormat('it-IT', {
  timeZone: 'Europe/Rome',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const romeTime = new Intl.DateTimeFormat('it-IT', {
  timeZone: 'Europe/Rome',
  hour: '2-digit',
  minute: '2-digit',
});
const euro = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
});

async function upcomingOpenings() {
  try {
    const days = await cached('opening-days', () =>
      fetchBackend('/v1/opening-day'),
    );
    const now = Date.now();
    return days
      .filter((day) => new Date(day.closeTimeUTC).getTime() > now)
      .sort((a, b) => new Date(a.openTimeUTC) - new Date(b.openTimeUTC))
      .slice(0, 10);
  } catch (error) {
    console.error('Could not load opening days for Markdown:', error.message);
    return [];
  }
}

export async function renderIndex() {
  const [{ home: h, pages }, venue] = await Promise.all([
    cached('locale-it', () => readJson('public/locales/it/translation.json')),
    cached('venue', () => readJson('src/constants/venue.json')),
  ]);
  const openings = await upcomingOpenings();
  const contactEmail = process.env.VITE_CONTACT_EMAIL;

  const lines = [
    `# ${pages.home}`,
    '',
    `> ${h.kinoCafeSubtitle}`,
    '',
    `## ${h.aboutUsTitle}`,
    '',
    h.aboutUsText1,
    '',
    h.aboutUsText2,
    '',
    `## ${h.activitiesTitle}`,
    '',
    `### ${h.blandeActivitiesTitle}`,
    '',
    h.blandeActivitiesText1,
    '',
    ...[1, 2, 3, 4].map((n) => `- ${h[`blandeActivitiesItem${n}`]}`),
    '',
    h.blandeActivitiesText2,
    '',
    `### ${h.serieActivitiesTitle}`,
    '',
    h.serieActivitiesText1,
    '',
    ...[1, 2, 3].map((n) => `- ${h[`serieActivitiesItem${n}`]}`),
    '',
    `## ${h.openingHours}`,
    '',
    h.openHours,
    '',
  ];

  if (openings.length > 0) {
    lines.push(`## ${h.openingDates}`, '');
    for (const day of openings) {
      const open = new Date(day.openTimeUTC);
      const close = new Date(day.closeTimeUTC);
      const label = day.name ? ` (${day.name})` : '';
      lines.push(
        `- ${romeDate.format(open)}, ${romeTime.format(open)}–${romeTime.format(close)}${label}`,
      );
    }
    lines.push('');
  }

  lines.push(
    '## Dove siamo',
    '',
    `${venue.name}, ${venue.address}`,
    '',
    `- [Indicazioni stradali](https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(venue.name)}&destination_place_id=${venue.mapsPlaceId})`,
    '',
  );

  if (contactEmail) {
    lines.push('## Contatti', '', `- Email: ${contactEmail}`, '');
  }

  lines.push(
    '## Pagine',
    '',
    '- [Menù e prezzi](/menu.md)',
    '- [Termini di servizio](/docs/tos.md)',
    '- [Informativa sulla privacy](/docs/privacy.md)',
    '- [Diventa socio (registrazione)](/auth/signup)',
    '',
  );

  return lines.join('\n');
}

export async function renderMenu() {
  const items = await cached('items', () => fetchBackend('/v1/item'));

  /** @type {Map<string, { description?: string, items: any[] }>} */
  const categories = new Map();
  for (const item of items) {
    const name = item.category?.name ?? 'Altro';
    if (!categories.has(name)) {
      categories.set(name, {
        description: item.category?.description,
        items: [],
      });
    }
    categories.get(name).items.push(item);
  }

  const lines = [
    '# Menù - Kinó Café',
    '',
    '> Prezzi in euro, IVA inclusa. Il menù può variare in base alla disponibilità.',
    '',
  ];
  for (const [name, category] of categories) {
    lines.push(`## ${name}`, '');
    if (category.description) lines.push(category.description, '');
    for (const item of category.items.sort((a, b) =>
      a.name.localeCompare(b.name, 'it'),
    )) {
      const description = item.description ? `: ${item.description}` : '';
      lines.push(
        `- **${item.name}**, ${euro.format(item.price)}${description}`,
      );
    }
    lines.push('');
  }
  return lines.join('\n');
}

/** @param {string} id */
export async function renderDoc(id) {
  if (!DOC_IDS.has(id)) return null;
  return cached(`doc-${id}`, () =>
    fetchBackend(`/v1/static/docs/${id}.md`, 'text'),
  );
}

/**
 * Maps a public HTML path to its Markdown path, or null if it has none.
 * @param {string} path
 */
export function markdownPathFor(path) {
  if (path === '/') return '/index.md';
  if (path === '/menu') return '/menu.md';
  const doc = path.match(/^\/docs\/([a-z]+)$/);
  if (doc && DOC_IDS.has(doc[1])) return `${path}.md`;
  return null;
}

/**
 * Renders the Markdown for a `.md` path, or null if there is none.
 * @param {string} mdPath
 */
export async function renderMarkdown(mdPath) {
  if (mdPath === '/index.md') return renderIndex();
  if (mdPath === '/menu.md') return renderMenu();
  const doc = mdPath.match(/^\/docs\/([a-z]+)\.md$/);
  if (doc) return renderDoc(doc[1]);
  return null;
}

/** @param {string} mdPath */
export function htmlPathFor(mdPath) {
  return mdPath === '/index.md' ? '/' : mdPath.replace(/\.md$/, '');
}
