'use strict';

// One bounded effects surface; page content never depends on the canvas.
window.BirthdayEffects = class BirthdayEffects {
  constructor(canvas, scene, reducedMotion) {
    this.canvas = canvas;
    this.scene = scene;
    this.context = canvas.getContext('2d');
    this.reducedMotion = reducedMotion;
    this.motionReduced = reducedMotion.matches;
    this.paused = false;
    this.visible = true;
    this.frame = 0;
    this.lastTime = 0;
    this.particles = [];
    this.fireflies = Array.from({ length: 20 }, (_, i) => ({
      x: .1 + Math.random() * .8, y: .13 + Math.random() * .61,
      phase: i * 1.7, radius: i % 4 === 0 ? 1.8 : 1,
    }));
    this.draw = this.draw.bind(this);
    this.resize = this.resize.bind(this);
    this.resize();
    window.addEventListener('resize', this.resize, { passive: true });
    document.addEventListener('visibilitychange', () => this.refresh());
    reducedMotion.addEventListener('change', event => { this.motionReduced = event.matches; this.refresh(); });
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(entries => {
        this.visible = entries[0].isIntersecting;
        document.body.classList.toggle('scene-offscreen', !this.visible);
        this.refresh();
      });
      this.observer.observe(scene);
    }
    this.refresh();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    this.canvas.width = Math.round(this.width * ratio);
    this.canvas.height = Math.round(this.height * ratio);
    if (this.context) this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  get enabled() {
    return this.context && !this.paused && !this.motionReduced && !document.hidden;
  }

  setPaused(paused) { this.paused = paused; this.refresh(); }

  refresh() {
    document.body.classList.toggle('page-hidden', document.hidden);
    if (!this.enabled) {
      this.particles = [];
      cancelAnimationFrame(this.frame);
      this.frame = 0;
      this.lastTime = 0;
      this.context?.clearRect(0, 0, this.width, this.height);
      return;
    }
    if ((this.visible || this.particles.length) && !this.frame) {
      this.lastTime = 0;
      this.frame = requestAnimationFrame(this.draw);
    }
  }

  burst(x, y, count = 45) {
    if (!this.enabled) return;
    const colors = ['#f3b7cf', '#ead6ae', '#9baf94', '#d5b4dd'];
    // Replay replaces particles instead of piling up cleanup timers.
    this.particles = Array.from({ length: Math.min(count, 50) }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 55 + Math.random() * 185;
      return { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 110,
        age: 0, life: 1.7 + Math.random() * 1.3, size: 2 + Math.random() * 4,
        rotation: Math.random() * 6, spin: Math.random() * 5 - 2.5, color: colors[i % 4] };
    });
    this.refresh();
  }

  clearBurst() { this.particles = []; this.refresh(); }

  draw(time) {
    this.frame = 0;
    if (!this.enabled) return;
    if (this.lastTime && time - this.lastTime < 32) {
      this.frame = requestAnimationFrame(this.draw);
      return;
    }
    const dt = this.lastTime ? Math.min((time - this.lastTime) / 1000, .06) : 1 / 30;
    this.lastTime = time;
    const ctx = this.context;
    ctx.clearRect(0, 0, this.width, this.height);
    if (this.visible) {
      const rect = this.scene.getBoundingClientRect();
      this.fireflies.forEach(fly => {
        const phase = time * .00045 + fly.phase;
        ctx.globalAlpha = .22 + (Math.sin(phase * 2) + 1) * .22;
        ctx.fillStyle = '#ead6ae';
        ctx.beginPath();
        ctx.arc(rect.left + fly.x * rect.width + Math.sin(phase) * 12,
          rect.top + fly.y * rect.height + Math.cos(phase * .7) * 16, fly.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    this.particles = this.particles.filter(particle => particle.age < particle.life);
    this.particles.forEach(particle => {
      particle.age += dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 95 * dt;
      particle.rotation += particle.spin * dt;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - particle.age / particle.life);
      ctx.fillStyle = particle.color;
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.fillRect(-particle.size / 2, -particle.size, particle.size, particle.size * 2);
      ctx.restore();
    });
    ctx.globalAlpha = 1;
    if (this.visible || this.particles.length) this.frame = requestAnimationFrame(this.draw);
  }
};
