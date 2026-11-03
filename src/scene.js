import * as THREE from 'three';
import { FLAVORS } from './flavors.js';
import { createBagMesh } from './bag.js';
import { ChipField } from './chipfield.js';
import { IngredientManager } from './ingredients.js';
import { textureManager } from './textures.js';

export class Experience {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    // Default to Flamin' Hot (index 4) as in Image 2
    this.activeIndex = 4;
    this.targetActiveIndex = 4;
    this.activeFlavor = FLAVORS[this.activeIndex];
    
    this.scrollProgress = 0;
    this.currentSection = 'flavors';
    this.storyProgress = 0;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    
    this.bags = [];
    this.clock = new THREE.Clock();
    
    this.initThree();
    this.initLights();
    this.initBags();
    this.chipfield = new ChipField(this.scene);
    this.ingredientManager = new IngredientManager(this.scene);
    this.ingredientManager.setFlavor(this.activeFlavor.id);

    this.setupEvents();
    this.render();
  }

  initThree() {
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(38, this.width / this.height, 0.1, 100);
    this.camera.position.set(0, 0, 7.8);
    this.targetCameraPos = new THREE.Vector3(0, 0, 7.8);
    
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Apply max anisotropy for razor-sharp textures at perspective angles
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    textureManager.setMaxAnisotropy(maxAniso);

    this.container.appendChild(this.renderer.domElement);
  }

  initLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 1.4);
    this.scene.add(ambient);

    this.keyLight = new THREE.DirectionalLight(0xfff8ee, 2.8);
    this.keyLight.position.set(3, 5, 5);
    this.keyLight.castShadow = true;
    this.scene.add(this.keyLight);

    const fillLight = new THREE.DirectionalLight(0xe8f4ff, 1.2);
    fillLight.position.set(-4, 2, 4);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffd180, 2.2);
    rimLight.position.set(0, 4, -3);
    this.scene.add(rimLight);
  }

  initBags() {
    this.carouselGroup = new THREE.Group();
    this.carouselGroup.name = 'carousel';
    this.scene.add(this.carouselGroup);

    FLAVORS.forEach((flavor) => {
      const bag = createBagMesh(flavor);
      this.carouselGroup.add(bag);
      this.bags.push(bag);
    });
  }

  setupEvents() {
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / this.width) * 2 - 1;
      this.mouse.targetY = -(e.clientY / this.height) * 2 + 1;
    });
  }

  setActiveIndex(index) {
    const total = FLAVORS.length;
    this.activeIndex = ((index % total) + total) % total;
    this.targetActiveIndex = this.activeIndex;
    this.activeFlavor = FLAVORS[this.activeIndex];
    
    if (this.chipfield) {
      this.chipfield.setSpiceColor(this.activeFlavor.spiceColor);
    }

    if (this.ingredientManager) {
      this.ingredientManager.setFlavor(this.activeFlavor.id);
    }

    if (window.onFlavorChange) {
      window.onFlavorChange(this.activeFlavor, this.activeIndex);
    }
  }

  nextFlavor() {
    this.setActiveIndex(this.activeIndex + 1);
  }

  prevFlavor() {
    this.setActiveIndex(this.activeIndex - 1);
  }

  /**
   * Precise parabolic arc layout matching Screenshot 1 (Image 2)
   */
  getArcLayout(offset) {
    let x = 0;
    let y = 0.32;
    let z = 0;
    let rotX = 0.04;
    let rotY = 0;
    let rotZ = 0;
    let scale = 1.08;

    const absOff = Math.abs(offset);
    const sign = offset < 0 ? -1 : 1;

    if (absOff === 0) {
      x = 0;
      y = 0.32;
      z = 0;
      scale = 1.08;
    } else if (absOff <= 1.05) {
      x = sign * 1.88;
      y = 0.18;
      z = -0.85;
      rotY = -sign * 0.22;
      rotZ = -sign * 0.08;
      scale = 0.90;
    } else if (absOff <= 2.05) {
      x = sign * 3.65;
      y = -0.05;
      z = -1.75;
      rotY = -sign * 0.38;
      rotZ = -sign * 0.15;
      scale = 0.74;
    } else if (absOff <= 3.05) {
      x = sign * 5.25;
      y = -0.32;
      z = -2.85;
      rotY = -sign * 0.52;
      rotZ = -sign * 0.22;
      scale = 0.60;
    } else {
      x = sign * (5.25 + (absOff - 3) * 1.6);
      y = -0.6;
      z = -4.5;
      rotY = -sign * 0.7;
      scale = 0.45;
    }

    return { x, y, z, rotX, rotY, rotZ, scale };
  }

  updateCarouselLayout(damping = 0.08) {
    const total = this.bags.length;

    this.bags.forEach((bag, i) => {
      let offset = i - this.activeIndex;
      while (offset > total / 2) offset -= total;
      while (offset < -total / 2) offset += total;

      if (this.currentSection === 'flavors') {
        const isNear = Math.abs(offset) <= 3.2;
        bag.visible = isNear;
        if (!isNear) return;

        const layout = this.getArcLayout(offset);
        
        const mouseParallaxX = this.mouse.x * (offset === 0 ? 0.25 : 0.12);
        const mouseParallaxY = this.mouse.y * (offset === 0 ? 0.20 : 0.10);

        bag.position.x += (layout.x + mouseParallaxX - bag.position.x) * damping;
        bag.position.y += (layout.y + mouseParallaxY - bag.position.y) * damping;
        bag.position.z += (layout.z - bag.position.z) * damping;

        const floatSway = Math.sin(this.clock.getElapsedTime() * 1.6 + i) * 0.035;
        bag.rotation.x += (layout.rotX + mouseParallaxY * 0.08 - bag.rotation.x) * damping;
        bag.rotation.y += (layout.rotY + mouseParallaxX * 0.12 - bag.rotation.y) * damping;
        bag.rotation.z += (layout.rotZ + floatSway - bag.rotation.z) * damping;

        bag.scale.setScalar(bag.scale.x + (layout.scale - bag.scale.x) * damping);

      } else if (this.currentSection === 'inside') {
        if (i === this.activeIndex) {
          bag.visible = true;
          if (bag.position.z < -2) {
            bag.position.z = 0;
          }

          const targetX = 1.25 + this.mouse.x * 0.10;
          const targetY = 0.02 + this.mouse.y * 0.08;
          const targetZ = 1.35;

          bag.position.x += (targetX - bag.position.x) * damping;
          bag.position.y += (targetY - bag.position.y) * damping;
          bag.position.z += (targetZ - bag.position.z) * damping;

          // -22 degree tilt matching screenshot 2
          const rotZ = -0.38;
          const rotY = -0.32 + Math.sin(this.storyProgress * Math.PI) * 0.16;
          const rotX = 0.12 + Math.cos(this.storyProgress * Math.PI * 2) * 0.05;

          bag.rotation.x += (rotX - bag.rotation.x) * damping;
          bag.rotation.y += (rotY - bag.rotation.y) * damping;
          bag.rotation.z += (rotZ - bag.rotation.z) * damping;
          bag.scale.setScalar(bag.scale.x + (1.26 - bag.scale.x) * damping);
        } else {
          // Immediately hide all non-active bags so they NEVER clutter or overlap Chapter 01
          bag.visible = false;
        }
      } else {
        bag.visible = false;
      }
    });
  }

  setSection(sectionName, progress = 0) {
    this.currentSection = sectionName;
    this.scrollProgress = progress;

    if (sectionName === 'flavors') {
      this.targetCameraPos.set(0, 0, 7.8);
    } else if (sectionName === 'inside') {
      this.targetCameraPos.set(0.12, 0, 7.0);
    } else {
      this.targetCameraPos.set(0, -4, 8.5);
    }
  }

  setStoryChapter(chapterIndex, chapterProgress = 0) {
    this.storyProgress = (chapterIndex + chapterProgress) / 4;
  }

  render() {
    requestAnimationFrame(() => this.render());

    const time = this.clock.getElapsedTime();

    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

    this.camera.position.lerp(this.targetCameraPos, 0.06);

    if (this.keyLight) {
      this.keyLight.position.x = 3 + this.mouse.x * 1.5;
      this.keyLight.position.y = 5 + this.mouse.y * 1.5;
    }

    this.updateCarouselLayout();

    if (this.chipfield) {
      this.chipfield.update(time, this.mouse.x, this.mouse.y, this.scrollProgress);
    }

    if (this.ingredientManager) {
      this.ingredientManager.update(time, this.mouse.x, this.mouse.y, this.currentSection === 'flavors');
    }

    this.renderer.render(this.scene, this.camera);
  }
}
