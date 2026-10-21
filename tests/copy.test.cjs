const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'copy.js'), 'utf8'), context);
const { en, fil } = context.window.BirthdayCopy;

test('both languages cover the same nonempty plain-text messages', () => {
  assert.deepEqual(Object.keys(fil).sort(), Object.keys(en).sort());
  for (const locale of [en, fil]) {
    for (const [key, value] of Object.entries(locale)) {
      assert.equal(typeof value, 'string', key);
      assert.ok(value.trim().length, key);
      assert.doesNotMatch(value, /<[^>]+>/, `${key} must be text, not HTML`);
    }
  }
});

test('translated dynamic messages retain their count and candle placeholders', () => {
  for (const key of Object.keys(en)) {
    assert.deepEqual(fil[key].match(/\{\w+\}/g) || [], en[key].match(/\{\w+\}/g) || [], key);
  }
});

test('every static copy key used by the page exists in both languages', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  for (const [, key] of html.matchAll(/data-copy="([^"]+)"/g)) {
    assert.ok(en[key] && fil[key], `page copy ${key} must exist`);
  }
  const letter = html.match(/<div id="personal-message"[\s\S]*?<\/div>/)[0];
  assert.doesNotMatch(letter, /data-copy=/, 'language switching must never replace the personal letter');
});
