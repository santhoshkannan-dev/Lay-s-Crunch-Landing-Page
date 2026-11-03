import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CHAPTERS } from './flavors.js';
import { audio } from './audio.js';

gsap.registerPlugin(ScrollTrigger);

export class StoryManager {
  constructor(experience) {
    this.experience = experience;
    this.currentChapter = 0;
    this.init();
  }

  init() {
    this.chapterBar = document.getElementById('story-chapter-bar');
    this.chapterTag = document.getElementById('story-chapter-tag');
    this.chapterTitle = document.getElementById('story-chapter-title');
    this.chapterBody = document.getElementById('story-chapter-body');
    this.activeChapterNum = document.getElementById('chapter-active-num');
    this.activeChapterTitle = document.getElementById('chapter-active-title');
    this.bigNum = document.querySelector('.story-big-num');
    this.chapterNavDots = document.querySelectorAll('.chapter-nav-dot');

    this.setupScrollTrigger();
    this.setupInteractivity();
    this.updateChapterUI(0);
  }

  setupScrollTrigger() {
    const insideSection = document.getElementById('inside');
    const flavorsSection = document.getElementById('flavors');
    const shopSection = document.getElementById('shop');
    const rangeSection = document.getElementById('range');

    if (flavorsSection) {
      ScrollTrigger.create({
        trigger: flavorsSection,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          
          // Smoothly fade out hero controls as user scrolls down
          const heroWrap = document.querySelector('.hero-title-wrap');
          const heroHints = document.querySelector('.hero-hints');
          const heroControls = document.querySelector('.hero-carousel-controls');
          const heroBottom = document.querySelector('.hero-bottom-bar');
          
          const opacity = Math.max(0, 1 - p * 2.2);
          if (heroWrap) heroWrap.style.opacity = opacity;
          if (heroHints) heroHints.style.opacity = opacity;
          if (heroControls) heroControls.style.opacity = opacity;
          if (heroBottom) heroBottom.style.opacity = opacity;

          // Transition 3D scene to inside as hero leaves view
          if (p > 0.35) {
            if (this.experience.currentSection !== 'inside' && !this.inShop) {
              this.experience.setSection('inside', 0);
              this.updateNavbar('inside');
            }
          } else {
            if (this.experience.currentSection !== 'flavors') {
              this.experience.setSection('flavors', 0);
              this.updateNavbar('flavors');
            }
          }
        }
      });
    }

    if (insideSection) {
      ScrollTrigger.create({
        trigger: insideSection,
        start: "top top",
        end: "+=2200",
        pin: true,
        scrub: 0.5,
        onEnter: () => {
          this.inShop = false;
          this.experience.setSection('inside', 0);
          this.updateNavbar('inside');
        },
        onEnterBack: () => {
          this.inShop = false;
          this.experience.setSection('inside', 1.0);
          this.updateNavbar('inside');
        },
        onLeave: () => {
          this.inShop = true;
          this.experience.setSection('shop');
          this.updateNavbar('shop');
        },
        onLeaveBack: () => {
          this.inShop = false;
        },
        onUpdate: (self) => {
          const progress = self.progress; // 0..1
          this.experience.setSection('inside', progress);

          const chapterIdx = Math.min(3, Math.floor(progress * 4));
          const subProgress = (progress * 4) % 1;

          if (chapterIdx !== this.currentChapter) {
            this.currentChapter = chapterIdx;
            this.updateChapterUI(chapterIdx);
            audio.playClick();
          }

          this.experience.setStoryChapter(chapterIdx, subProgress);

          if (progress > 0.88 && !this.stormTriggered) {
            this.stormTriggered = true;
            this.experience.chipfield.triggerStorm();
            audio.playWhoosh();
          } else if (progress < 0.8) {
            this.stormTriggered = false;
          }
        }
      });
    }

    if (shopSection) {
      ScrollTrigger.create({
        trigger: shopSection,
        start: "top 70%",
        onEnter: () => {
          this.inShop = true;
          this.experience.setSection('shop');
          this.updateNavbar('shop');
        },
        onLeaveBack: () => {
          this.inShop = false;
          this.experience.setSection('inside', 1.0);
          this.updateNavbar('inside');
        }
      });
    }

