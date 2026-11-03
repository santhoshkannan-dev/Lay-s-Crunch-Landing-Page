import * as THREE from 'three';
import { textureManager } from './textures.js';

export function createBagGeometry(width = 2.24, height = 3.15) {
  const segW = 40;
  const segH = 48;
  const geometry = new THREE.PlaneGeometry(width, height, segW, segH);
  const pos = geometry.attributes.position;
  const halfW = width / 2;
  const halfH = height / 2;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    
    const nx = x / halfW;
    const ny = y / halfH;

    const factorX = Math.cos(nx * Math.PI * 0.5);
    const factorY = Math.cos(ny * Math.PI * 0.5);
    
    // Smooth realistic pillow air cushion curve
    const z = 0.35 * Math.pow(factorX * factorY, 0.85);
    pos.setZ(i, z);
  }

  geometry.computeVertexNormals();
  return geometry;
}

export function createBagMesh(flavor) {
  const group = new THREE.Group();
  group.name = `bag-${flavor.id}`;

  const geom = createBagGeometry(2.24, 3.15);
  
  // Use high-definition standard material with depth writing and authentic foil sheen
  const material = new THREE.MeshStandardMaterial({
    transparent: true,
    alphaTest: 0.05,
    depthWrite: true,
    roughness: 0.28,
    metalness: 0.12,
    side: THREE.DoubleSide
  });

  textureManager.loadPackTexture(flavor, (tex) => {
    material.map = tex;
    material.needsUpdate = true;
  });

  const mesh = new THREE.Mesh(geom, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  group.userData = {
    flavor,
    mesh,
    material,
    originalScale: 1.0
  };

  return group;
}
