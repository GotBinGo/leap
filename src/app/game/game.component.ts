import { Component, OnInit, HostListener } from '@angular/core';
import * as THREE from 'three';
import { ConnectionService } from '../connection.service';
import { FabricService } from '../fabric.service';
import { SnowParticle } from '../snow-particle';
@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  constructor(public cs: ConnectionService, private fs: FabricService) { }
  scale = 40;

  shadow = true;
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

  ballGeometry = new THREE.SphereBufferGeometry( 30 / this.scale, 32, 32 );
  mineGeometry = new THREE.SphereBufferGeometry( 10 / this.scale, 32, 32 );

  rm = new THREE.MeshPhongMaterial( { color: 0xff3333 } ); // red ball
  bm = new THREE.MeshPhongMaterial( { color: 0x3333ff } ); // blue ball
  mm = new THREE.MeshPhongMaterial( { color: 0x770077 } ); // mine

  blues = [this.bb(), this.bb(), this.bb(), this.bb(), this.bb(), this.bb()];
  reds = [this.rb(), this.rb(), this.rb(), this.rb(), this.rb(), this.rb()];
  redFlag = new THREE.PointLight( 0xff0000, 1, 100 );
  blueFlag = new THREE.PointLight( 0x0000ff, 1, 100 );

  wallShape = new THREE.BoxGeometry(1, 3, 1);
  wallMaterial = new THREE.MeshPhongMaterial( {color: 0x444444} );
  ww = new THREE.Mesh(this.wallShape, this.wallMaterial);
  walls = [this.cc(), this.cc(), this.cc(), this.cc(), this.cc(), this.cc(), this.cc(),
    this.cc(), this.cc(), this.cc(), this.cc(), this.cc(), this.cc(), this.cc(), this.cc(), this.cc()];
  mines = [this.mb(), this.mb(), this.mb(), this.mb(), this.mb(), this.mb(), this.mb(),
      this.mb(), this.mb(), this.mb(), this.mb(), this.mb(), this.mb(), this.mb()];

  loader = new THREE.TextureLoader();
  floorTexture = this.loader.load('assets/snow2.jpg');
  floorTextureNormal = this.loader.load('assets/snow2-normal2.jpg');
  floorTextureDisplacement = this.loader.load('assets/snow-displacement.jpg');
  particleImage = this.loader.load('assets/particle.png');
  snowMaterial = new THREE.SpriteMaterial( { map: this.particleImage, transparent: true, side: THREE.DoubleSide} );

  clothMaterial = new THREE.MeshPhongMaterial( {
    color: 0xffffff,
    map: this.floorTexture,
    normalMap: this.floorTextureNormal,
    // bumpMap: this.floorTextureNormal,
    // specularMap: this.floorTextureNormal,
    displacementMap: this.floorTextureDisplacement,
    displacementScale: 4.5,
    normalScale: new THREE.Vector2(0.5, 0.5),
  });
  clothGeometry = new THREE.ParametricBufferGeometry( this.fs.clothFunction, this.fs.cloth.w, this.fs.cloth.h );
  object: any;

  tx = 0;
  ty = 0;
  t = false;
  snowParticles = [];

  bb() {
    const ball = new THREE.Mesh( this.ballGeometry, this.bm );
    ball.position.set(0, -1000, 0);
    ball.receiveShadow = this.shadow;
    ball.castShadow = this.shadow;
    return ball;
  }
  rb() {
    const ball = new THREE.Mesh( this.ballGeometry, this.rm );
    ball.position.set(0, -1000, 0);
    ball.receiveShadow = this.shadow;
    ball.castShadow = this.shadow;
    return ball;
  }
  mb() {
    const mine = new THREE.Mesh( this.mineGeometry, this.mm );
    mine.add(new THREE.Mesh(new THREE.BoxGeometry(0.1, 1, 0.1), this.mm));
    mine.add(new THREE.Mesh(new THREE.BoxGeometry(1, 0.1, 0.1), this.mm));
    mine.add(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1), this.mm));
    let gg = new THREE.BoxGeometry(0.1, 0.1, 1);
    gg.rotateY(Math.PI / 4);
    mine.add(new THREE.Mesh(gg, this.mm));
    gg = new THREE.BoxGeometry(0.1, 0.1, 1);
    gg.rotateY(-Math.PI / 4);
    mine.add(new THREE.Mesh(gg, this.mm));

    gg = new THREE.BoxGeometry(0.1, 1, 0.1);
    gg.rotateX(-Math.PI / 4);
    mine.add(new THREE.Mesh(gg, this.mm));
    gg = new THREE.BoxGeometry(0.1, 1, 0.1);
    gg.rotateX(Math.PI / 4);
    mine.add(new THREE.Mesh(gg, this.mm));

    gg = new THREE.BoxGeometry(0.1, 1, 0.1);
    gg.rotateZ(-Math.PI / 4);
    mine.add(new THREE.Mesh(gg, this.mm));
    gg = new THREE.BoxGeometry(0.1, 1, 0.1);
    gg.rotateZ(Math.PI / 4);
    mine.add(new THREE.Mesh(gg, this.mm));

    mine.position.set(0, -10, 0);
    mine.receiveShadow = this.shadow;
    mine.castShadow = this.shadow;

    return mine;
  }
  cc() {
    const ww = new THREE.Mesh(this.wallShape, this.wallMaterial);
    ww.castShadow = this.shadow;
    ww.receiveShadow = this.shadow;
    ww.position.set(1, 1, 1);
    return ww;
  }

  ngOnInit() {
    for (let i = 0; i < 1000; i++) {
      const particle = new SnowParticle( this.snowMaterial);
      particle.position.x = Math.random() * 200 - 100;
      particle.position.y = Math.random() * 400 - 50;
      particle.position.z = Math.random() * 200 - 100;
      particle.scale.x = particle.scale.y =  0.4;
      this.scene.add( particle );

      this.snowParticles.push(particle);
    }

    // this.scene.fog = new THREE.FogExp2(0xffffff, 0.07);
    // this.scene.background = new THREE.Color( 0xffffff );

    this.floorTexture.anisotropy = 4;
    this.floorTextureNormal.anisotropy = 4;
    this.floorTextureDisplacement.repeat.set(.01, .01);

    this.object = new THREE.Mesh( this.clothGeometry, this.clothMaterial);
    this.object.position.set(0, -0.4, 48);
    this.object.rotateX(-Math.PI / 2);
    this.object.scale.set(0.2, 0.2, 0.2);

    this.object.castShadow = this.shadow ;
    this.object.receiveShadow = this.shadow;
    this.scene.add( this.object );

    const bf = new THREE.Mesh( this.ballGeometry, new THREE.MeshBasicMaterial({color: 0x0000ff, transparent: true, opacity: 0.5}));
    bf.position.set(0, 0, 0);
    this.blueFlag.add(bf);
    const rf = new THREE.Mesh( this.ballGeometry, new THREE.MeshBasicMaterial({color: 0xff0000, transparent: true, opacity: 0.5}));
    rf.position.set(0, 0, 0);
    this.redFlag.add(rf);
    this.redFlag.castShadow = this.shadow;
    this.blueFlag.castShadow = this.shadow;

    this.camera.position.set(0, 0, 5);
    this.renderer.shadowMap.enabled = this.shadow;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    const cand = document.getElementById( 'cand' );
    cand.appendChild( this.renderer.domElement );
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    let ambient = new THREE.AmbientLight( 0x333333);
    this.scene.add( ambient );
    ambient = new THREE.PointLight( 0xffffff, 1, 50 );
    ambient.position.set(0, 20, 0);
    ambient.castShadow = this.shadow;
    ambient.receiveShadow = this.shadow;
    ambient.shadow.mapSize.width = this.shadowMapSize; // default is 512
    ambient.shadow.mapSize.height = this.shadowMapSize;
    this.scene.add( ambient );



    const geometry = new THREE.PlaneGeometry( 2000 / this.scale, 2000 / this.scale, 200, 200);
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

    // const material = new THREE.MeshLambertMaterial( { map: this.floorTexture, side: THREE.DoubleSide } );

    // const mesh = new THREE.Mesh( geometry, material );
    // mesh.castShadow = true;
    // mesh.receiveShadow = true;
    // this.scene.add( mesh );

    this.pitchObject = new THREE.Object3D();
    this.pitchObject.add( this.camera );

    this.yawObject = new THREE.Object3D();
    this.yawObject.position.y = 2;
    this.yawObject.add( this.pitchObject );
    this.scene.add( this.yawObject );

    for (const i of Object.keys(this.blues)) {
      this.scene.add(this.blues[i]);
    }

    for (const i of Object.keys(this.reds)) {
      this.scene.add(this.reds[i]);
    }

    this.blueFlag.shadow.mapSize.width = this.shadowMapSize; // default is 512
    this.blueFlag.shadow.mapSize.height = this.shadowMapSize;
    this.redFlag.shadow.mapSize.width = this.shadowMapSize; // default is 512
    this.redFlag.shadow.mapSize.height = this.shadowMapSize;

    this.scene.add(this.redFlag);
    this.scene.add(this.blueFlag);

    for (const i of Object.keys(this.walls)) {
      this.scene.add(this.walls[i]);
    }

    for (const i of Object.keys(this.mines)) {
      this.scene.add(this.mines[i]);
    }

    this.animate();
  }

  animate = () => {
    requestAnimationFrame(this.animate);

    if (this.cs.gameStarted) {
      this.update( Date.now() - this.time );
    }
    const p = this.fs.cloth.particles;

    for ( let i = 0, il = p.length; i < il; i ++ ) {
      const v = p[i].position;
      this.clothGeometry.attributes.position.setXYZ( i, v.x / 10, -10 + v.y / 10, v.z / 10 );
    }

    this.clothGeometry.attributes.position['needsUpdate'] = true;

    this.clothGeometry.computeVertexNormals();

    this.fs.simulate();
    this.renderer.render( this.scene, this.camera );

  }

  setWall(i, w) {
    this.walls[i].position.set(w.x / this.scale - ((w.x - w.x2) / this.scale) / 2, 0, w.y / this.scale - ((w.y - w.y2) / this.scale) / 2);
    this.walls[i].scale.x = 0.1 + (w.x - w.x2) / this.scale;
    this.walls[i].scale.z = 0.1 + (w.y - w.y2) / this.scale;
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

    this.yawObject.position.set(this.cs.pos.x / this.scale, 2, this.cs.pos.y / this.scale);
    const hc = 65;

    for (const ball of this.blues) {
      ball.position.set(0, -1000, 0);
    }
    for (const ball of this.reds) {
      ball.position.set(0, -1000, 0);
    }

    for (const i of Object.keys(this.cs.blues)) {
      const c = this.cs.blues[i];
      this.fs.setb(i, c.x, c.y, null);

      this.blues[i].position.set(c.x / this.scale, (hc + this.fs.getd(i, c.x, c.y)) / hc, c.y / this.scale);
      this.blues[i].scale.set((this.blues[i].scale.x + c.r) / 30, (this.blues[i].scale.y + c.r) / 30, (this.blues[i].scale.z + c.r) / 30);
    }

    for (const i of Object.keys(this.cs.reds)) {
      const c = this.cs.reds[i];
      this.fs.setb(5 + parseInt(i, 10), c.x, c.y, null);
      this.reds[i].position.set(c.x / this.scale, (hc + this.fs.getd(5 + parseInt(i, 10), c.x, c.y)) / hc, c.y / this.scale);
      this.reds[i].scale.set(c.r / 30, c.r / 30, c.r / 30);
    }

    for (const i of Object.keys(this.cs.walls)) {
      this.setWall(i, this.cs.walls[i]);
    }

    for (const i of Object.keys(this.cs.mines)) {
      this.mines[i].position.set(this.cs.mines[i].x / this.scale, 30 / this.scale, this.cs.mines[i].y / this.scale);
    }

    this.redFlag.position.set(this.cs.redFlag.x / this.scale, 80 / this.scale, this.cs.redFlag.y / this.scale);
    this.blueFlag.position.set(this.cs.blueFlag.x / this.scale, 80 / this.scale, this.cs.blueFlag.y / this.scale);

    this.fs.setb(12,  500 + Math.sin( Date.now() / 200 ) * 200,  520 + Math.cos( Date.now() / 200 ) * 200, -310);
    this.fs.setb(13,  -500 + Math.sin( Date.now() / 200 ) * 200,  -480 + Math.cos( Date.now() / 200 ) * 200, -310);
  }

  @HostListener('document:touchmove', ['$event'])
  tm(e) {

    this.onMouseMove({movementX: this.tx - e.touches[0].clientX, movementY: e.touches[0].clientY});

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

    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    this.yawObject.rotation.y -= movementX * 0.002;
    this.cs.ws.send('/game keys 4 ' + this.yawObject.rotation.y);
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

  onKeyDown = (e) => {
    if (document.activeElement !== document.body) {
      return;
    }
    if (e.keyCode === 37 || e.keyCode === 65) { // left
      if (!this.keys[0]) {
        this.keys[0] = true;
        this.cs.ws.send('/game keys 0 1');
      }
    } else if (e.keyCode === 38 || e.keyCode === 87) { // up
      if (!this.keys[1]) {
          this.keys[1] = true;
          this.cs.ws.send('/game keys 1 1');
        }
    } else if (e.keyCode === 39 || e.keyCode === 68) { // right
      if (!this.keys[2]) {
        this.keys[2] = true;
        this.cs.ws.send('/game keys 2 1');
      }
    } else if (e.keyCode === 40 || e.keyCode === 83) { // down
      if (!this.keys[3]) {
        this.keys[3] = true;
        this.cs.ws.send('/game keys 3 1');
      }
    }
  }
  onKeyUp = (e) => {
    if (document.activeElement !== document.body) {
      return;
    }
    if (e.keyCode === 37 || e.keyCode === 65) { // left
      if (this.keys[0]) {
        this.keys[0] = false;
        this.cs.ws.send('/game keys 0 0');
      }
    } else if (e.keyCode === 38 || e.keyCode === 87) { // up
      if (this.keys[1]) {
          this.keys[1] = false;
          this.cs.ws.send('/game keys 1 0');
        }
    } else if (e.keyCode === 39 || e.keyCode === 68) { // right
      if (this.keys[2]) {
        this.keys[2] = false;
        this.cs.ws.send('/game keys 2 0');
      }
    } else if (e.keyCode === 40 || e.keyCode === 83) { // down
      if (this.keys[3]) {
        this.keys[3] = false;
        this.cs.ws.send('/game keys 3 0');
      }
    }
  }
}
