import { Component, OnInit, HostListener } from '@angular/core';
import * as THREE from 'three';
import { ConnectionService } from '../connection.service';
import { SnowParticle } from '../snow-particle';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  constructor() { }
  scale = 40;

  centerMessage = 'Press SPACE to start the game.';
  startTime: any;
  get gameTimeGetter() {
    return Math.floor(((Date.now() - this.startTime) / 1000 / 60) || 0).toString().padStart(2, '0')
    + ':' + (Math.floor((Date.now() - this.startTime) / 1000) % 60 || 0).toString().padStart(2, '0');
  }

  jox = 0;
  joy = 0;

  shadow = window.location.href.split('/')[3] === 's';
  shadowMapSize = 2048;

  renderer = new THREE.WebGLRenderer();
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  controls = {enabled: false};
  pitchObject = new THREE.Object3D();
  yawObject = new THREE.Object3D();
  instructions = document.getElementById( 'instructions' );
  time = Date.now();
  keys = [false, false, false, false];

  loader = new THREE.TextureLoader();
  particleImage = this.loader.load('assets/particle.png');
  islandImage = this.loader.load('assets/island.png');
  snowMaterial = new THREE.SpriteMaterial( { map: this.particleImage, transparent: true, side: THREE.DoubleSide} );

  object: any;

  tx = 0;
  ty = 0;
  t = false;
  snowParticles = [];

  ngOnInit() {
    for (let i = 0; i < 1000; i++) {
      const particle = new SnowParticle( this.snowMaterial);
      particle.position.x = Math.random() * 200 - 100;
      particle.position.y = Math.random() * 400 + 2;
      particle.position.z = Math.random() * 200 - 100;
      particle.scale.x = particle.scale.y =  0.4;
      this.scene.add( particle );

      this.snowParticles.push(particle);
    }
    this.scene.background = new THREE.Color( 0x5195c2 );

    this.camera.position.set(0, -0.5, 4);
    this.renderer.shadowMap.enabled = this.shadow;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    const cand = document.getElementById( 'cand' );
    cand.appendChild( this.renderer.domElement );

    let ambient = new THREE.AmbientLight( 0x333333);
    this.scene.add( ambient );
    ambient = new THREE.PointLight( 0xffffff, 1, 50 );
    ambient.position.set(0, 20, 0);
    ambient.castShadow = this.shadow;
    ambient.receiveShadow = this.shadow;
    ambient.shadow.mapSize.width = this.shadowMapSize; // default is 512
    ambient.shadow.mapSize.height = this.shadowMapSize;
    this.scene.add( ambient );

    const geometry = new THREE.PlaneGeometry( 5, 5, 32 );
    this.islandImage.magFilter = THREE.NearestFilter;
    this.islandImage.minFilter = THREE.NearestFilter;
    const material = new THREE.MeshBasicMaterial( {map: this.islandImage, transparent: true, side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( geometry, material );
    plane.rotation.x = Math.PI / 2;
    this.scene.add( plane );

    const waterGeometry = new THREE.PlaneGeometry( 500, 500, 32 );
    const waterMat = new THREE.MeshBasicMaterial( {color: 0x4185b2, side: THREE.DoubleSide} );
    const water = new THREE.Mesh( waterGeometry, waterMat );
    water.position.y = -0.1;
    water.rotation.x = Math.PI / 2;
    this.scene.add( water );

    this.pitchObject = new THREE.Object3D();
    this.pitchObject.rotation.x = -0.5;
    this.pitchObject.add( this.camera );

    this.yawObject = new THREE.Object3D();
    this.yawObject.position.y = 0;
    this.yawObject.add( this.pitchObject );
    this.scene.add( this.yawObject );

    this.animate();
  }

  animate = () => {
    if (window['joystick']) {
      const blocker = document.getElementById( 'blocker' );
      this.jox = window['joystick'].deltaX() ;
      this.joy = window['joystick'].deltaY() / 3;
      if (this.jox || this.joy) {
        this.controls.enabled = true;
        blocker.style.display = 'none';
        this.onMouseMove({});
      }
    }
    requestAnimationFrame(this.animate);

    this.renderer.render( this.scene, this.camera );

  }

  update = (time) => {

    for (let i = 0; i < this.snowParticles.length; i++) {
      const particle = this.snowParticles[i];
      particle.updatePhysics();
      if (particle.position.y < -50) {
        particle.position.y += 250;
      }
      const box = 100;
      if (particle.position.x > box) {
        particle.position.x -= box;
      } else if (particle.position.x < -box) {
        particle.position.x += box;
      }
      if (particle.position.z > box) {
        particle.position.z -= box;
      } else if (particle.position.z < -box) {
        particle.position.z += box;
      }
    }

    const hc = 65;

  }

  @HostListener('document:touchmove', ['$event'])
  tm(e) {

    this.tx = e.touches[0].clientX;
    this.ty = e.touches[0].clientY;
  }
  @HostListener('document:touchstart', ['$event'])
  ts(e) {
    this.controls.enabled = true;
    this.t = true;
    this.tx = e.touches[0].clientX;
    this.ty = e.touches[0].clientY;
  }
  @HostListener('document:touchend', ['$event'])
  te(e) {
    this.t = false;
  }


  @HostListener('document:mousemove', ['$event'])
  onMouseMove = (event) => {
    if ( this.controls.enabled === false ) {
      return;
    }

    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || this.jox || 0;
    const movementY = 0; // event.movementY || event.mozMovementY || event.webkitMovementY || this.joy || 0;

    this.yawObject.rotation.y -= movementX * 0.002;
    this.pitchObject.rotation.x -= movementY * 0.002;
    const PI_2 = Math.PI / 2;
    this.pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, this.pitchObject.rotation.x ) );
  }

  @HostListener('document:pointerlockchange', ['$event'])
  @HostListener('document:mozpointerlockchange', ['$event'])
  @HostListener('document:webkitpointerlockchange', ['$event'])
  pointerLockChange = (event) => {
    const blocker = document.getElementById( 'blocker' );
    const instructions = document.getElementById( 'instructions' );
    const element = document.getElementById('cand');
    if (document['pointerLockElement'] === element ||
      document['mozPointerLockElement'] === element ||
      document['webkitPointerLockElement'] === element ) {
      this.controls.enabled = true;
      blocker.style.display = 'none';
    } else {
        this.controls.enabled = false;
        blocker.style.display = 'flex';

        instructions.style.display = 'flex';
    }
  }

  @HostListener('document:pointerlockerror', ['$event'])
  @HostListener('document:mozpointerlockerror', ['$event'])
  @HostListener('document:webkitpointerlockerror', ['$event'])
  pointerLockError = ( event ) => {
    const instructions = document.getElementById( 'instructions' );
    instructions.style.display = '';
  }

  onClick = (event) => {
    const instructions = document.getElementById( 'instructions' );
    instructions.style.display = 'none';
    const element: any = document.getElementById( 'cand' );

    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
    element.requestPointerLock();

  }

  @HostListener('window:resize', ['$event'])
  onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }

}
