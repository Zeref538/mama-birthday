'use strict';

// Content starts visible. Motion is an enhancement with one owner for cleanup.
window.BirthdayMotion = class BirthdayMotion {
  constructor(media) {
    this.reduced = media.matches;
    this.paused = false;
    this.active = new Set();
    this.seen = new WeakSet();
    this.sections = [...document.querySelectorAll('.birthday, .birthday-dedication, .wishes-section, .letter-section, .closing')];
    this.letter = document.querySelector('.letter');
    this.letterTarget = this.letter.open;
    this.letterAnimation = null;
    this.scrollFrame = 0;
    this.updateScroll = this.updateScroll.bind(this);
    window.addEventListener('scroll', () => {
      if (this.enabled && !this.scrollFrame) this.scrollFrame = requestAnimationFrame(this.updateScroll);
    }, { passive: true });
    window.addEventListener('resize', () => {
      if (this.enabled && !this.scrollFrame) this.scrollFrame = requestAnimationFrame(this.updateScroll);
    }, { passive: true });
    media.addEventListener('change', event => { this.reduced = event.matches; this.sync(); });
    document.addEventListener('visibilitychange', () => this.sync());
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(entries => entries.forEach(entry => {
        entry.target.classList.toggle('motion-in-view', entry.isIntersecting);
        if (entry.isIntersecting && !this.seen.has(entry.target)) {
          this.seen.add(entry.target);
          this.enter(entry.target);
        }
      }), { threshold: .12 });
      this.sections.forEach(section => this.observer.observe(section));
    }
    this.letter.querySelector('summary').addEventListener('click', event => {
      if (!this.enabled || !this.letter.animate) return;
      event.preventDefault();
      this.toggleLetter();
    });
    this.sync();
  }

  get enabled() { return !this.paused && !this.reduced && !document.hidden; }
  setPaused(value) { this.paused = value; this.sync(); }

  sync() {
    document.body.classList.toggle('motion-ready', this.enabled);
    if (this.enabled) { this.updateScroll(); return; }
    cancelAnimationFrame(this.scrollFrame);
    this.scrollFrame = 0;
    this.sections.forEach(section => section.style.removeProperty('--scroll-drift'));
    // Finish rather than freeze an entrance over readable content.
    [...this.active].forEach(animation => animation.finish());
  }

  updateScroll() {
    this.scrollFrame = 0;
    if (!this.enabled) return;
    this.sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const distance = Math.max(-1, Math.min(1, (window.innerHeight / 2 - rect.top - rect.height / 2) / window.innerHeight));
      section.style.setProperty('--scroll-drift', `${(distance * 35).toFixed(2)}px`);
    });
  }

  play(element, frames, options = {}) {
    if (!this.enabled || !element?.animate) return null;
    const animation = element.animate(frames, {
      duration: 1000, easing: 'cubic-bezier(.16,1,.3,1)', ...options,
    });
    this.active.add(animation);
    const clean = () => this.active.delete(animation);
    animation.addEventListener('finish', clean, { once: true });
    animation.addEventListener('cancel', clean, { once: true });
    return animation;
  }

  enter(section) {
    if (section.matches('.birthday')) {
      section.querySelectorAll('h1 > span').forEach((line, index) => {
        this.play(line, [{ transform: 'translateY(35px) rotate(-3deg)' }, { transform: 'none' }], { delay: index * 120 });
      });
      this.play(section.querySelector('.garden'), [{ transform: 'scale(.78) rotate(-8deg)' }, { transform: 'none' }], { duration: 1600 });
      this.play(section.querySelector('.recipient'), [{ transform: 'translateX(-28px)' }, { transform: 'none' }], { delay: 280 });
    } else if (section.matches('.wishes-section')) {
      section.querySelectorAll('.bouquet-stems path').forEach((stem, index) => {
        if (stem.parentElement.getAttribute('fill') !== 'none') return;
        const length = stem.getTotalLength();
        this.play(stem, [{ strokeDasharray: `${length}`, strokeDashoffset: length }, { strokeDasharray: `${length}`, strokeDashoffset: 0 }], { duration: 1400, delay: index * 90 });
      });
      section.querySelectorAll('.bloom svg').forEach((flower, index) => {
        this.play(flower, [{ transform: 'scale(.15) rotate(-45deg)' }, { transform: 'scale(1.12) rotate(4deg)', offset: .65 }, { transform: 'none' }], { duration: 1200, delay: 180 + index * 100 });
      });
    } else if (section.matches('.birthday-dedication')) {
      this.play(section.querySelector('.icon'), [{ transform: 'rotate(-180deg) scale(.3)' }, { transform: 'none' }], { duration: 1300 });
      this.play(section.querySelector('p'), [{ transform: 'translateY(30px)' }, { transform: 'none' }]);
    } else if (section.matches('.letter-section')) {
      this.play(this.letter, [{ transform: 'translateY(38px) rotate(-4deg)' }, { transform: 'none' }], { duration: 1200 });
    } else {
      section.querySelectorAll('.keepsake').forEach((card, index) => {
        this.play(card, [{ transform: 'translateY(45px) rotate(-9deg)' }, { transform: 'none' }], { duration: 1400, delay: index * 120 });
      });
    }
  }

  toggleLetter() {
    const letter = this.letter;
    const from = letter.getBoundingClientRect().height;
    const target = !(this.letterAnimation ? this.letterTarget : letter.open);
    this.letterAnimation?.cancel();
    this.letterTarget = target;
    letter.classList.toggle('is-closing', !target);
    letter.style.height = '';
    letter.open = this.letterTarget;
    const to = letter.getBoundingClientRect().height;
    // Keep the paper visible while its envelope closes around it.
    letter.open = true;
    letter.style.overflow = 'hidden';
    const animation = this.play(letter, [{ height: `${from}px` }, { height: `${to}px` }], { duration: 650 });
    this.letterAnimation = animation;
    animation.addEventListener('finish', () => {
      if (this.letterAnimation !== animation) return;
      letter.open = this.letterTarget;
      letter.style.overflow = '';
      letter.classList.remove('is-closing');
      this.letterAnimation = null;
    }, { once: true });
  }
};
