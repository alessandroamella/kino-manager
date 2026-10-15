import assert from 'node:assert/strict';
import { test } from 'node:test';
import { negotiate } from './accept.js';

test('missing or empty Accept gets HTML', () => {
  assert.equal(negotiate(undefined), 'html');
  assert.equal(negotiate(''), 'html');
});

test('browser Accept headers get HTML', () => {
  assert.equal(
    negotiate(
      'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    ),
    'html',
  );
  assert.equal(negotiate('*/*'), 'html');
  assert.equal(negotiate('text/*'), 'html');
});

test('explicit Markdown gets Markdown', () => {
  assert.equal(negotiate('text/markdown'), 'markdown');
});

test('tie between HTML and Markdown goes to Markdown', () => {
  assert.equal(negotiate('text/markdown, text/html'), 'markdown');
  assert.equal(negotiate('text/html, text/markdown'), 'markdown');
  assert.equal(negotiate('text/markdown, */*'), 'markdown');
});

test('q-values are compared, not substrings', () => {
  assert.equal(negotiate('text/html, text/markdown;q=0.5'), 'html');
  assert.equal(negotiate('text/html;q=0.5, text/markdown'), 'markdown');
  assert.equal(negotiate('text/markdown;q=0, text/html'), 'html');
});

test('neither acceptable is a 406', () => {
  assert.equal(negotiate('image/png'), null);
  assert.equal(negotiate('application/json'), null);
  assert.equal(negotiate('text/html;q=0, text/markdown;q=0'), null);
});
