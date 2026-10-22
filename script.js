'use strict';

const translations = window.BirthdayCopy;
let language = new URLSearchParams(window.location.search).get('lang') === 'fil' ? 'fil' : 'en';
function t(key, values = {}) {
  const template = translations?.[language]?.[key] || translations?.en?.[key] || '';
  return template.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ''));
}

const candles = [...document.querySelectorAll('.candle')];
const wish = document.querySelector('#wish');
const status = document.querySelector('.wish-status');
const hint = document.querySelector('.hint');
const scene = document.querySelector('.cake-scene');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const motion = window.BirthdayMotion ? new window.BirthdayMotion(reducedMotion) : null;
let systemReducedMotion = reducedMotion.matches;
const effects = window.BirthdayEffects
  ? new window.BirthdayEffects(document.querySelector('#celebration-effects'), scene, reducedMotion) : null;
let celebrated = false;
let motionPaused = false;

document.querySelector('.experience-controls').hidden = false;
document.querySelector('#share').hidden = false;

function setWishButton(text) {
  wish.replaceChildren(document.createTextNode(text));
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('icon');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', '#i-spark');
  svg.append(use);
  wish.append(svg);
}

function renderCandles() {
  const remaining = candles.filter(candle => !candle.classList.contains('out')).length;
  if (celebrated) status.textContent = t('wish-complete');
  else if (remaining === 5) status.textContent = t('wish-initial');
  else status.textContent = t(remaining === 1 ? 'wish-remaining-one' : 'wish-remaining-many', { count: remaining });
  setWishButton(t(celebrated ? 'wish-again' : 'wish-blow'));
  hint.textContent = t(celebrated ? 'wish-complete-hint' : 'wish-hint');
  candles.forEach((candle, index) => {
    candle.setAttribute('aria-label', t(candle.classList.contains('out') ? 'candle-out' : 'candle-blow', { number: index + 1 }));
  });
  scene.setAttribute('aria-label', t('cake-label'));
}

function celebrate() {
  if (celebrated || !candles.every(candle => candle.classList.contains('out'))) return;
  celebrated = true;
  scene.classList.add('is-celebrating');
  renderCandles();
  const rect = scene.getBoundingClientRect();
  effects?.celebrate(rect.left + rect.width / 2, rect.top + rect.height * .45);
}

function extinguish(candle) {
  if (candle.classList.contains('out')) return;
  candle.classList.add('out');
  candle.setAttribute('aria-pressed', 'true');
  candle.setAttribute('aria-disabled', 'true');
}

function resetCandles() {
  celebrated = false;
  effects?.clearBurst();
  scene.classList.remove('is-celebrating');
  candles.forEach(candle => {
    candle.classList.remove('out');
    candle.removeAttribute('aria-disabled');
    candle.setAttribute('aria-pressed', 'false');
  });
  renderCandles();
}

candles.forEach(candle => candle.addEventListener('click', () => {
  if (candle.getAttribute('aria-disabled') === 'true') return;
  extinguish(candle);
  renderCandles();
  celebrate();
}));
wish.addEventListener('click', () => {
  if (celebrated) resetCandles();
  else { candles.forEach(extinguish); celebrate(); }
});

const motionButton = document.querySelector('#motion');
function updateMotion() {
  const stopped = motionPaused || systemReducedMotion;
  document.body.classList.toggle('motion-paused', stopped);
  motionButton.setAttribute('aria-pressed', String(stopped));
  motionButton.querySelector('span').textContent = t(systemReducedMotion ? 'effects-reduced' : stopped ? 'effects-play' : 'effects-pause');
  motionButton.querySelector('use').setAttribute('href', stopped ? '#i-play' : '#i-pause');
  motionButton.disabled = systemReducedMotion;
  effects?.setPaused(stopped);
  motion?.setPaused(stopped);
}
motionButton.addEventListener('click', () => { motionPaused = !motionPaused; updateMotion(); });
reducedMotion.addEventListener('change', event => {
  systemReducedMotion = event.matches;
  updateMotion();
});

const picked = new Set();
let selectedWish = null;
const wishDisplay = document.querySelector('#flower-wish');
const bloomCount = document.querySelector('#bloom-count');
function renderFlowers() {
  wishDisplay.querySelector('h3').textContent = t(selectedWish ? `wish-${selectedWish}-title` : 'wish-default-title');
  wishDisplay.querySelector('p').textContent = t(selectedWish ? `wish-${selectedWish}-text` : 'wish-default-text');
  bloomCount.textContent = t(picked.size === 5 ? 'bloom-count-all' : picked.size ? 'bloom-count-some' : 'bloom-count-zero', { count: picked.size });
  document.querySelector('.bouquet').setAttribute('aria-label', t('bouquet-label'));
  document.querySelectorAll('.bloom').forEach(bloom => {
    bloom.setAttribute('aria-label', t(`flower-${bloom.dataset.wish}-label`));
  });
}
document.querySelectorAll('.bloom').forEach(bloom => bloom.addEventListener('click', () => {
  selectedWish = bloom.dataset.wish;
  document.querySelectorAll('.bloom').forEach(item => item.setAttribute('aria-pressed', String(item === bloom)));
  picked.add(selectedWish);
  renderFlowers();
  wishDisplay.classList.remove('is-changing');
  void wishDisplay.offsetWidth;
  wishDisplay.classList.add('is-changing');
  const rect = bloom.getBoundingClientRect();
  effects?.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 16);
}));

