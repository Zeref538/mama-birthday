'use strict';

const candles = [...document.querySelectorAll('.candle')];
const wish = document.querySelector('#wish');
const status = document.querySelector('.wish-status');
const hint = document.querySelector('.hint');
const scene = document.querySelector('.cake-scene');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const effects = window.BirthdayEffects
  ? new window.BirthdayEffects(document.querySelector('#celebration-effects'), scene, reducedMotion) : null;
let celebrated = false;
let motionPaused = false;

document.querySelector('.experience-controls').hidden = false;
document.querySelector('#share').hidden = false;

function setWishButton(text, icon) {
  wish.replaceChildren(document.createTextNode(text));
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('icon'); svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#i-${icon}`); svg.append(use); wish.append(svg);
}

function celebrate() {
  if (celebrated || !candles.every(candle => candle.classList.contains('out'))) return;
  celebrated = true;
  status.textContent = 'May your wish come true, Ma.';
  setWishButton('Make another wish', 'spark');
  hint.textContent = 'Happy birthday, Alma. You are so loved.';
  scene.classList.add('is-celebrating');
  const rect = scene.getBoundingClientRect();
  effects?.burst(rect.left + rect.width / 2, rect.top + rect.height * .45);
}

function extinguish(candle) {
  if (candle.classList.contains('out')) return;
  candle.classList.add('out');
  candle.setAttribute('aria-pressed', 'true');
  candle.setAttribute('aria-disabled', 'true');
  candle.setAttribute('aria-label', `Candle ${candles.indexOf(candle) + 1} is blown out`);
}

function resetCandles() {
  celebrated = false;
  effects?.clearBurst(); scene.classList.remove('is-celebrating');
  candles.forEach((candle, index) => {
    candle.classList.remove('out'); candle.removeAttribute('aria-disabled');
    candle.setAttribute('aria-pressed', 'false');
    candle.setAttribute('aria-label', `Blow out candle ${index + 1}`);
  });
  status.textContent = 'Close your eyes. Make a wish.';
  setWishButton('Blow out the candles', 'spark');
  hint.textContent = 'or tap each little flame';
}

candles.forEach(candle => candle.addEventListener('click', () => {
  if (candle.getAttribute('aria-disabled') === 'true') return;
  extinguish(candle);
  const remaining = candles.filter(item => !item.classList.contains('out')).length;
  if (remaining) status.textContent = `${remaining} ${remaining === 1 ? 'candle' : 'candles'} left. Keep wishing.`;
  celebrate();
}));
wish.addEventListener('click', () => {
  if (celebrated) resetCandles();
  else { candles.forEach(extinguish); celebrate(); }
});

const motionButton = document.querySelector('#motion');
function updateMotion() {
  const stopped = motionPaused || reducedMotion.matches;
  document.body.classList.toggle('motion-paused', stopped);
  motionButton.setAttribute('aria-pressed', String(stopped));
  motionButton.querySelector('span').textContent = reducedMotion.matches ? 'Reduced motion' : stopped ? 'Play effects' : 'Pause effects';
  motionButton.querySelector('use').setAttribute('href', stopped ? '#i-play' : '#i-pause');
  motionButton.disabled = reducedMotion.matches;
  effects?.setPaused(stopped);
}
motionButton.addEventListener('click', () => { motionPaused = !motionPaused; updateMotion(); });
reducedMotion.addEventListener('change', updateMotion);
updateMotion();

const wishes = {
  peace: ['A little more peace.', 'May this year bring gentle mornings, lighter worries, and room to simply be.'],
  joy: ['Joy in the little things.', 'May the ordinary days surprise you with laughter and the kind of happiness that stays.'],
  love: ['Love, all around you.', 'May you feel loved in the quiet moments as much as in the big celebrations.'],
  rest: ['Time, just for you.', 'May there be slow afternoons, deep breaths, and lovely days with nothing to rush.'],
  adventure: ['Beautiful things ahead.', 'May the year open new doors, bring sweet surprises, and give you something wonderful to look forward to.'],
};
const picked = new Set();
const wishDisplay = document.querySelector('#flower-wish');
const bloomCount = document.querySelector('#bloom-count');
document.querySelectorAll('.bloom').forEach(bloom => bloom.addEventListener('click', () => {
  const key = bloom.dataset.wish;
  const [title, text] = wishes[key];
  document.querySelectorAll('.bloom').forEach(item => item.setAttribute('aria-pressed', String(item === bloom)));
  picked.add(key);
  wishDisplay.querySelector('h3').textContent = title;
  wishDisplay.querySelector('p').textContent = text;
  wishDisplay.classList.remove('is-changing');
  void wishDisplay.offsetWidth;
  wishDisplay.classList.add('is-changing');
  bloomCount.textContent = picked.size === 5 ? 'All five wishes, with love for you.' : `${picked.size} of 5 birthday wishes discovered`;
  const rect = bloom.getBoundingClientRect();
  effects?.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 16);
}));

const letter = document.querySelector('.letter');
letter.addEventListener('toggle', () => {
  letter.querySelector('.open-label').firstChild.textContent = letter.open ? 'Close your letter ' : 'Open your letter ';
});

const musicButton = document.querySelector('#music');
const audioStatus = document.querySelector('#audio-status');
let musicPending = false;
let musicAction = 0;
const music = window.BirthdayMusic ? new window.BirthdayMusic(playing => {
  const wasActive = musicButton.getAttribute('aria-pressed') === 'true' || musicPending;
  musicButton.setAttribute('aria-pressed', String(playing));
  musicButton.querySelector('span').textContent = playing ? 'Stop music' : 'Play music';
  musicButton.querySelector('use').setAttribute('href', playing ? '#i-pause' : '#i-music');
  if (!playing) audioStatus.textContent = wasActive ? 'Music stopped.' : '';
}) : null;
musicButton.addEventListener('click', async () => {
  const action = ++musicAction;
  if (music?.playing || musicPending) {
    music?.stop(); musicPending = false;
    musicButton.removeAttribute('aria-busy');
    return;
  }
  musicPending = true;
  musicButton.setAttribute('aria-busy', 'true');
  musicButton.querySelector('span').textContent = 'Cancel music';
  audioStatus.textContent = '';
  try {
    if (!music) throw new Error('Audio unavailable');
    await music.play();
    if (action !== musicAction) return;
    audioStatus.textContent = music.playing ? 'Playing a birthday melody. Tap Stop music to stop.' : '';
  } catch (error) {
    if (action !== musicAction) return;
    music?.stop();
    if (document.hidden || error.name === 'AbortError') return;
    audioStatus.textContent = 'Music is unavailable in this browser. The rest of your celebration still works.';
    musicButton.querySelector('span').textContent = 'Music unavailable';
  } finally {
    if (action === musicAction) {
      musicPending = false;
      musicButton.removeAttribute('aria-busy');
    }
  }
});

const publicURL = 'https://zeref538.github.io/mama-birthday/';
const shareStatus = document.querySelector('#share-status');
document.querySelector('#share').addEventListener('click', async () => {
  shareStatus.textContent = ''; document.querySelector('#share-fallback').hidden = true;
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Happy Birthday, Ma | Alma Merong', text: 'A birthday garden, made with love for Ma.', url: publicURL });
      return;
    } catch (error) { if (error.name === 'AbortError') return; }
  }
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(publicURL);
    shareStatus.textContent = 'Birthday link copied. Send a little love.';
  } catch {
    document.querySelector('#share-fallback').hidden = false;
    const input = document.querySelector('#share-url'); input.focus(); input.select();
    shareStatus.textContent = 'Select and copy the link below to share it.';
  }
});
