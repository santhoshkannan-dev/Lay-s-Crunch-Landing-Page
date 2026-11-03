import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FLAVORS } from './flavors.js';
import { audio } from './audio.js';
import { Experience } from './scene.js';
import { Preloader } from './preloader.js';
import { StoryManager } from './story.js';
import { ShopManager } from './shop.js';
import { RackManager } from './rack.js';

gsap.registerPlugin(ScrollTrigger);

class App {
  constructor() {
    this.cartItems = [];
    this.autoplay = true;
    this.autoplayTimer = null;
    this.init();
  }

  init() {
    // 1. Initialize Lenis Smooth Scrolling
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 2.0
    });

    this.lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Keep Lenis stopped during preloader
    this.lenis.stop();

    // 2. Initialize 3D Experience Canvas
    const container = document.getElementById('webgl-container');
    this.experience = new Experience(container);

    window.onFlavorChange = (flavor, index) => {
      this.applyFlavorTheme(flavor, index);
    };

    // 3. Pre-render Shop and Rack into DOM so layout heights are computed accurately
    this.initShop();
    this.initRack();

    // 4. Initialize Preloader
    this.preloader = new Preloader(() => {
      this.lenis.start();
      this.initStory();
      this.startAutoplay();
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 150);
    });

    // 5. Setup Controls and Navigation
    this.setupCarouselControls();
    this.setupHeaderActions();
    this.setupNavLinks();
    this.setupQAAccordions();
    this.setupCart();

    this.applyFlavorTheme(this.experience.activeFlavor, this.experience.activeIndex, false);
  }

  applyFlavorTheme(flavor, index, animate = true) {
    const root = document.documentElement;
    root.style.setProperty('--flavor-color', flavor.color);
    root.style.setProperty('--flavor-deep', flavor.deep);
    root.style.setProperty('--flavor-glow', flavor.glow);
    root.style.setProperty('--flavor-ink', flavor.ink);
    document.body.style.backgroundColor = flavor.deep;

    const titleEl = document.getElementById('hero-title');
    if (titleEl) {
      const words = flavor.title.split(' ');
      let formattedTitle = '';
      if (words.length > 2) {
        formattedTitle = `${words.slice(0, 2).join(' ')}<br>${words.slice(2).join(' ')}`;
      } else if (words.length === 2) {
        formattedTitle = `${words[0]}<br>${words[1]}`;
      } else {
        formattedTitle = words[0];
      }

      if (animate) {
        gsap.timeline()
          .to(titleEl, { y: 25, opacity: 0, duration: 0.18, ease: "power2.in" })
          .call(() => { titleEl.innerHTML = formattedTitle; })
          .to(titleEl, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" });
      } else {
        titleEl.innerHTML = formattedTitle;
      }
    }

    const numEl = document.getElementById('hero-outline-num');
    if (numEl) {
      numEl.textContent = flavor.number;
    }
  }

  setupCarouselControls() {
    const prevBtn = document.getElementById('hero-prev-btn');
    const nextBtn = document.getElementById('hero-next-btn');
    const autoplayBtn = document.getElementById('hero-autoplay-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.experience.prevFlavor();
        audio.playWhoosh();
        this.resetAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.experience.nextFlavor();
        audio.playWhoosh();
        this.resetAutoplay();
      });
    }

    if (autoplayBtn) {
      autoplayBtn.addEventListener('click', () => {
        this.autoplay = !this.autoplay;
        autoplayBtn.classList.toggle('active', this.autoplay);
        const ind = document.getElementById('autoplay-indicator');
        if (ind) ind.textContent = this.autoplay ? '||' : '▶';
        if (this.autoplay) {
          this.startAutoplay();
        } else {
          clearInterval(this.autoplayTimer);
        }
        audio.playClick();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.experience.prevFlavor();
        audio.playWhoosh();
      } else if (e.key === 'ArrowRight') {
        this.experience.nextFlavor();
        audio.playWhoosh();
      }
    });
  }

  startAutoplay() {
    if (this.autoplayTimer) clearInterval(this.autoplayTimer);
    this.autoplayTimer = setInterval(() => {
      if (this.autoplay && this.experience.currentSection === 'flavors') {
        this.experience.nextFlavor();
      }
    }, 4500);
  }

  resetAutoplay() {
    if (this.autoplay) {
      this.startAutoplay();
    }
  }

  setupHeaderActions() {
    const soundBtn = document.getElementById('sound-toggle-btn');
    const soundText = document.getElementById('sound-status-text');
    const soundIcon = document.getElementById('sound-status-icon');

    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const isEnabled = audio.toggle();
        if (soundText) soundText.textContent = isEnabled ? 'ON' : 'OFF';
        if (soundIcon) soundIcon.textContent = isEnabled ? '♫' : '...';
        soundBtn.style.borderColor = isEnabled ? '#5EEB9E' : 'rgba(255,255,255,0.28)';
      });
    }
  }

  setupNavLinks() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          this.lenis.scrollTo(targetEl, { offset: 0, duration: 1.4 });
        }
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        audio.playClick();
      });
    });

    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + 250;
      const sections = ['flavors', 'inside', 'shop', 'range', 'qa', 'join'];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            navLinks.forEach(l => {
              l.classList.toggle('active', l.dataset.section === id);
            });
            break;
          }
        }
      }
    });
  }

  initStory() {
    this.story = new StoryManager(this.experience);
  }

  initShop() {
    this.shop = new ShopManager((boxOrder) => {
      this.addBoxToCart(boxOrder);
    });
  }

  initRack() {
    this.rack = new RackManager(this.experience);
  }

  setupQAAccordions() {
    const items = document.querySelectorAll('.qa-item');
    items.forEach((item) => {
      item.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        items.forEach(i => i.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
          audio.playClick();
        }
      });
    });
  }

  setupCart() {
    const cartBtn = document.getElementById('cart-drawer-btn');
    const closeBtn = document.getElementById('cart-close-btn');
    const drawer = document.getElementById('cart-drawer');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (cartBtn && drawer) {
      cartBtn.addEventListener('click', () => {
        drawer.classList.add('open');
        audio.playClick();
      });
    }

    if (closeBtn && drawer) {
      closeBtn.addEventListener('click', () => {
        drawer.classList.remove('open');
        audio.playClick();
      });
    }

    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        audio.playCrunch(1.5);
        alert('🎉 Concept Order Placed! Thank you for exploring the Lay\'s Crunch Experience.');
        this.cartItems = [];
        this.updateCartUI();
        if (drawer) drawer.classList.remove('open');
      });
    }
  }

  addBoxToCart(boxOrder) {
    this.cartItems.push(boxOrder);
    this.updateCartUI();
    
    const drawer = document.getElementById('cart-drawer');
    if (drawer) {
      drawer.classList.add('open');
    }
  }

  updateCartUI() {
    const counter = document.getElementById('cart-counter-text');
    const list = document.getElementById('cart-items-list');
    const totalEl = document.getElementById('cart-total-price');

    const totalCount = this.cartItems.length * 3;
    if (counter) {
      counter.textContent = String(totalCount).padStart(3, '0');
    }

    if (!list) return;

    if (this.cartItems.length === 0) {
      list.innerHTML = '<div style="opacity: 0.6; text-align: center; margin-top: 40px;">Your basket is empty. Add a flavor box to begin!</div>';
      if (totalEl) totalEl.textContent = '$0.00';
      return;
    }

    list.innerHTML = '';
    let grandTotal = 0;

    this.cartItems.forEach((item) => {
      grandTotal += item.price;
      const el = document.createElement('div');
      el.className = 'cart-item';
      
      const flavorNames = item.flavors.map(id => {
        const f = FLAVORS.find(x => x.id === id);
        return f ? f.name : id;
      }).join(', ');

      el.innerHTML = `
        <div>
          <div style="font-family: var(--font-display); font-size: 0.95rem; margin-bottom: 4px;">CUSTOM 3-PACK</div>
          <div style="font-size: 0.78rem; opacity: 0.75; max-width: 220px;">${flavorNames}</div>
        </div>
        <div style="font-family: var(--font-mono); font-weight: 700;">$${item.price.toFixed(2)}</div>
      `;
      list.appendChild(el);
    });

    if (totalEl) {
      totalEl.textContent = `$${grandTotal.toFixed(2)}`;
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App();
});
