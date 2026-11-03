import * as THREE from 'three';

export function createChipGeometry(radius = 0.32) {
  const geom = new THREE.CircleGeometry(radius, 28);
  const pos = geom.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const r = Math.sqrt(x * x + y * y);
    const angle = Math.atan2(y, x);

    let z = 0.14 * (x * x - y * y) / (radius * radius);
    if (r > radius * 0.4) {
      const edgeFactor = (r - radius * 0.4) / (radius * 0.6);
      z += Math.sin(angle * 7) * 0.035 * edgeFactor;
    }

    pos.setZ(i, z);
  }

  geom.computeVertexNormals();
  return geom;
}

export class ChipField {
  constructor(scene) {
    this.scene = scene;
    this.chips = [];
    this.spicePoints = null;
    this.stormActive = false;
    this.stormProgress = 0;
    this.init();
  }

  init() {
    this.group = new THREE.Group();
    this.group.name = 'chipfield';
    this.scene.add(this.group);

    const chipMat = new THREE.MeshStandardMaterial({
      color: 0xF7CA50,
      roughness: 0.52,
      metalness: 0.08,
      side: THREE.DoubleSide
    });

    const chipGeom = createChipGeometry(0.35);

    // 22 floating chips scattered around
    for (let i = 0; i < 22; i++) {
      const mesh = new THREE.Mesh(chipGeom, chipMat.clone());
      const angle = (i / 22) * Math.PI * 2;
      const radius = 2.8 + Math.random() * 4.2;
      mesh.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 5.2,
        -0.8 + (Math.random() - 0.5) * 3.5
      );

      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      const scale = 0.65 + Math.random() * 0.65;
      mesh.scale.set(scale, scale, scale);

      mesh.userData = {
        basePos: mesh.position.clone(),
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.8,
          y: (Math.random() - 0.5) * 0.8,
          z: (Math.random() - 0.5) * 0.8
        },
        floatSpeed: 0.6 + Math.random() * 0.8,
        floatPhase: Math.random() * Math.PI * 2
      };

      this.group.add(mesh);
      this.chips.push(mesh);
    }

    // Seasoning Spice Particles
    const particleCount = 280;
    const spiceGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;

      colors[i * 3 + 0] = 0.95;
      colors[i * 3 + 1] = 0.35;
      colors[i * 3 + 2] = 0.15;
    }

    spiceGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    spiceGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const spiceMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    this.spicePoints = new THREE.Points(spiceGeom, spiceMat);
    this.group.add(this.spicePoints);
  }

  setSpiceColor(hexColor) {
    if (!this.spicePoints) return;
    const col = new THREE.Color(hexColor);
    const colors = this.spicePoints.geometry.attributes.color;
    for (let i = 0; i < colors.count; i++) {
      colors.setXYZ(
        i,
        col.r * (0.8 + Math.random() * 0.4),
        col.g * (0.8 + Math.random() * 0.4),
        col.b * (0.8 + Math.random() * 0.4)
      );
    }
    colors.needsUpdate = true;
  }

  triggerStorm() {
    this.stormActive = true;
    this.stormProgress = 0;
  }

  update(time, mouseX = 0, mouseY = 0, scrollProgress = 0) {
    this.chips.forEach((chip, i) => {
      const ud = chip.userData;
      chip.position.y = ud.basePos.y + Math.sin(time * ud.floatSpeed + ud.floatPhase) * 0.35;
      chip.position.x = ud.basePos.x + Math.cos(time * 0.4 + ud.floatPhase) * 0.2 + mouseX * 0.35;
      
      chip.rotation.x += ud.rotSpeed.x * 0.02;
      chip.rotation.y += ud.rotSpeed.y * 0.02;
      chip.rotation.z += ud.rotSpeed.z * 0.015;

      if (this.stormActive) {
        chip.position.x += Math.sin(time * 5 + i) * 0.3;
        chip.rotation.y += 0.1;
      }
    });

    if (this.spicePoints) {
      const pos = this.spicePoints.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) - 0.007;
        if (y < -4) y = 4;
        pos.setY(i, y);

        let x = pos.getX(i) + Math.sin(time + i) * 0.003 + mouseX * 0.01;
        pos.setX(i, x);
      }
      pos.needsUpdate = true;
    }

    if (this.stormActive) {
      this.stormProgress += 0.02;
      if (this.stormProgress > 1) {
        this.stormActive = false;
      }
    }
  }
}
