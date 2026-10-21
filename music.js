'use strict';

window.BirthdayMusic = class BirthdayMusic {
  constructor(onChange) {
    this.onChange = onChange;
    this.context = null;
    this.audio = null;
    this.audioOwner = 0;
    this.voices = [];
    this.timer = null;
    this.playing = false;
    this.request = 0;
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.stop(); });
  }

  async play() {
    const Audio = window.AudioContext || window.webkitAudioContext;
    const request = ++this.request;
    if (!Audio) {
      if (!window.Audio) throw new Error('Audio is unavailable');
      this.audio ||= new window.Audio('assets/birthday-melody.wav');
      this.audioOwner = request;
      this.audio.preload = 'none';
      this.audio.volume = .7;
      this.audio.onended = () => this.stop();
      await this.audio.play();
      if (request !== this.request) {
        if (!this.audioOwner) this.audio.pause();
        return;
      }
      if (document.hidden) { this.stop(); return; }
      this.playing = true;
      this.onChange(true);
      return;
    }
    this.context ||= new Audio();
    await this.context.resume();
    if (request !== this.request || document.hidden) return;
    if (this.context.state !== 'running') throw new Error('Audio did not start');
    const notes = { G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };
    const melody = [
      ['G4', .5], ['G4', .5], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
      ['G4', .5], ['G4', .5], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
      ['G4', .5], ['G4', .5], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 2],
      ['F5', .5], ['F5', .5], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 2.5],
    ];
    const beat = .43;
    let start = this.context.currentTime + .06;
    melody.forEach(([note, length]) => {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = notes[note];
      const duration = length * beat;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(.14, start + .018);
      gain.gain.exponentialRampToValueAtTime(.001, start + duration + .15);
      oscillator.connect(gain);
      gain.connect(this.context.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + .2);
      this.voices.push(oscillator);
      oscillator.onended = () => {
        oscillator.disconnect(); gain.disconnect();
        this.voices = this.voices.filter(voice => voice !== oscillator);
      };
      start += duration;
    });
    this.playing = true;
    this.onChange(true);
    this.timer = window.setTimeout(() => this.stop(), (start - this.context.currentTime + .3) * 1000);
  }

  stop() {
    this.request++;
    this.audioOwner = 0;
    clearTimeout(this.timer);
    this.timer = null;
    this.voices.forEach(voice => { try { voice.stop(); } catch { /* Note already finished. */ } });
    this.voices = [];
    if (this.audio) { this.audio.pause(); this.audio.currentTime = 0; }
    this.playing = false;
    this.onChange(false);
  }
};
