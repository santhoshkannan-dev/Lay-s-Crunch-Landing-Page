import * as THREE from 'three';

/**
 * Ingredients module:
 * Creates and animates small floating 3D ingredients around the active hero bag.
 */
export class IngredientManager {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'hero-ingredients';
    this.scene.add(this.group);
    this.ingredients = [];
    this.currentFlavorId = null;

    this.initChiliModel();
    this.initHerbModels();
  }

  initChiliModel() {
    // Procedural 3D Chili Pepper mesh
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.6, 0),
      new THREE.Vector3(0.12, -0.2, 0.05),
      new THREE.Vector3(-0.08, 0.25, -0.05),
      new THREE.Vector3(-0.25, 0.6, 0.1)
    ]);

    const chiliGeom = new THREE.TubeGeometry(curve, 24, 0.11, 12, false);
    const chiliMat = new THREE.MeshStandardMaterial({
      color: 0xD32F2F,
      roughness: 0.35,
      metalness: 0.12
    });

    this.chiliMesh = new THREE.Mesh(chiliGeom, chiliMat);
    this.chiliMesh.scale.setScalar(0.75);
    this.chiliMesh.position.set(-1.8, -0.6, 0.5);
    this.group.add(this.chiliMesh);
    this.ingredients.push({
      mesh: this.chiliMesh,
      basePos: new THREE.Vector3(-1.8, -0.6, 0.5),
      speed: 1.2,
      phase: 0.5
    });

    // Second small chili
    const chili2 = this.chiliMesh.clone();
    chili2.scale.setScalar(0.55);
    chili2.position.set(1.9, 0.8, 0.2);
    this.group.add(chili2);
    this.ingredients.push({
      mesh: chili2,
      basePos: new THREE.Vector3(1.9, 0.8, 0.2),
      speed: 0.9,
      phase: 2.1
    });
  }

  initHerbModels() {
    // Small chive / herb leaf geometries
    const herbGeom = new THREE.BoxGeometry(0.08, 0.35, 0.02);
    const herbMat = new THREE.MeshStandardMaterial({
      color: 0x2E7D32,
      roughness: 0.5
    });

    for (let i = 0; i < 4; i++) {
      const herb = new THREE.Mesh(herbGeom, herbMat);
      const angle = (i / 4) * Math.PI * 2;
      const x = Math.cos(angle) * 1.6;
      const y = Math.sin(angle) * 1.4;
      herb.position.set(x, y, 0.4);
      herb.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      this.group.add(herb);
      this.ingredients.push({
        mesh: herb,
        basePos: new THREE.Vector3(x, y, 0.4),
        speed: 1.1 + i * 0.2,
        phase: i * 1.5
      });
    }
  }

  setFlavor(flavorId) {
    this.currentFlavorId = flavorId;
    // Show/hide relevant ingredients
    const isSpicy = flavorId === 'flamin-hot' || flavorId === 'sweet-southern-heat';
    if (this.chiliMesh) this.chiliMesh.visible = isSpicy;
  }

  update(time, mouseX = 0, mouseY = 0, isHeroActive = true) {
    this.group.visible = isHeroActive;
    if (!isHeroActive) return;

    this.ingredients.forEach((item) => {
      item.mesh.position.y = item.basePos.y + Math.sin(time * item.speed + item.phase) * 0.18 + mouseY * 0.2;
      item.mesh.position.x = item.basePos.x + Math.cos(time * 0.8 + item.phase) * 0.15 + mouseX * 0.25;
      item.mesh.rotation.x += 0.015;
      item.mesh.rotation.y += 0.02;
    });
  }
}

