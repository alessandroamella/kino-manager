import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import { readFile } from 'fs/promises';
import helmet from 'helmet';
import { join } from 'path';
import permissionsPolicy from 'permissions-policy';
import ViteExpress from 'vite-express';
import { negotiate } from './accept.js';
import { htmlPathFor, markdownPathFor, renderMarkdown } from './markdown.js';

const app = express();

// behind the nginx reverse proxy: lets req.protocol report https
app.set('trust proxy', 1);
ViteExpress.config({
  mode: 'production',
});

const port = Number(process.env.PORT);

const backendUrl = process.env.BACKEND_URL;

if (!port) {
  throw new Error('PORT environment variable is required');
} else if (!backendUrl) {
  throw new Error('BACKEND_URL environment variable is required');
}

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', port);
console.log('BACKEND_URL:', backendUrl);

// Secure the app with Helmet and configure Content Security Policy
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'wasm-unsafe-eval'",
          'https://maps.googleapis.com',
          'https://maps.gstatic.com',
          'https://www.googletagmanager.com',
          'https://unpkg.com',
          "'sha256-f7qoEK4P8VgPdPQa2uOb8DGnuvCBiAT4Xha206/wY/I='",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://fonts.googleapis.com',
          'https://maps.googleapis.com',
          'https://maps.gstatic.com',
        ],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://maps.gstatic.com',
          'https://*.googleapis.com',
          'https://www.googletagmanager.com',
          'https://gravatar.com',
          'https://kinocafe-static.bitrey.it',
          'https://static.bitrey.it',
        ],
        connectSrc: [
          "'self'",
          'https://maps.googleapis.com',
          'https://*.googleapis.com',
          'https://www.googletagmanager.com',
          'https://*.google-analytics.com',
          'https://unpkg.com',
        ],
        fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
      },
    },
  }),
);

app.use(
  permissionsPolicy({
    features: {
      fullscreen: ['self'],
      payment: [],
      syncXhr: [],
      serial: ['self'], // cashier needs Web Serial API for esp32
      camera: ['self'], // admins need camera access for QR scanner
    },
  }),
);

// Markdown versions of public pages for LLMs and agents: explicit `.md` URLs
// plus `Accept: text/markdown` negotiation on the HTML URLs
const markdownHeaders = (res, htmlPath) => {
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Vary', 'Accept');
  res.setHeader('Link', `<${htmlPath}>; rel="canonical"; type="text/html"`);
};

const sendMarkdown = async (res, mdPath) => {
  try {
    const markdown = await renderMarkdown(mdPath);
    if (markdown === null) {
      return res.status(404).type('text/plain').send('Not Found\n');
    }
    markdownHeaders(res, htmlPathFor(mdPath));
    return res.send(markdown);
  } catch (err) {
    console.error(`Error rendering ${mdPath}:`, err);
    markdownHeaders(res, htmlPathFor(mdPath));
    return res
      .status(503)
      .send('# Temporarily unavailable\n\nPlease try again later.\n');
  }
};

const escapeHtml = (value) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ],
  );

const markdownPointerHtml = (absoluteMdUrl) =>
  `<div aria-hidden="true" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap">A Markdown version of this page is available at ${escapeHtml(absoluteMdUrl)}.</div>`;

app.get('/llms-full.txt', (_req, res) => res.redirect(302, '/index.md'));

app.use(async (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();

  if (req.path.endsWith('.md')) {
    return sendMarkdown(res, req.path);
  }

  const mdPath = markdownPathFor(req.path);
  if (!mdPath) return next();

  res.setHeader('Vary', 'Accept');
  res.setHeader('Link', `<${mdPath}>; rel="alternate"; type="text/markdown"`);

  const preferred = negotiate(req.headers.accept);
  if (preferred === null) {
    return res
      .status(406)
      .type('text/plain')
      .send(
        'Not Acceptable: this page is available as text/html or text/markdown\n',
      );
  }
  if (preferred === 'markdown') {
    return sendMarkdown(res, mdPath);
  }

  // HTML: advertise the Markdown alternate inside the document too, for
  // fetchers that parse the DOM but never run the SPA's JavaScript
  let html;
  try {
    html = await readFile(join(process.cwd(), 'dist', 'index.html'), 'utf-8');
  } catch {
    return next(); // no build yet, the fallback below handles it
  }
  const absoluteMdUrl = `${req.protocol}://${req.get('host')}${mdPath}`;
  html = html
    .replace(
      '</head>',
      `  <link rel="alternate" type="text/markdown" href="${mdPath}" />\n  </head>`,
    )
    .replace('<body>', `<body>\n    ${markdownPointerHtml(absoluteMdUrl)}`);
  return res.type('html').send(html);
});

// Serve public directory
const publicDir = join(process.cwd(), 'public');
console.log('Serving static files from:', publicDir);
app.use(express.static(publicDir));

app.use((req, res, next) => {
  // Check if the request is for a static file or API
  if (req.path.startsWith('/api') || req.path.includes('.')) {
    return next();
  }

  // Try to serve the index.html from the build directory
  const indexPath = join(process.cwd(), 'dist', 'index.html');

  fs.access(indexPath, fs.constants.F_OK, async (err) => {
    if (err) {
      // If index.html doesn't exist, serve the fallback HTML
      console.log(`Build not available, serving fallback HTML for ${req.path}`);
      res.setHeader('Content-Type', 'text/html');
      const fallbackHtml = await readFile(
        join(process.cwd(), 'fallback.html'),
        'utf-8',
      );
      return res.status(503).send(fallbackHtml);
    }
    // If the build exists, let ViteExpress handle it
    next();
  });
});

ViteExpress.listen(app, port, () => {
  console.log(`Server is running on port ${port}`);
});