const letter = document.querySelector('.letter');
function renderLetter() {
  const label = translations ? t(letter.open ? 'letter-close' : 'letter-open') : letter.open ? 'Close your letter' : 'Open your letter';
  letter.querySelector('.open-label').firstChild.textContent = label + ' ';
}
letter.addEventListener('toggle', renderLetter);

const musicButton = document.querySelector('#music');
const audioStatus = document.querySelector('#audio-status');
let musicPending = false;
let musicFailed = false;
let musicAction = 0;
let audioStatusKey = '';
function renderMusic() {
  const playing = Boolean(music?.playing);
  musicButton.setAttribute('aria-pressed', String(playing));
  musicButton.querySelector('span').textContent = t(playing ? 'music-stop' : musicPending ? 'music-cancel' : musicFailed ? 'music-unavailable' : 'music-play');
  musicButton.querySelector('use').setAttribute('href', playing ? '#i-pause' : '#i-music');
  if (musicPending) musicButton.setAttribute('aria-busy', 'true');
  else musicButton.removeAttribute('aria-busy');
  audioStatus.textContent = audioStatusKey ? t(audioStatusKey) : '';
}
const music = window.BirthdayMusic ? new window.BirthdayMusic(playing => {
  const wasActive = musicButton.getAttribute('aria-pressed') === 'true' || musicPending;
  if (!playing) audioStatusKey = wasActive ? 'audio-stopped' : '';
  renderMusic();
}) : null;
musicButton.addEventListener('click', async () => {
  const action = ++musicAction;
  if (music?.playing || musicPending) {
    music?.stop();
    musicPending = false;
    renderMusic();
    return;
  }
  musicPending = true;
  musicFailed = false;
  audioStatusKey = '';
  renderMusic();
  try {
    if (!music) throw new Error('Audio unavailable');
    await music.play();
    if (action !== musicAction) return;
    audioStatusKey = music.playing ? 'audio-playing' : '';
  } catch (error) {
    if (action !== musicAction) return;
    music?.stop();
    if (document.hidden || error.name === 'AbortError') return;
    musicFailed = true;
    audioStatusKey = 'audio-unavailable';
  } finally {
    if (action === musicAction) {
      musicPending = false;
      renderMusic();
    }
  }
});

const publicURL = 'https://zeref538.github.io/mama-birthday/';
const shareStatus = document.querySelector('#share-status');
const shareButton = document.querySelector('#share');
let shareStatusKey = '';
function shareURL() { return language === 'fil' ? `${publicURL}?lang=fil` : publicURL; }
function renderShareStatus() { shareStatus.textContent = shareStatusKey ? t(shareStatusKey) : ''; }
shareButton.addEventListener('click', async () => {
  shareStatusKey = '';
  renderShareStatus();
  document.querySelector('#share-fallback').hidden = true;
  shareButton.disabled = true;
  try {
    if (navigator.share) {
      try {
        await navigator.share({ title: t('share-title'), text: t('share-text'), url: shareURL() });
        return;
      } catch (error) { if (error.name === 'AbortError') return; }
    }
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(shareURL());
      shareStatusKey = 'share-copied';
    } catch {
      document.querySelector('#share-fallback').hidden = false;
      const input = document.querySelector('#share-url');
      input.value = shareURL();
      input.focus();
      input.select();
      shareStatusKey = 'share-manual';
    }
    renderShareStatus();
  } finally { shareButton.disabled = false; }
});

const languageButton = document.querySelector('#language');
function applyLanguage() {
  document.documentElement.lang = language;
  document.title = t('page-title');
  document.querySelector('.wordmark').setAttribute('aria-label', t('home-label'));
  document.querySelector('.birthday-dedication').setAttribute('aria-label', t('dedication-label'));
  document.querySelector('.letter-section').setAttribute('aria-label', t('letter-section-label'));
  document.querySelectorAll('[data-copy]').forEach(element => {
    element.textContent = t(element.dataset.copy);
  });
  languageButton.textContent = language === 'en' ? 'Filipino' : 'English';
  languageButton.lang = language === 'en' ? 'fil' : 'en';
  languageButton.setAttribute('aria-label', language === 'en' ? 'Gawing Filipino ang website' : 'Switch website to English');
  document.querySelector('.keepsake-image').setAttribute('aria-label', t('card-label'));
  document.querySelector('.keepsake img').alt = t('card-alt');
  document.querySelector('#share-url').value = shareURL();
  renderCandles();
  renderFlowers();
  renderLetter();
  updateMotion();
  renderMusic();
  renderShareStatus();
}
languageButton.addEventListener('click', () => {
  language = language === 'en' ? 'fil' : 'en';
  applyLanguage();
});
if (translations?.en && translations?.fil) {
  applyLanguage();
  if (window.BirthdayOpening) new window.BirthdayOpening({
    motion, effects, onReady: updateMotion, startMusic: () => musicButton.click(),
  });
} else {
  // Keep the native letter and card usable if the copy file failed to arrive.
  effects?.setPaused(true);
  motion?.setPaused(true);
  document.body.classList.add('motion-paused');
  document.querySelector('.experience-controls').hidden = true;
  shareButton.hidden = true;
  [...candles, wish, ...document.querySelectorAll('.bloom')].forEach(button => { button.disabled = true; });
  hint.textContent = 'Some birthday surprises could not load. Refresh this page to try again.';
  wishDisplay.querySelector('p').textContent = 'Refresh this page to load the flower wishes.';
}
