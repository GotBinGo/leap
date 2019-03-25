import * as THREE from 'three';
import { TextureAnimator } from './texture-animation';

export class Stone extends THREE.Particle {
  sum = 0;
  allocated = null;

  constructor(texture) {
    super(new THREE.SpriteMaterial( {alphaTest: 0.5, map: texture, transparent: true, side: THREE.DoubleSide}));
    this.position.z = -5;
    this.scale.x = 6 * 1;
    this.scale.y = 6 * 1;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
  }

}
