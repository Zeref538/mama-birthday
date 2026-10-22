'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness({ available = true, deferredResume = false, running = true, rejectResume = false } = {}) {
  const listeners = new Map();
  const timers = new Map();
  const contexts = [];
  const changes = [];
  const pending = [];
  let timerId = 0;
  const document = {
    hidden: false,
    addEventListener(type, listener) { listeners.set(type, listener); },
  };
  class AudioContext {
    constructor() {
      this.state = 'suspended';
      this.currentTime = 10;
      this.destination = {};
      this.oscillators = [];
      this.peaks = [];
      contexts.push(this);
    }
    resume() {
      if (rejectResume) return Promise.reject(new Error('Resume denied'));
      if (!deferredResume) { this.state = running ? 'running' : 'suspended'; return Promise.resolve(); }
      return new Promise(resolve => pending.push(() => { this.state = running ? 'running' : 'suspended'; resolve(); }));
    }
    createOscillator() {
      const voice = {
        frequency: {}, stops: [], starts: [], disconnected: false,
        connect() {},
        start(time) { this.starts.push(time); },
        stop(time) { this.stops.push(time); },
        disconnect() { this.disconnected = true; },
      };
      this.oscillators.push(voice);
      return voice;
    }
    createGain() {
      return {
        gain: { setValueAtTime() {}, linearRampToValueAtTime: value => this.peaks.push(value), exponentialRampToValueAtTime() {} },
        connect() {}, disconnect() {},
      };
    }
  }
  const window = {
    setTimeout(callback, delay) { const id = ++timerId; timers.set(id, { callback, delay }); return id; },
  };
  if (available) window.AudioContext = AudioContext;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'music.js'), 'utf8'), {
    window, document, clearTimeout(id) { timers.delete(id); },
  });
  const music = new window.BirthdayMusic(playing => changes.push(playing));
  return {
    music, contexts, changes, timers, document,
    resumeNext() { const resume = pending.shift(); assert.ok(resume, 'a resume should be pending'); resume(); },
    visibility(hidden) { document.hidden = hidden; listeners.get('visibilitychange')(); },
    finish() { const timer = [...timers.values()][0]; assert.ok(timer); timers.clear(); timer.callback(); },
  };
}

test('music stays silent until explicitly played, then schedules a finite melody', async () => {
  const h = harness();
  assert.equal(h.contexts.length, 0, 'constructing the control must not request audio');
  assert.equal(h.music.playing, false);
  await h.music.play();
  assert.equal(h.contexts.length, 1);
  assert.ok(h.contexts[0].peaks.every(value => value === .28), 'the louder melody keeps a bounded note gain');
  assert.equal(h.music.playing, true);
  assert.deepEqual(h.changes, [true]);
  const voices = h.contexts[0].oscillators;
  assert.ok(voices.length > 0 && voices.length < 40, 'melody must have a finite note count');
  assert.ok(voices.every(voice => voice.starts.length === 1 && voice.stops[0] > voice.starts[0]));
  assert.equal(h.timers.size, 1);
  const duration = [...h.timers.values()][0].delay;
  assert.ok(duration > 1000 && duration < 30000, 'playback must end instead of silently looping');
});

test('stop silences scheduled notes and cancels completion work; replay reuses the context', async () => {
  const h = harness();
  await h.music.play();
  const voices = [...h.contexts[0].oscillators];
  h.music.stop();
  assert.equal(h.music.playing, false);
  assert.equal(h.music.voices.length, 0);
  assert.equal(h.timers.size, 0);
  assert.ok(voices.every(voice => voice.stops.includes(undefined)), 'stop must immediately silence every note');
  await h.music.play();
  assert.equal(h.contexts.length, 1, 'replays should not leak audio contexts');
  assert.equal(h.timers.size, 1);
});

test('stopping during a pending browser resume prevents late playback', async () => {
  const h = harness({ deferredResume: true });
  const play = h.music.play();
  h.music.stop();
  h.resumeNext();
  await play;
  assert.equal(h.music.playing, false);
  assert.equal(h.contexts[0].oscillators.length, 0);
  assert.equal(h.timers.size, 0);
  assert.ok(!h.changes.includes(true));
});

test('a newer play request wins when browser resume promises settle out of order', async () => {
  const h = harness({ deferredResume: true });
  const first = h.music.play();
  const second = h.music.play();
  h.resumeNext();
  await first;
  assert.equal(h.contexts[0].oscillators.length, 0, 'superseded request must not schedule notes');
  h.resumeNext();
  await second;
  assert.equal(h.music.playing, true);
  assert.deepEqual(h.changes, [true]);
  assert.equal(h.timers.size, 1);
});

test('hidden page stops active music and prevents pending playback from starting', async () => {
  const playing = harness();
  await playing.music.play();
  playing.visibility(true);
  assert.equal(playing.music.playing, false);
  assert.equal(playing.timers.size, 0);
  playing.visibility(false);
  assert.equal(playing.music.playing, false, 'returning to the tab must not autoplay');

  const pending = harness({ deferredResume: true });
  const play = pending.music.play();
  pending.visibility(true);
  pending.resumeNext();
  await play;
  assert.equal(pending.contexts[0].oscillators.length, 0);
});

