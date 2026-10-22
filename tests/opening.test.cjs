'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness({ animated = false } = {}) {
  function button() {
    const events = {};
    return { disabled: false, addEventListener(name, action) { events[name] = action; }, focus() {}, click() { events.click(); } };
  }
  const musicButton = button();
  const quietButton = button();
  const heading = { focus() { this.focused = true; } };
  const main = { inert: false, querySelector() { return heading; } };
  const targets = [main, { inert: false }, { inert: false }];
  const bodyClasses = new Set();
  const welcome = {
    hidden: true, classList: { add() {} },
    querySelector(name) { return name === '#enter-birthday' ? musicButton : quietButton; },
    querySelectorAll() { return [musicButton, quietButton]; },
  };
  let resolveAnimation, rejectAnimation;
  const finished = new Promise((resolve, reject) => { resolveAnimation = resolve; rejectAnimation = reject; });
  const document = {
    querySelector(name) { return name === '#welcome' ? welcome : name === 'main' ? main : {}; },
    querySelectorAll() { return targets; },
    body: { classList: { add(name) { bodyClasses.add(name); }, remove(name) { bodyClasses.delete(name); } } },
  };
  const window = { scrollY: 0, innerHeight: 850 };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'opening.js'), 'utf8'), { window, document });
  let starts = 0, resumed = 0;
  new window.BirthdayOpening({
    motion: { setPaused() {}, play() { return animated ? { finished } : null; }, enter() {} },
    effects: { setPaused() {} }, onReady() { resumed++; }, startMusic() { starts++; },
  });
  return { welcome, targets, heading, bodyClasses, musicButton, quietButton, resolveAnimation, rejectAnimation,
    get starts() { return starts; }, get resumed() { return resumed; } };
}

test('quiet entry works without animation and restores access to the page', () => {
  const h = harness();
  assert.equal(h.welcome.hidden, false);
  assert.ok(h.targets.every(target => target.inert));
  h.quietButton.click();
  assert.equal(h.starts, 0);
  assert.equal(h.welcome.hidden, true);
  assert.ok(h.targets.every(target => !target.inert));
  assert.equal(h.heading.focused, true);
});

test('music starts once on the opening tap while the curtain retains focus ownership', async () => {
  const h = harness({ animated: true });
  h.musicButton.click(); h.musicButton.click(); h.quietButton.click();
  assert.equal(h.starts, 1);
  assert.equal(h.resumed, 1);
  assert.ok(h.targets.every(target => target.inert));
  h.resolveAnimation(); await Promise.resolve();
  assert.equal(h.welcome.hidden, true);
  assert.ok(h.targets.every(target => !target.inert));
});

test('an interrupted curtain cannot leave the main page inert', async () => {
  const h = harness({ animated: true });
  h.musicButton.click(); h.rejectAnimation(new Error('Animation interrupted')); await Promise.resolve();
  assert.equal(h.welcome.hidden, true);
  assert.ok(h.targets.every(target => !target.inert));
  assert.equal(h.bodyClasses.has('welcome-open'), false);
});
