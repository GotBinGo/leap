import * as THREE from 'three';
import { TextureAnimator } from './texture-animation';

export class Tower extends THREE.Particle {
  sum = 0;
  allocated = null;

  constructor(texture) {
    super(new THREE.SpriteMaterial( {alphaTest: 0.5, map: texture, transparent: true, side: THREE.DoubleSide}));
    this.position.z = -65;
    this.scale.x = 6 * 10;
    this.scale.y = 15 * 10;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
  }

}
