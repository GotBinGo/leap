import * as THREE from 'three';

export class SnowParticle extends THREE.Particle {
  velocity = new THREE.Vector3(0, -0.3, 0);

  gravity = new THREE.Vector3(0, 0, 0);
  drag = 1;
  constructor(material) {
    super();
    const TO_RADIANS = Math.PI / 180;
    this.material = material;
    let angle = this.randomRange(-45, 45);
    this.velocity.set(this.velocity.x, (this.velocity.y * Math.cos(angle * TO_RADIANS)) + (this.velocity.z * Math.sin(angle * TO_RADIANS)),
    (this.velocity.y * -Math.sin(angle * TO_RADIANS)) + (this.velocity.z * Math.cos(angle * TO_RADIANS)));
    angle = this.randomRange(0, 360);
    this.velocity.set((this.velocity.x * Math.cos(angle * TO_RADIANS)) + (this.velocity.z * Math.sin(angle * TO_RADIANS)), this.velocity.y,
    (this.velocity.x * -Math.sin(angle * TO_RADIANS)) + (this.velocity.z * Math.cos(angle * TO_RADIANS)));
  }
  randomRange = (min, max) => {
      return ((Math.random() * (max - min)) + min);
  }
  updatePhysics = () => {
      this.velocity.multiplyScalar(this.drag);
      this.velocity.add(this.gravity);
      this.position.add(this.velocity);
  }
}