    if (rangeSection) {
      ScrollTrigger.create({
        trigger: rangeSection,
        start: "top 70%",
        onEnter: () => {
          this.experience.setSection('range');
          this.updateNavbar('range');
        },
        onLeaveBack: () => {
          this.experience.setSection('shop');
          this.updateNavbar('shop');
        }
      });
    }
  }

  updateNavbar(sectionId) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach((link) => {
      const match = link.getAttribute('data-section') === sectionId;
      link.classList.toggle('active', match);
    });
  }

  updateChapterUI(index) {
    const data = CHAPTERS[index];
    if (!data) return;

    gsap.timeline()
      .to([this.chapterTag, this.chapterTitle, this.chapterBody], {
        opacity: 0,
        y: -10,
        duration: 0.18,
        onComplete: () => {
          if (this.chapterTag) this.chapterTag.textContent = data.tag;
          if (this.chapterTitle) this.chapterTitle.textContent = data.title;
          if (this.chapterBody) this.chapterBody.textContent = data.body;
          if (this.bigNum) this.bigNum.textContent = `0${index + 1}`;
          if (this.activeChapterNum) this.activeChapterNum.textContent = `0${index + 1} ${data.tag.split('—')[2]?.trim() || ''}`;
          if (this.activeChapterTitle) this.activeChapterTitle.textContent = data.badge;
        }
      })
      .to([this.chapterTag, this.chapterTitle, this.chapterBody], {
        opacity: 1,
        y: 0,
        duration: 0.35,
        stagger: 0.05,
        ease: "power2.out"
      });

    if (this.chapterBar) {
      const pct = ((index + 1) / 4) * 100;
      this.chapterBar.style.width = `${pct}%`;
    }

    this.chapterNavDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    this.updateHotspots(index);
  }

  updateHotspots(chapterIndex) {
    const chapterDataSets = [
      [
        { title: "HEAT-SEALED CRIMP", desc: "Locks the freshness in" },
        { title: "FOIL-LINED FILM", desc: "Blocks light & moisture" },
        { title: "AIR CUSHION", desc: "Keeps every chip whole" }
      ],
      [
        { title: "ACOUSTIC CRUNCH", desc: "63-decibel sound shockwave" },
        { title: "MICRO-POROUS", desc: "1.8% hydration crisp fracture" },
        { title: "RESONANCE PEAK", desc: "Calibrated sensory frequency" }
      ],
      [
        { title: "STATIC ATTRACTION", desc: "Oppositely charged spice ions" },
        { title: "UNIFORM DUSTING", desc: "360° coverage on every ridge" },
        { title: "TUMBLE CHAMBER", desc: "Zero clumping or bare zones" }
      ],
      [
        { title: "FARM-FRESH POTATO", desc: "Harvested across 25 U.S. states" },
        { title: "PRECISION SLICE", desc: "Uniform microscopic tolerance" },
        { title: "24-HOUR SEAL", desc: "Harvest to kettle in one day" }
      ]
    ];

    const currentSet = chapterDataSets[chapterIndex] || chapterDataSets[0];
    const hs1 = document.querySelector('.hotspot-1');
    const hs2 = document.querySelector('.hotspot-2');
    const hs3 = document.querySelector('.hotspot-3');

    if (hs1) {
      const t = hs1.querySelector('.hotspot-title');
      const d = hs1.querySelector('.hotspot-desc');
      if (t) t.textContent = currentSet[0].title;
      if (d) d.textContent = currentSet[0].desc;
    }
    if (hs2) {
      const t = hs2.querySelector('.hotspot-title');
      const d = hs2.querySelector('.hotspot-desc');
      if (t) t.textContent = currentSet[1].title;
      if (d) d.textContent = currentSet[1].desc;
    }
    if (hs3) {
      const t = hs3.querySelector('.hotspot-title');
      const d = hs3.querySelector('.hotspot-desc');
      if (t) t.textContent = currentSet[2].title;
      if (d) d.textContent = currentSet[2].desc;
    }

    gsap.from('.story-hotspot', {
      scale: 0.88,
      opacity: 0.7,
      duration: 0.35,
      stagger: 0.06,
      ease: "power2.out"
    });
  }

  setupInteractivity() {
    this.chapterNavDots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        this.updateChapterUI(idx);
        this.currentChapter = idx;
        this.experience.setStoryChapter(idx, 0);
        audio.playClick();
      });
    });
  }
}