test('natural completion updates playback state and finished voices release connections', async () => {
  const h = harness();
  await h.music.play();
  const voice = h.contexts[0].oscillators[0];
  voice.onended();
  assert.equal(voice.disconnected, true);
  assert.equal(h.music.voices.includes(voice), false);
  h.finish();
  assert.equal(h.music.playing, false);
  assert.equal(h.music.voices.length, 0);
  assert.deepEqual(h.changes, [true, false]);
});

test('unavailable or blocked audio rejects without claiming playback started', async () => {
  for (const options of [{ available: false }, { running: false }, { rejectResume: true }]) {
    const h = harness(options);
    await assert.rejects(h.music.play());
    assert.equal(h.music.playing, false);
    assert.equal(h.timers.size, 0);
    assert.ok(!h.changes.includes(true));
  }
});

function mediaHarness({ deferred = false, rejected = false } = {}) {
  const instances = [];
  const changes = [];
  const pending = [];
  const listeners = new Map();
  const document = {
    hidden: false,
    addEventListener(type, callback) { listeners.set(type, callback); },
  };
  class Audio {
    constructor(src) {
      this.src = src;
      this.paused = true;
      this.currentTime = 0;
      this.playCount = 0;
      this.pauseCount = 0;
      instances.push(this);
    }
    play() {
      this.playCount++;
      if (rejected) return Promise.reject(new Error('Media playback denied'));
      if (deferred) return new Promise((resolve, reject) => pending.push({
        resolve: () => { this.paused = false; resolve(); }, reject,
      }));
      this.paused = false;
      return Promise.resolve();
    }
    pause() { this.paused = true; this.pauseCount++; }
  }
  const window = { Audio, setTimeout() { throw new Error('Native media should use ended, not a guessed duration'); } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'music.js'), 'utf8'), {
    window, document, clearTimeout() {},
  });
  const music = new window.BirthdayMusic(playing => changes.push(playing));
  return {
    music, instances, changes,
    resolve(index = 0) { assert.ok(pending[index], 'a media play should be pending'); pending[index].resolve(); },
    hide() { document.hidden = true; listeners.get('visibilitychange')(); },
  };
}

test('native media fallback creates and plays its audio only after an explicit request', async () => {
  const h = mediaHarness();
  assert.equal(h.instances.length, 0);
  assert.equal(h.music.playing, false);
  await h.music.play();
  assert.equal(h.instances.length, 1);
  assert.equal(h.instances[0].src, 'assets/birthday-melody.wav?v=7');
  assert.equal(h.instances[0].volume, 1);
  assert.equal(h.instances[0].paused, false);
  assert.equal(h.music.playing, true);
  assert.deepEqual(h.changes, [true]);
});

test('native media stop resets the track, and replay reuses the existing audio element', async () => {
  const h = mediaHarness();
  await h.music.play();
  h.instances[0].currentTime = 8;
  h.music.stop();
  assert.equal(h.instances[0].paused, true);
  assert.equal(h.instances[0].currentTime, 0);
  assert.equal(h.music.playing, false);
  await h.music.play();
  assert.equal(h.instances.length, 1);
  assert.equal(h.instances[0].playCount, 2);
  assert.equal(h.instances[0].paused, false);
});

test('native media completion resets playback and announces the stopped state', async () => {
  const h = mediaHarness();
  await h.music.play();
  h.instances[0].currentTime = 12;
  h.instances[0].onended();
  assert.equal(h.music.playing, false);
  assert.equal(h.instances[0].paused, true);
  assert.equal(h.instances[0].currentTime, 0);
  assert.deepEqual(h.changes, [true, false]);
});

test('native media play failure does not claim playback or create extra audio elements', async () => {
  const h = mediaHarness({ rejected: true });
  await assert.rejects(h.music.play());
  assert.equal(h.music.playing, false);
  assert.equal(h.instances[0].paused, true);
  assert.deepEqual(h.changes, []);
  h.music.stop();
  assert.equal(h.instances[0].currentTime, 0);
});

test('native media stop or hidden page cancels pending playback without a late playing state', async () => {
  for (const hide of [false, true]) {
    const h = mediaHarness({ deferred: true });
    const play = h.music.play();
    if (hide) h.hide(); else h.music.stop();
    h.resolve();
    await play;
    assert.equal(h.music.playing, false);
    assert.equal(h.instances[0].paused, true);
    assert.ok(!h.changes.includes(true));
  }
});

test('new native media playback survives a stale prior playback completion', async () => {
  const h = mediaHarness({ deferred: true });
  const oldPlay = h.music.play();
  h.music.stop();
  const newPlay = h.music.play();
  h.resolve(1);
  await newPlay;
  assert.equal(h.music.playing, true);
  assert.equal(h.instances[0].paused, false);
  h.resolve(0);
  await oldPlay;
  assert.equal(h.music.playing, true);
  assert.equal(h.instances[0].paused, false, 'a stale request must not pause the current successful playback');
});
