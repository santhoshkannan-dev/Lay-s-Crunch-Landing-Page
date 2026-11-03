import { FLAVORS } from './flavors.js';
import { audio } from './audio.js';
import gsap from 'gsap';

export class ShopManager {
  constructor(cartCallback) {
    this.cartCallback = cartCallback;
    this.boxSlots = ['barbecue', 'salt-vinegar', 'sour-cream']; // Default 3 bags as seen in screenshot 4!
    this.quantities = {};
    FLAVORS.forEach(f => this.quantities[f.id] = 0);

    this.initWall();
    this.initBuildABox();
  }

  initWall() {
    const wallContainer = document.getElementById('shop-wall-grid');
    if (!wallContainer) return;

    // Ingredient peek icons/emojis
    const ingredientIcons = {
      'classic': '🥔',
      'sour-cream': '🧅',
      'barbecue': '🍢',
      'salt-vinegar': '🧂',
      'flamin-hot': '🌶️',
      'cheddar-sour-cream': '🧀',
      'all-dressed': '🍟',
      'sweet-southern-heat': '🍯',
      'bacon-grilled-cheese': '🥓'
    };

    wallContainer.innerHTML = '';
    FLAVORS.forEach((flavor) => {
      const card = document.createElement('div');
      card.className = 'shop-card';
      card.style.setProperty('--card-color', flavor.color);
      card.style.setProperty('--card-deep', flavor.deep);
      card.style.setProperty('--card-glow', flavor.glow);

      const icon = ingredientIcons[flavor.id] || '🥔';

      card.innerHTML = `
        <div class="card-inner">
          <div class="card-header">
            <h3 class="card-flavor-name">${flavor.title}</h3>
          </div>
          
          <div class="card-media">
            <div class="card-ingredient-peek" style="display: flex; align-items: center; justify-content: center; font-size: 3.5rem;">
              ${icon}
            </div>
            <img src="${flavor.pack}" alt="${flavor.name}" class="card-bag-img" loading="lazy" />
          </div>

          <div class="card-footer">
            <button class="card-add-btn" aria-label="Add to box" data-id="${flavor.id}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      `;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(card.querySelector('.card-inner'), {
          rotationY: x * 16,
          rotationX: -y * 16,
          transformPerspective: 900,
          duration: 0.2,
          ease: "power1.out"
        });
        gsap.to(card.querySelector('.card-bag-img'), {
          x: x * 20,
          y: y * 20,
          scale: 1.05,
          duration: 0.2
        });
        gsap.to(card.querySelector('.card-ingredient-peek'), {
          x: x * 35 + 20,
          y: y * 35,
          scale: 1.25,
          duration: 0.2
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card.querySelector('.card-inner'), {
          rotationY: 0,
          rotationX: 0,
          duration: 0.5,
          ease: "power2.out"
        });
        gsap.to(card.querySelector('.card-bag-img'), {
          x: 0,
          y: 0,
          scale: 1.0,
          duration: 0.5
        });
        gsap.to(card.querySelector('.card-ingredient-peek'), {
          x: 0,
          y: 0,
          scale: 1.0,
          duration: 0.5
        });
      });

      const addBtn = card.querySelector('.card-add-btn');
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.addFlavorToBox(flavor.id);
        audio.playCrunch(0.8);
      });

      wallContainer.appendChild(card);
    });
  }

  initBuildABox() {
    const selectorContainer = document.getElementById('box-flavor-picker');
    if (!selectorContainer) return;

    selectorContainer.innerHTML = '';
    FLAVORS.forEach((flavor) => {
      const tile = document.createElement('div');
      tile.className = 'box-tile';
      tile.id = `box-tile-${flavor.id}`;
      tile.style.setProperty('--tile-color', flavor.color);

      tile.innerHTML = `
        <div class="box-tile-title">${flavor.title}</div>
        <div class="box-tile-card">
          <img src="${flavor.pack}" alt="${flavor.name}" class="box-tile-img" />
          <button class="box-tile-action" data-id="${flavor.id}">
            <span class="box-tile-qty">+</span>
          </button>
        </div>
      `;

      tile.addEventListener('click', () => {
        this.addFlavorToBox(flavor.id);
        audio.playCrunch(0.7);
      });

      selectorContainer.appendChild(tile);
    });

    const addBasketBtn = document.getElementById('box-add-basket-btn');
    if (addBasketBtn) {
      addBasketBtn.addEventListener('click', () => {
        if (this.boxSlots.length === 3) {
          audio.playCrunch(1.4);
          if (this.cartCallback) {
            this.cartCallback({
              type: 'box',
              flavors: [...this.boxSlots],
              price: 5.98
            });
          }
          this.showBoxCelebration();
        }
      });
    }

    this.updateTrayUI();
  }

  addFlavorToBox(flavorId) {
    if (this.boxSlots.length >= 3) {
      this.boxSlots.shift();
    }
    this.boxSlots.push(flavorId);
    this.updateTrayUI();
  }

  removeFlavorFromBox(index) {
    this.boxSlots.splice(index, 1);
    this.updateTrayUI();
    audio.playClick();
  }

  updateTrayUI() {
    const trayContainer = document.getElementById('box-tray-bags');
    const basketBtn = document.getElementById('box-add-basket-btn');
    if (!trayContainer) return;

    trayContainer.innerHTML = '';

    const counts = {};
    FLAVORS.forEach(f => counts[f.id] = 0);
    this.boxSlots.forEach(id => counts[id]++);

    FLAVORS.forEach(f => {
      const tile = document.getElementById(`box-tile-${f.id}`);
      if (tile) {
        const qtyEl = tile.querySelector('.box-tile-qty');
        const isSelected = counts[f.id] > 0;
        tile.classList.toggle('selected', isSelected);
        if (qtyEl) {
          qtyEl.textContent = isSelected ? `${counts[f.id]}` : '+';
        }
      }
    });

    this.boxSlots.forEach((fid, idx) => {
      const flavor = FLAVORS.find(f => f.id === fid);
      if (!flavor) return;

      const bagEl = document.createElement('div');
      bagEl.className = `tray-bag slot-${idx + 1}`;
      bagEl.innerHTML = `
        <button class="tray-remove-btn" data-index="${idx}" title="Remove">✕</button>
        <img src="${flavor.pack}" alt="${flavor.name}" class="tray-bag-img" />
      `;

      bagEl.querySelector('.tray-remove-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeFlavorFromBox(idx);
      });

      trayContainer.appendChild(bagEl);

      gsap.from(bagEl, {
        scale: 0.3,
        y: -80,
        rotation: (idx - 1) * 15,
        duration: 0.4,
        ease: "back.out(1.8)"
      });
    });

    if (basketBtn) {
      const isFull = this.boxSlots.length === 3;
      basketBtn.classList.toggle('ready', isFull);
      basketBtn.disabled = !isFull;
    }
  }

  showBoxCelebration() {
    const tray = document.getElementById('box-tray-radar');
    if (!tray) return;

    gsap.timeline()
      .to(tray, { scale: 1.06, duration: 0.15, yoyo: true, repeat: 1 })
      .to('.tray-bag', {
        y: -25,
        stagger: 0.08,
        duration: 0.22,
        yoyo: true,
        repeat: 1
      });
  }
}
