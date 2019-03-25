import * as THREE from 'three';
import { Building } from './bulding';

export class Human extends THREE.Particle {
  static sid = 0;
  target;
  targetCenter;
  newTargetRange = 50;
  buildings: Building[];
  rot;
  uid = null;

  constructor(material, buildings, rot) {
    super(material);
    this.uid = Human.sid++;
    this.buildings = buildings;
    this.rot = rot;
    this.position.x = 0;
    this.position.y = 150;
    this.position.z = -5;
    this.scale.x = 4 * 2;
    this.scale.y = 5 * 2;
    const axis = new THREE.Vector3(0, 0, 1);
    this.position.applyAxisAngle(axis, Math.random() * Math.PI * 2);
    this.target = null;
    this.targetCenter = new THREE.Vector3(0, 100, 0);
  }

  move = () => {
    if (!this.target) {
      this.newTarget(null);
    }
    const toGo = new THREE.Vector3(this.target.x - this.position.x, this.target.y - this.position.y, 0).length();
    if (toGo > 5) {
      this.position.add(new THREE.Vector3(this.target.x - this.position.x, this.target.y - this.position.y, 0).normalize().multiplyScalar(0.5));
    } else {
      this.newTarget(null);
    }
  }

  newTarget = (a) => {
    for (const b of this.buildings) {
      if (!b.done && b.allocated === null) {
        b.allocated = this.uid;
      }

      if (!b.done && b.allocated === this.uid) {
        a = new THREE.Vector3().copy(b.position);
        b.update(1);
        break;
      }
    }

    if (a) {
      a.y += Math.cos(this.rot.z) * 10;
      a.x += Math.sin(this.rot.z) * 10;
      this.target = a;
      return;
    }

    this.target = new THREE.Vector3(this.targetCenter.x + (Math.random() - 0.5) * this.newTargetRange,
    this.targetCenter.y + (Math.random() - 0.5) * this.newTargetRange, 0);
    while (!this.goodTarget()) {
      this.target = new THREE.Vector3(this.targetCenter.x + (Math.random() - 0.5) * this.newTargetRange,
      this.targetCenter.y + (Math.random() - 0.5) * this.newTargetRange, 0);
    }
  }

  goodTarget = () => {
    const dx = this.targetCenter.x - this.target.x;
    const dy = this.targetCenter.y - this.target.y;
    // console.log(this.target.x, this.target.y);
    const ox = this.target.x;
    const oy = this.target.y;

    if (Math.sqrt(dx * dx + dy * dy) < 50 && Math.sqrt(ox * ox + oy * oy) < 170) {
      return true;
    } else {
      this.target.x = this.position.x * 0.9;
      this.target.y = this.position.y * 0.9;
      return true;
    }
  }

  setCenter = (c) => {
    this.targetCenter = c;
  }

}
