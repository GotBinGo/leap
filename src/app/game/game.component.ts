import { Component, OnInit, HostListener } from '@angular/core';
import * as THREE from 'three';
import { SnowParticle } from '../snow-particle';
import * as leap from '../leapjs/index.js';
import * as Hand from '../leap/Hand';
import { Vector3 } from 'three';
import { TextureAnimator } from '../texture-animation';
import { Human } from '../human';
import { Building } from '../bulding';
import { Tree } from '../tree';
import { Data } from '../Data';
import { Tower } from '../tower';
import { Stone } from '../stone';
@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  constructor() { }
  scale = 0.4;
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
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100000 );
  controls = {enabled: false};
  pitchObject = new THREE.Object3D();
  yawObject = new THREE.Object3D();
  instructions = document.getElementById( 'instructions' );
  time = Date.now();
  keys = [false, false, false, false];

  loader = new THREE.TextureLoader();
  particleImage = this.loader.load('assets/particle.png');
  islandImage = this.loader.load('assets/island.png');
  runnerTexture = this.loader.load('assets/run2.png');
  treeTexture = this.loader.load('assets/tree.png');
  stoneTexture = this.loader.load('assets/stone2.png');
  towerTexture = this.loader.load('assets/tower.png');
  buildTexture = 'assets/build2.png';

  raycaster = new THREE.Raycaster();

  snowMaterial = new THREE.SpriteMaterial( { map: this.particleImage, transparent: true, side: THREE.DoubleSide} );

  object: any;

  tx = 0;
  ty = 0;
  t = false;
  snowParticles = [];

  plane;
  emberPlanek = [];
  emberPlane;
  ujjLine;
  vonalGeometry;
  vonalMaterial;
  annie;
  buildings = [];
  trees = [];
  stones = [];

  hand;
  hand2;
  grabZ = 0;

  ngOnInit() {
    for (let i = 0; i < 1000; i++) {
      const particle = new SnowParticle( this.snowMaterial);
      particle.position.x = Math.random() * 20000 - 10000;
      particle.position.y = Math.random() * 40000 + 200;
      particle.position.z = Math.random() * 2000 - 10000;
      particle.scale.x = particle.scale.y =  40;
      this.scene.add( particle );

      this.snowParticles.push(particle);
    }

    this.scene.background = new THREE.Color( 0x5195c2 );

    this.camera.position.set(0, 150, 700);
    this.renderer.shadowMap.enabled = this.shadow;

    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

    const geometry = new THREE.PlaneGeometry( 500, 500, 32 );
    this.islandImage.magFilter = THREE.NearestFilter;
    this.islandImage.minFilter = THREE.NearestFilter;
    const material = new THREE.MeshBasicMaterial( {map: this.islandImage, transparent: true, side: THREE.DoubleSide});
    this.plane = new THREE.Mesh(geometry, material );
    this.plane.rotation.x = Math.PI / 2;
    this.plane.position.y = 100;
    // this.plane.rotation.z = Math.PI / 2;
    // const emberGeometry = new THREE.PlaneGeometry( 20, 25, 32);
    const emberMaterial = new THREE.SpriteMaterial( {alphaTest: 0.5, map: this.runnerTexture, side: THREE.DoubleSide});

    for ( let i = 0; i < 2; i++) {
      const emb = new Human(emberMaterial, this.buildings, this.plane.rotation);
      this.emberPlanek.push(emb);
      this.plane.add(emb);
    }

    this.buildings.push(new Building(this.loader.load(this.buildTexture)));
    this.plane.add(this.buildings[0]);
    this.buildings[0].position.y = 20;
    this.buildings[0].position.x = 40;
    this.buildings.push(new Building(this.loader.load(this.buildTexture), true));
    this.plane.add(this.buildings[1]);
    this.buildings[1].position.y = 200;

    for ( let i = 0; i < Data.trees.length; i++) {
      this.trees.push(new Stone(this.stoneTexture));
      // this.trees.push(new Tree(this.treeTexture));
      this.trees[this.trees.length - 1].position.x = Data.trees[i].x;
      this.trees[this.trees.length - 1].position.y = Data.trees[i].y;
      this.plane.add(this.trees[this.trees.length - 1]);
    }

    const tower = new Tower(this.towerTexture);
    this.plane.add(tower);
    tower.position.x = -100;
    tower.position.y = -100;
    this.scene.add(this.plane);

    this.vonalGeometry = new THREE.Geometry();
    this.vonalMaterial = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 30} );
    this.vonalGeometry.vertices.push(new THREE.Vector3( 0, 0, 0) );
    this.vonalGeometry.vertices.push(new THREE.Vector3( 0, 20, 0) );
    this.ujjLine = new THREE.Line( this.vonalGeometry, this.vonalMaterial );
    this.scene.add(this.ujjLine);

    // const emberPlane = new THREE.Mesh( emberGeometry, emberMaterial );
    // emberPlane.position.y = 200;
    // emberPlane.position.x = 0;
    // emberPlane.position.z = 0;
    // this.scene.add( emberPlane);



    const waterGeometry = new THREE.PlaneGeometry( 50000, 50000, 32 );
    const waterMat = new THREE.MeshBasicMaterial( {color: 0x4185b2, side: THREE.DoubleSide} );
    const water = new THREE.Mesh( waterGeometry, waterMat );
    water.position.y = -1.1;
    water.rotation.x = Math.PI / 2;
    // this.scene.add( water );

    this.pitchObject = new THREE.Object3D();
    this.pitchObject.rotation.x = -0.5;
    this.pitchObject.add( this.camera );

    this.yawObject = new THREE.Object3D();
    this.yawObject.position.y = 0;
    this.yawObject.add( this.pitchObject );
    this.scene.add( this.yawObject );

    const handMat = new THREE.MeshStandardMaterial( {
      emissive: 0xaa0000
    });
    const hand2Mat = new THREE.MeshStandardMaterial( {
      emissive: 0x0000aa
    });

    this.hand = new Hand(hand2Mat);
    this.hand.material = waterMat;
    this.hand2 = new Hand(handMat);

    this.scene.add(this.hand);
    this.scene.add(this.hand2);


    this.runnerTexture.minFilter = THREE.NearestFilter;
    this.runnerTexture.magFilter = THREE.NearestFilter;
    this.annie = new TextureAnimator(this.runnerTexture, 4, 1, false, 75 );



    leap.loop((frame) => {
      for (let i = 0; i < this.emberPlanek.length; i++) {
        this.emberPlanek[i].move();
      }
      if (frame.hands.length === 0) {
        console.log(JSON.stringify(this.trees.map(x => ({x: x.position.x, y: x.position.y}))));
      } else if (frame.hands.length > 0) {
        if (frame.hands[0].type === 'left') {
          this.hand.leapUpdate(frame.hands[0]);

        } else {
          this.hand2.leapUpdate(frame.hands[0]);
        }
        const inter = this.raycaster.intersectObject(this.plane, false);
        if (inter.length) {
          for (let i = 0; i < this.emberPlanek.length; i++) {
            // let vector = new THREE.Vector3(inter[0].point.x, inter[0].point.z, 0);
            const vector = new THREE.Vector3(inter[0].point.x, inter[0].point.z, 0);
            const axis = new THREE.Vector3( 0, 0, 1 );
            const angle = this.plane.rotation.z;
            vector.applyAxisAngle(axis, -angle);
            this.emberPlanek[i].setCenter(vector);
            // this.emberPlanek[i].position.set(vector.x, vector.y, vector.z);
          }
        }



        let dx = frame.hands[0].indexFinger.bones[3].nextJoint[0] - frame.hands[0].indexFinger.bones[3].prevJoint[0];
        let dy = frame.hands[0].indexFinger.bones[3].nextJoint[1] - frame.hands[0].indexFinger.bones[3].prevJoint[1];
        let dz = frame.hands[0].indexFinger.bones[3].nextJoint[2] - frame.hands[0].indexFinger.bones[3].prevJoint[2];
        const a = frame.hands[0].indexFinger.direction;

        dx = a[0];
        dy = a[1];
        dz = a[2];
        const norm = new THREE.Vector3(dx, dy, dz).normalize().multiplyScalar(1000);

        this.vonalGeometry.vertices[0].x = frame.hands[0].indexFinger.bones[3].nextJoint[0];
        this.vonalGeometry.vertices[0].y = frame.hands[0].indexFinger.bones[3].nextJoint[1];
        this.vonalGeometry.vertices[0].z = frame.hands[0].indexFinger.bones[3].nextJoint[2];

        this.vonalGeometry.vertices[1].x = frame.hands[0].indexFinger.bones[3].nextJoint[0] + norm.x;
        this.vonalGeometry.vertices[1].y = frame.hands[0].indexFinger.bones[3].nextJoint[1] + norm.y;
        this.vonalGeometry.vertices[1].z = frame.hands[0].indexFinger.bones[3].nextJoint[2] + norm.z;

        this.vonalGeometry.verticesNeedUpdate = true;

        this.raycaster.set(this.vonalGeometry.vertices[0], norm.normalize());
      }
      if (frame.hands.length > 1) {
        if (frame.hands[0].grabStrength === 1 && frame.hands[1].grabStrength === 1) {
          const diff = Math.atan2(frame.hands[0].palmPosition[2], frame.hands[0].palmPosition[0]) - this.grabZ;
          if (this.grabZ) {
            this.onMouseMove({tomi: diff});
          }
          this.grabZ = Math.atan2(frame.hands[0].palmPosition[2], frame.hands[0].palmPosition[0]);
        } else {
          this.grabZ = null;
        }

        if (frame.hands[0].type === 'left') {
          this.hand2.leapUpdate(frame.hands[1]);
        } else {
          this.hand.leapUpdate(frame.hands[1]);
        }

        if (frame.hands[1].pinchStrength > 0.99) {
          const inter = this.raycaster.intersectObject(this.plane, false);
          if (inter.length) {
            const vector = new THREE.Vector3(inter[0].point.x, inter[0].point.z, 0);
            const axis = new THREE.Vector3( 0, 0, 1 );
            const angle = this.plane.rotation.z;
            vector.applyAxisAngle(axis, -angle);

            if (Math.random() < 1) {
              this.stones.push(new Stone(this.stoneTexture));
              this.stones[this.stones.length - 1].position.x = vector.x + (Math.random() - 0.5) * 30;
              this.stones[this.stones.length - 1].position.y = vector.y + (Math.random() - 0.5) * 30;
              this.plane.add(this.stones[this.stones.length - 1]);
            }
          }
        }
      }
    });
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
    this.annie.update(5);

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
//      return;
    }

    const movementX = event.tomi || (event.movementX || event.mozMovementX || event.webkitMovementX || this.jox) * -0.02 || 0;
    const movementY = 0; // event.movementY || event.mozMovementY || event.webkitMovementY || this.joy || 0;

    this.plane.rotation.z += movementX * 2;

    // if (this.plane.rotation.z > Math.PI * 2) {
    //   this.plane.rotation.z = this.plane.rotation.z - Math.PI * 2;
    // }
    // console.log(this.plane.rotation.z);


    // for (let i = 0; i < this.emberPlanek.length; i++) {
    //   this.emberPlanek[i].rotation.y -= movementX * 0.002;
    // }
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

