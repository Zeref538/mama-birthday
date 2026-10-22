'use strict';

window.BirthdayOpening = class BirthdayOpening {
  constructor({ motion, effects, onReady, startMusic }) {
    this.element = document.querySelector('#welcome');
    this.main = document.querySelector('main');
    this.targets = [...document.querySelectorAll('header, main, .skip')];
    this.busy = false;
    this.element.hidden = false;
    this.targets.forEach(target => { target.inert = true; });
    document.body.classList.add('welcome-open');
    motion?.setPaused(true);
    effects?.setPaused(true);
    const enter = withMusic => {
      if (this.busy) return;
      this.busy = true;
      this.element.classList.add('is-opening');
      this.element.querySelectorAll('button').forEach(button => { button.disabled = true; });
      // Start within the opening tap so phone browsers can allow playback.
      if (withMusic) startMusic();
      onReady();
      const finish = () => {
        this.element.hidden = true;
        this.targets.forEach(target => { target.inert = false; });
        document.body.classList.remove('welcome-open');
        const heading = this.main.querySelector('h1');
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
        if (window.scrollY < window.innerHeight) motion?.enter(document.querySelector('.birthday'));
      };
      const animation = motion?.play(this.element, [
        { transform: 'translateY(0)' },
        { transform: 'translateY(-100%)' },
      ], { duration: 1100, easing: 'cubic-bezier(.76,0,.24,1)' });
      if (animation) animation.finished.then(finish, finish);
      else finish();
    };
    this.element.querySelector('#enter-birthday').addEventListener('click', () => enter(true));
    this.element.querySelector('#enter-quietly').addEventListener('click', () => enter(false));
    this.element.querySelector('#enter-birthday').focus({ preventScroll: true });
  }
};
