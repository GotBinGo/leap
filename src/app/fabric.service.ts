import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { NgIf } from '@angular/common';

class Particle {
  position = new THREE.Vector3();
  previous = new THREE.Vector3();
  original = new THREE.Vector3();
  mass: number;
  invMass: number;
  tmp = new THREE.Vector3();
  tmp2 = new THREE.Vector3();

  constructor(ctx: any, x, y, z, mass) {
    this.mass = mass;
    this.invMass = 1 / mass;
    ctx.clothFunction(x, y, this.position); // position
    ctx.clothFunction(x, y, this.previous); // previous
    ctx.clothFunction(x, y, this.original);

  }
}
class Cloth {
  w: number;
  h: number;
  constraints: Array<Array<any>>;
  particles: Array<Particle>;
}

@Injectable({
  providedIn: 'root'
})
export class FabricService {

  lastTime: any;
  cloth: Cloth = {w: 100, h: 100, constraints: [], particles: []};
  diff = new THREE.Vector3();
  MASS = 3000.1;
  tileSize = 25;

  pins = [...Array.from(Array(100).keys()),
    ...Array.from(Array(101).keys()).map(x => 10200 - x),
    ...Array.from(Array(100).keys()).map(x => x * 101),
    ...Array.from(Array(100).keys()).map(x => 100 + x * 101),
  ];


  ballPositions = [this.bp(), this.bp(), this.bp(), this.bp(), this.bp(), this.bp(),
  this.bp(), this.bp(), this.bp(), this.bp(), this.bp(), this.bp(), this.bp(), this.bp()];

  ballSize = [60, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 300, 300];
  last = [[], [], [], [], [], [], [], [], [], [], [], []];

  constructor() {
    for (let v = 0; v <= this.cloth.h; v ++) {
      for (let u = 0; u <= this.cloth.w; u ++) {
        this.cloth.particles.push(new Particle(this, u / this.cloth.w, v / this.cloth.h, 0, this.MASS));
      }
    }
    for (let v = 0; v < this.cloth.h; v ++) {
      for (let u = 0; u < this.cloth.w; u ++) {
        this.cloth.constraints.push([
          this.cloth.particles[ this.index(u, v) ],
          this.cloth.particles[ this.index(u, v + 1) ],
          this.tileSize
        ]);
        this.cloth.constraints.push([
          this.cloth.particles[ this.index(u, v) ],
          this.cloth.particles[ this.index(u + 1, v) ],
          this.tileSize
        ]);
      }
    }
    for (let u = this.cloth.w, v = 0; v < this.cloth.h; v ++) {
      this.cloth.constraints.push([
        this.cloth.particles[ this.index(u, v) ],
        this.cloth.particles[ this.index(u, v + 1) ],
        this.tileSize
      ]);
    }
    for (let v = this.cloth.h, u = 0; u < this.cloth.w; u ++) {
      this.cloth.constraints.push([
        this.cloth.particles[ this.index(u, v) ],
        this.cloth.particles[ this.index(u + 1, v) ],
        this.tileSize
      ]);
    }

  }

  bp () {
    return new THREE.Vector3(0, - 45, 0);
  }

  index(u, v) {
    return u + v * (this.cloth.w + 1);
  }

  simulate = () => {

    if (!this.lastTime) {
      this.lastTime = Date.now();
      return;
    }

    const constraints = this.cloth.constraints;

    for (let i = 0; i < constraints.length; i++) {
      const constraint = constraints[i];
      this.satisfyConstraints(constraint[0], constraint[1], constraint[ 2 ]);
    }

    if (true) {
      for (let i = 0; i < this.cloth.particles.length; i++) {
        const particle = this.cloth.particles[i];
        const pos = particle.position;
        for (const j of this.ballPositions.keys()) {
          this.diff.subVectors(pos, this.ballPositions[j]);
          if (this.diff.length() < this.ballSize[j]) {

            this.diff.normalize().multiplyScalar(this.ballSize[j]);
            pos.copy(this.ballPositions[j]).add(this.diff);
          }
        }
      }
    }

    for (let i = 0; i < this.pins.length; i++) {
      const xy = this.pins[i];
      let p = this.cloth.particles[ xy ];
      p.position.copy(p.original);
      p.previous.copy(p.original);

      let hh = Math.sin(Date.now() / 500) * 0 - 200;
      p = this.cloth.particles[ 2499 ];
        p.position.set(p.position.x, p.position.y, hh);
        p.previous.set(p.previous.x, p.previous.y, hh);

      p = this.cloth.particles[ 7499 ];
        p.position.set(p.position.x, p.position.y, hh);
        p.previous.set(p.previous.x, p.previous.y, hh);

      hh = Math.sin(Date.now() / 500) * 0 - 0;
      p = this.cloth.particles[ 5500 ];
        p.position.set(p.position.x, p.position.y, hh);
        p.previous.set(p.previous.x, p.previous.y, hh);
    }
  }

  satisfyConstraints = (p1, p2, distance) => {
    this.diff.subVectors(p2.position, p1.position);
    const currentDist = this.diff.length();
    if (currentDist === 0) {
      return;
    }
    const correction = this.diff.multiplyScalar(1 - distance / currentDist);
    const correctionHalf = correction.multiplyScalar(0.5);
    p1.position.add(correctionHalf);
    p2.position.sub(correctionHalf);
  }

  clothFunction = (u, v, target) => {
    const x = (u - 0.5) * 100 * this.tileSize;
    const y = (v + 0.5) * 100 * this.tileSize;
    const z = 0;
    target.set(x, y, z);
  }

  setb = (i, x: number, y: number, z: number) => {
    this.ballPositions[i].z = z || 1;
    this.ballPositions[i].x = x / 1000.0 * 1250;
    this.ballPositions[i].y = 2500 - y / 1000.0 * 1250;
  }

  getd = (i , x: number, y: number) => {
    const xx: number = Math.trunc(x / 20 + 50);
    const yy: number = 100 - Math.trunc(y / 20 + 50) - 1;
    let curr = this.cloth.particles[yy * 101 + xx].position.z;
    if (Math.abs(curr) < 30) {
      curr = -20;
    }

    this.last[i].push(curr);

    if (this.last[i].length > 10) {
      this.last[i].shift();
    }

    const avg = (this.last[i][0] + this.last[i][1] + this.last[i][2] + this.last[i][3] + this.last[i][4] + this.last[i][5] +
      this.last[i][6]  + this.last[i][7]  + this.last[i][8]  + this.last[i][9]) / 7.5;

    return avg < -200 ?  -200 : avg;
  }
}
