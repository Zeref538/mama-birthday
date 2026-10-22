'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function eventSource() {
  const listeners = new Map();
  return {
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(listener);
    },
    dispatch(type, event = {}) { for (const listener of listeners.get(type) || []) listener(event); },
  };
}

function harness({ reduced = false, contextAvailable = true } = {}) {
  const frames = new Map();
  let nextFrame = 0;
  let clearCount = 0;
  let renderedPieces = 0;
  const bodyClasses = new Set();
  const context = {
    setTransform() {}, beginPath() {}, arc() {}, fill() {}, save() {},
    translate() {}, rotate() {}, restore() {},
    clearRect() { clearCount++; },
    fillRect() { renderedPieces++; },
  };
  const canvas = { getContext: () => contextAvailable ? context : null };
  const scene = { getBoundingClientRect: () => ({ left: 10, top: 20, width: 300, height: 350 }) };
  const document = Object.assign(eventSource(), {
    hidden: false,
    body: { classList: { toggle(name, active) { active ? bodyClasses.add(name) : bodyClasses.delete(name); } } },
  });
  const media = Object.assign(eventSource(), { matches: reduced });
  let intersection;
  class IntersectionObserver {
    constructor(callback) { intersection = callback; }
    observe() {}
  }
  const window = Object.assign(eventSource(), {
    innerWidth: 375, innerHeight: 812, devicePixelRatio: 3, IntersectionObserver,
  });
  const sandbox = {
    window, document, IntersectionObserver,
    requestAnimationFrame(callback) { const id = ++nextFrame; frames.set(id, callback); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'effects.js'), 'utf8'), sandbox);
  const effects = new window.BirthdayEffects(canvas, scene, media);
  return {
    effects, window, document, media, canvas, frames, bodyClasses,
    get clears() { return clearCount; },
    get pieces() { return renderedPieces; },
    intersect(visible) { intersection([{ isIntersecting: visible }]); },
    tick(time) {
      const callbacks = [...frames.entries()];
      for (const [id, callback] of callbacks) { frames.delete(id); callback(time); }
    },
  };
}

test('rapid celebrations replace the previous burst and retain one drawing loop', () => {
  const h = harness();
  for (let i = 0; i < 100; i++) h.effects.burst(i, i, 1000);
  assert.equal(h.frames.size, 1, 'replay must not schedule another drawing loop');
  h.tick(100);
  assert.equal(h.pieces, 50, 'only the capped latest burst should render');
  assert.equal(h.frames.size, 1);
  h.effects.clearBurst();
  h.tick(140);
  assert.equal(h.pieces, 50, 'cleared particles must not render again');
});

test('burst particles expire, and an offscreen scene stops scheduling frames', () => {
  const h = harness();
  h.effects.burst(100, 100);
  h.intersect(false);
  let time = 100;
  for (let i = 0; i < 150; i++) { h.tick(time); time += 40; }
  assert.equal(h.effects.particles.length, 0);
  assert.equal(h.frames.size, 0, 'no invisible ambient loop should remain');
  h.intersect(true);
  assert.equal(h.frames.size, 1);
  assert.equal(h.bodyClasses.has('scene-offscreen'), false);
});

test('pause cancels animation, clears visible particles, and rejects new bursts', () => {
  const h = harness();
  h.effects.burst(100, 100);
  const clearsBefore = h.clears;
  h.effects.setPaused(true);
  h.effects.burst(200, 200);
  assert.equal(h.frames.size, 0);
  assert.equal(h.effects.particles.length, 0);
  assert.ok(h.clears > clearsBefore, 'paused effects should disappear immediately');
  for (let i = 0; i < 20; i++) h.effects.setPaused(false);
  assert.equal(h.frames.size, 1, 'repeated resume must retain a single loop');
});

test('hidden-page event cancels particles and resumes only one ambient loop', () => {
  const h = harness();
  h.effects.burst(100, 100);
  h.document.hidden = true;
  h.document.dispatch('visibilitychange');
  assert.equal(h.frames.size, 0);
  assert.equal(h.effects.particles.length, 0);
  assert.equal(h.bodyClasses.has('page-hidden'), true);
  h.document.hidden = false;
  h.document.dispatch('visibilitychange');
  h.document.dispatch('visibilitychange');
  assert.equal(h.frames.size, 1);
  assert.equal(h.bodyClasses.has('page-hidden'), false);
});

test('live reduced-motion event stops effects even when the original matches property is stale', () => {
  const h = harness();
  h.effects.burst(100, 100);
  h.media.dispatch('change', { matches: true });
  assert.equal(h.media.matches, false, 'the fake intentionally reproduces a stale matches property');
  assert.equal(h.frames.size, 0);
  h.effects.burst(100, 100);
  assert.equal(h.effects.particles.length, 0);
  h.media.dispatch('change', { matches: false });
  assert.equal(h.frames.size, 1);
});

test('initial reduced-motion preference starts no drawing or celebration', () => {
  const h = harness({ reduced: true });
  h.effects.burst(0, 0);
  assert.equal(h.frames.size, 0);
  assert.equal(h.effects.particles.length, 0);
});

test('missing canvas support degrades without starting a loop', () => {
  const h = harness({ contextAvailable: false });
  h.effects.burst(10, 10);
  h.effects.setPaused(true);
  h.effects.setPaused(false);
  assert.equal(h.frames.size, 0);
});

test('high density display backing buffer is capped and follows viewport resize', () => {
  const h = harness();
  assert.equal(h.canvas.width, Math.round(375 * 1.5));
  assert.equal(h.canvas.height, Math.round(812 * 1.5));
  h.window.innerWidth = 1440;
  h.window.innerHeight = 900;
  h.window.dispatch('resize');
  assert.equal(h.canvas.width, 2160);
  assert.equal(h.canvas.height, 1350);
  assert.equal(h.frames.size, 1);
});

test('fireworks are staggered, bounded on replay, and expire without timers', () => {
  const h = harness();
  for (let i = 0; i < 50; i++) h.effects.celebrate(180, 300);
  assert.equal(h.effects.particles.length, 90);
  assert.equal(h.frames.size, 1);
  h.tick(100);
  assert.equal(h.pieces, 60, 'only the first 30 sparks and their trails draw initially');
  assert.equal(h.effects.particles.filter(particle => particle.age < 0).length, 60);
  h.intersect(false);
  for (let time = 140; time < 5000; time += 40) h.tick(time);
  assert.equal(h.effects.particles.length, 0);
  assert.equal(h.frames.size, 0);
});

test('fireworks cannot restart under pause or reduced motion', () => {
  for (const reduced of [false, true]) {
    const h = harness({ reduced });
    if (!reduced) h.effects.setPaused(true);
    h.effects.celebrate(100, 100);
    assert.equal(h.effects.particles.length, 0);
    assert.equal(h.frames.size, 0);
  }
});
