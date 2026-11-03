import { FLAVORS } from './flavors.js';
import { audio } from './audio.js';
import gsap from 'gsap';

export class RackManager {
  constructor(experience) {
    this.experience = experience;
    this.rail = document.getElementById('rack-rail');
    this.dialContainer = document.getElementById('rack-dial');
    this.dialNeedle = document.getElementById('rack-dial-needle');
    this.currentFlavorIndex = 2; // Barbecue (03) as in screenshot 6
    this.isDragging = false;
    this.startX = 0;
    this.scrollLeft = 0;

    this.init();
  }

  init() {
    this.renderRackBags();
    this.renderDialTicks();
    this.setupRailInteractivity();
    this.updateActiveRackItem(this.currentFlavorIndex);
  }

  renderRackBags() {
    if (!this.rail) return;
    this.rail.innerHTML = '';

    FLAVORS.forEach((flavor, idx) => {
      const bagUnit = document.createElement('div');
      bagUnit.className = 'rack-unit';
      bagUnit.dataset.index = idx;
      bagUnit.style.setProperty('--unit-color', flavor.color);

      bagUnit.innerHTML = `
        <div class="rack-hook">
          <div class="rack-clip"></div>
          <div class="rack-tag">${flavor.number}</div>
        </div>

        <div class="rack-bag-wrapper" id="rack-bag-${idx}">
          <img src="${flavor.pack}" alt="${flavor.name}" class="rack-bag-img" />
        </div>

        <div class="rack-meta">
          <div class="rack-meta-index">${flavor.number} / 09</div>
          <h4 class="rack-meta-title">${flavor.title}</h4>
          <button class="rack-taste-btn" data-index="${idx}">
            TASTE IT <span>&rarr;</span>
          </button>
        </div>
      `;

      const bagWrapper = bagUnit.querySelector('.rack-bag-wrapper');

      // Pendulum swing on cursor sweep
      bagUnit.addEventListener('mouseenter', () => {
        audio.playClick();
        gsap.timeline()
          .to(bagWrapper, {
            rotationZ: 14,
            transformOrigin: "top center",
            duration: 0.22,
            ease: "power2.out"
          })
          .to(bagWrapper, {
            rotationZ: -10,
            duration: 0.35,
            ease: "sine.inOut"
          })
          .to(bagWrapper, {
            rotationZ: 5,
            duration: 0.3,
            ease: "sine.inOut"
          })
          .to(bagWrapper, {
            rotationZ: 0,
            duration: 0.4,
            ease: "elastic.out(1, 0.4)"
          });
      });

      // Tap to spin 360 on hook
      bagWrapper.addEventListener('click', () => {
        audio.playCrunch(1.1);
        gsap.to(bagWrapper, {
          rotationY: "+=360",
          duration: 0.85,
          ease: "power2.inOut"
        });
      });

      // Taste button
      bagUnit.querySelector('.rack-taste-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        audio.playCrunch(1.0);
        this.updateActiveRackItem(idx);
        if (this.experience) {
          this.experience.setActiveIndex(idx);
        }
      });

      this.rail.appendChild(bagUnit);
    });
  }

  renderDialTicks() {
    if (!this.dialContainer) return;
    this.dialContainer.innerHTML = '';

    const totalTicks = 45;
    for (let i = 0; i < totalTicks; i++) {
      const tick = document.createElement('div');
      const isMajor = i % 5 === 0;
      tick.className = `dial-tick ${isMajor ? 'major' : ''}`;
      
      if (isMajor) {
        const num = (i / 5) + 1;
        if (num <= FLAVORS.length) {
          const label = document.createElement('span');
          label.className = 'dial-num';
          label.textContent = `0${num}`;
          tick.appendChild(label);
        }
      }
      this.dialContainer.appendChild(tick);
    }
  }

  setupRailInteractivity() {
    if (!this.rail) return;

    // Mouse drag scrolling
    this.rail.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.startX = e.pageX - this.rail.offsetLeft;
      this.scrollLeft = this.rail.scrollLeft;
      this.rail.classList.add('dragging');
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.rail.classList.remove('dragging');
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      e.preventDefault();
      const x = e.pageX - this.rail.offsetLeft;
      const walk = (x - this.startX) * 1.5;
      this.rail.scrollLeft = this.scrollLeft - walk;
      this.syncDial();
    });

    this.rail.addEventListener('scroll', () => {
      this.syncDial();
    });
  }

  syncDial() {
    if (!this.rail || !this.dialNeedle) return;
    const maxScroll = this.rail.scrollWidth - this.rail.clientWidth;
    if (maxScroll <= 0) return;
    const ratio = this.rail.scrollLeft / maxScroll;
    const dialW = this.dialContainer.clientWidth;
    this.dialNeedle.style.left = `${ratio * dialW}px`;

    const flavorIdx = Math.min(
      FLAVORS.length - 1,
      Math.floor(ratio * FLAVORS.length)
    );
    const counterLabel = document.getElementById('rack-current-count');
    if (counterLabel) {
      counterLabel.textContent = `${FLAVORS[flavorIdx].number} / 09`;
    }
  }

  updateActiveRackItem(index) {
    this.currentFlavorIndex = index;
    const units = document.querySelectorAll('.rack-unit');
    units.forEach((u, i) => {
      u.classList.toggle('active', i === index);
    });

    // Scroll unit into view smoothly
    if (units[index] && this.rail) {
      const offset = units[index].offsetLeft - (this.rail.clientWidth / 2) + (units[index].clientWidth / 2);
      this.rail.scrollTo({ left: offset, behavior: 'smooth' });
    }
  }
}

