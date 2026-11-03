import gsap from 'gsap';
import { audio } from './audio.js';

export class Preloader {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.progress = 0;
    this.container = document.getElementById('preloader');
    this.counter = document.getElementById('preloader-counter');
    this.statusText = document.getElementById('preloader-status');
    this.heroChip = document.getElementById('preloader-chip');
    this.spices = document.getElementById('preloader-spices');
    this.enterBtn = document.getElementById('preloader-enter-btn');
    
    this.init();
  }

  init() {
    this.createSpiceStorm();
    this.simulateLoading();

    if (this.enterBtn) {
      this.enterBtn.addEventListener('click', () => {
        this.burstAndReveal();
      });
    }
  }

  createSpiceStorm() {
    if (!this.spices) return;
    const spiceColors = ['#E03131', '#F59F00', '#F08C00', '#FFE066'];
    for (let i = 0; i < 40; i++) {
      const dot = document.createElement('div');
      dot.className = 'preloader-spice-dot';
      const size = 3 + Math.random() * 5;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.backgroundColor = spiceColors[Math.floor(Math.random() * spiceColors.length)];
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.animationDelay = `${Math.random() * 2}s`;
      dot.style.animationDuration = `${1.2 + Math.random() * 1.5}s`;
      this.spices.appendChild(dot);
    }
  }

  simulateLoading() {
    const statuses = [
      "CALIBRATING AIR CUSHIONS...",
      "ROASTING ATLANTIC RUSSET POTATOES...",
      "CHARGING FLAVOR PARTICLES...",
      "SEASONING HERO CHIP...",
      "LOCKING FOIL SEALS...",
      "CRUNCH READY."
    ];

    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 8) + 4;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        this.onLoaded();
      }

      this.progress = current;
      if (this.counter) {
        this.counter.textContent = `${this.progress}%`;
      }

      const statusIdx = Math.min(
        Math.floor((this.progress / 100) * statuses.length),
        statuses.length - 1
      );
      if (this.statusText) {
        this.statusText.textContent = statuses[statusIdx];
      }
    }, 60);
  }

  onLoaded() {
    if (this.enterBtn) {
      this.enterBtn.classList.add('visible');
    }
    // Auto-proceed after brief moment or user click
    setTimeout(() => {
      this.burstAndReveal();
    }, 700);
  }

  burstAndReveal() {
    if (this.revealed) return;
    this.revealed = true;

    // Trigger crunch sound
    audio.playCrunch(1.2);

    // Burst animation
    const tl = gsap.timeline({
      onComplete: () => {
        if (this.container) {
          this.container.style.display = 'none';
        }
        if (this.onComplete) {
          this.onComplete();
        }
      }
    });

    tl.to(this.heroChip, {
      scale: 1.8,
      rotation: 360,
      opacity: 0,
      duration: 0.45,
      ease: "power2.in"
    })
    .to('.preloader-spice-dot', {
      scale: 3,
      opacity: 0,
      stagger: 0.01,
      duration: 0.3
    }, "-=0.3")
    .to(this.container, {
      opacity: 0,
      backdropFilter: 'blur(0px)',
      duration: 0.7,
      ease: "power3.inOut"
    }, "-=0.2")
    .fromTo('#hero-title', {
      y: 80,
      opacity: 0
    }, {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: "power3.out"
    }, "-=0.3");
  }
}

