import * as THREE from 'three';

/**
 * Textures module:
 * Loads authentic high-definition pack textures with 16x anisotropic filtering
 * and provides procedural fallback artwork if needed.
 */
export class TextureManager {
  constructor() {
    this.loader = new THREE.TextureLoader();
    this.cache = new Map();
    this.maxAnisotropy = 16;
  }

  setMaxAnisotropy(val) {
    if (val && val > 0) {
      this.maxAnisotropy = val;
      this.cache.forEach((tex) => {
        tex.anisotropy = val;
        tex.needsUpdate = true;
      });
    }
  }

  loadPackTexture(flavor, onLoad) {
    if (this.cache.has(flavor.id)) {
      const tex = this.cache.get(flavor.id);
      if (onLoad) onLoad(tex);
      return tex;
    }

    const texture = this.loader.load(
      flavor.pack,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = this.maxAnisotropy;
        tex.needsUpdate = true;
        if (onLoad) onLoad(tex);
      },
      undefined,
      () => {
        // Fallback procedural texture generator
        console.warn(`Fallback procedural pack texture generated for ${flavor.name}`);
        const fallbackTex = this.createFallbackPackTexture(flavor);
        if (onLoad) onLoad(fallbackTex);
      }
    );

    this.cache.set(flavor.id, texture);
    return texture;
  }

  createFallbackPackTexture(flavor) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1440;
    const ctx = canvas.getContext('2d');

    // Flavor gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 1440);
    grad.addColorStop(0, flavor.color);
    grad.addColorStop(1, flavor.deep);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1440);

    // Sunburst
    ctx.save();
    ctx.translate(512, 650);
    const sunGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, 380);
    sunGrad.addColorStop(0, '#FFE866');
    sunGrad.addColorStop(0.5, '#F5B800');
    sunGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 380, 0, Math.PI * 2);
    ctx.fill();

    // Red banner & Lay's script
    ctx.fillStyle = '#D32F2F';
    ctx.beginPath();
    ctx.ellipse(0, 0, 280, 110, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'italic 900 120px Archivo Black, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("Lay's", 0, -5);

    // Flavor name
    ctx.font = '900 68px Archivo Black, sans-serif';
    ctx.fillText(flavor.title, 0, 240);
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = this.maxAnisotropy;
    return texture;
  }
}

export const textureManager = new TextureManager();

