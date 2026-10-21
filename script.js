'use strict';
const candles = [...document.querySelectorAll('.candle')];
const wish = document.querySelector('#wish');
const status = document.querySelector('.wish-status');
const hint = document.querySelector('.hint');
let celebrated = false;

function celebrate() {
  if (celebrated || !candles.every(candle => candle.classList.contains('out'))) return;
  celebrated = true;
  status.textContent = 'May your wish come true, Ma.';
  wish.innerHTML = 'Make another wish <span aria-hidden="true">↺</span>';
  hint.textContent = 'Happy birthday. You are so loved.';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const holder = document.querySelector('#confetti');
  for (let i = 0; i < 55; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = ['#f3b7cf', '#ead6ae', '#9baf94', '#d5b4dd'][i % 4];
    piece.style.animationDelay = `${Math.random() * .7}s`;
    piece.style.setProperty('--drift', `${Math.random() * 180 - 90}px`);
    holder.append(piece);
  }
  window.setTimeout(() => holder.replaceChildren(), 3600);
}

function extinguish(candle) {
  candle.classList.add('out');
  candle.setAttribute('aria-pressed', 'true');
  candle.setAttribute('aria-label', `Candle ${candles.indexOf(candle) + 1} blown out`);
  candle.disabled = true;
}

candles.forEach(candle => candle.addEventListener('click', () => {
  extinguish(candle);
  const remaining = candles.filter(item => !item.classList.contains('out')).length;
  if (remaining) status.textContent = `${remaining} ${remaining === 1 ? 'candle' : 'candles'} left. Keep wishing.`;
  celebrate();
}));

wish.addEventListener('click', () => {
  if (celebrated) {
    celebrated = false;
    document.querySelector('#confetti').replaceChildren();
    candles.forEach((candle, index) => {
      candle.classList.remove('out');
      candle.disabled = false;
      candle.setAttribute('aria-pressed', 'false');
      candle.setAttribute('aria-label', `Blow out candle ${index + 1}`);
    });
    status.textContent = 'Close your eyes. Make a wish.';
    wish.innerHTML = 'Blow out the candles <span aria-hidden="true">✧</span>';
    hint.textContent = 'or tap each little flame';
  } else {
    candles.forEach(extinguish);
    celebrate();
  }
});
