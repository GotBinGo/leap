import * as THREE from 'three';
import { TextureAnimator } from './texture-animation';

export class Building extends THREE.Particle {

  textureAnimator;
  loader = new THREE.TextureLoader();
  sum = 0;
  done = false;
  greenbuild = null;
  allocated = null;

  constructor(texture) {
    super(new THREE.SpriteMaterial( {alphaTest: 0.5, map: texture, transparent: true, side: THREE.DoubleSide}));
    this.position.z = -15;
    this.scale.x = 12 * 2;
    this.scale.y = 15 * 2;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    this.textureAnimator = new TextureAnimator(texture, 1, 6, true, 75 );
    // this.position.y = 170 * Math.random();
    this.greenbuild = this.loader.load('assets/greenbuild.png');
    this.greenbuild.magFilter = THREE.NearestFilter;
    this.greenbuild.minFilter = THREE.NearestFilter;
    this.update(2000);

  }

  update = (n) => {
    if (this.sum < 2400) {
      this.textureAnimator.update(n);
      this.sum += n;
    } else {
      this.done = true;
      this.material = new THREE.SpriteMaterial( {alphaTest: 0.5, map: this.greenbuild, transparent: true, side: THREE.DoubleSide});
    }
  }

}
