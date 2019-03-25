import * as THREE from 'three';
import { TextureAnimator } from './texture-animation';

export class Tree extends THREE.Particle {
  sum = 0;
  allocated = null;

  constructor(texture) {
    super(new THREE.SpriteMaterial( {alphaTest: 0.5, map: texture, transparent: true, side: THREE.DoubleSide}));
    this.position.z = -15;
    this.scale.x = 6 * 1.5;
    this.scale.y = 15 * 1.5;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
  }

}
