import { Component, OnInit, HostListener } from '@angular/core';
import * as THREE from 'three';
import { ConnectionService } from '../connection.service';
import { tmpdir } from 'os';
@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  constructor(public cs: ConnectionService) { }

  scale = 40;

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

  rm = new THREE.MeshLambertMaterial( { color: 0xff0000 } ); // red ball
  bm = new THREE.MeshLambertMaterial( { color: 0x0000ff } ); // blue ball
  mm = new THREE.MeshLambertMaterial( { color: 0x770077 } ); // mine

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

  clothMaterial: any;
  clothGeometry: any;
  object: any;

  tx = 0;
  ty = 0;
  t = false;

  bb() {
    const ball = new THREE.Mesh( this.ballGeometry, this.bm );
    ball.position.set(0, -1000, 0);
    return ball;
  }
  rb() {
    const ball = new THREE.Mesh( this.ballGeometry, this.rm );
    ball.position.set(0, -1000, 0);
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

    return mine;
  }
  cc() {
    const ww = new THREE.Mesh(this.wallShape, this.wallMaterial);
    ww.castShadow = true;
    ww.position.set(1, 1, 1);
    return ww;
  }
  ngOnInit() {
    const floorTexture = THREE.ImageUtils.loadTexture('assets/snow.jpg');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(10, 10);

    window.sphere = {visible: false};
    window.clothMaterial = new THREE.MeshLambertMaterial( {
      color: 0xffffff,
      //alphaTest: 0.5
      map: floorTexture
    } );
    window.clothGeometry = new THREE.ParametricBufferGeometry( window.clothFunction, window.cloth.w, window.cloth.h );
    this.object = new THREE.Mesh( window.clothGeometry, window.clothMaterial);
    this.object.position.set(0, 0.5, 48);
    this.object.rotateX(-Math.PI / 2);
    this.object.scale.set(0.2, 0.2, 0.2);
    window.pinsFormation = [];
    window.pins = [ 6 ];

    pins = [...Array.from(Array(100).keys()),
      ...Array.from(Array(101).keys()).map(x => 10200 - x),
      ...Array.from(Array(100).keys()).map(x => x * 101),
      ...Array.from(Array(100).keys()).map(x => 100 + x * 101),
    ]; // classic 2 pins




    this.object.castShadow = true;
    this.scene.add( this.object );

    const bf = new THREE.Mesh( this.ballGeometry, new THREE.MeshBasicMaterial({color: 0x0000ff}));
    bf.position.set(0, 1, 0);
    this.blueFlag.add(bf);
    const rf = new THREE.Mesh( this.ballGeometry, new THREE.MeshBasicMaterial({color: 0xff0000}));
    rf.position.set(0, 1, 0);
    this.redFlag.add(rf);

    this.camera.position.set(0, 0, 5);
    this.renderer.shadowMapEnabled = true;
    // this.renderer.shadowMapSoft = true;
    // renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    const cand = document.getElementById( 'cand' );
    cand.appendChild( this.renderer.domElement );
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    const ambient = new THREE.AmbientLight( 0x666666 );
    this.scene.add( ambient );



    const geometry = new THREE.PlaneGeometry( 2000 / this.scale, 2000 / this.scale, 200, 200);
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

    const material = new THREE.MeshLambertMaterial( { map: floorTexture, side: THREE.DoubleSide } );

    const mesh = new THREE.Mesh( geometry, material );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    //this.scene.add( mesh );

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

    this.update( Date.now() - this.time );


    const time = Date.now();
    window.setb(3,  500 + Math.sin( time / 200 ) * 200,  520 + Math.cos( time / 200 ) * 200, -310);
    window.setb(4,  -500 + Math.sin( time / 200 ) * 200,  -480 + Math.cos( time / 200 ) * 200, -310);

    const windStrength = Math.cos( time / 7000 ) * 20 + 40;
    window.windForce.set( Math.sin( time / 2000 ), Math.cos( time / 3000 ), Math.sin( time / 1000 ) )
    window.windForce.normalize();
    window.windForce.multiplyScalar( 0 );

    const p = window.cloth.particles;

    for ( let i = 0, il = p.length; i < il; i ++ ) {

      const v = p[ i ].position;

      window.clothGeometry.attributes.position.setXYZ( i, v.x / 10, -10 + v.y / 10, v.z / 10 );

    }

    window.clothGeometry.attributes.position.needsUpdate = true;

    window.clothGeometry.computeVertexNormals();

    window.simulate( time );
    this.renderer.render( this.scene, this.camera );

  }

  setWall(i, w) {
    this.walls[i].position.set(w.x / this.scale - ((w.x - w.x2) / this.scale) / 2, 0, w.y / this.scale - ((w.y - w.y2) / this.scale) / 2);
    this.walls[i].scale.x = 0.1 + (w.x - w.x2) / this.scale;
    this.walls[i].scale.z = 0.1 + (w.y - w.y2) / this.scale;
  }

  update = (time) => {
    this.yawObject.position.set(this.cs.pos.x / this.scale, 2, this.cs.pos.y / this.scale);
    const hc = 65;
    for (const i of Object.keys(this.cs.blues)) {
      const c = this.cs.blues[i];
      window.setb(i, c.x, c.y);

      this.blues[i].position.set(c.x / this.scale, (hc + window.getd(i, c.x, c.y)) / hc, c.y / this.scale);
      this.blues[i].scale.set((this.blues[i].scale.x+c.r)/30, (this.blues[i].scale.y+c.r)/30, (this.blues[i].scale.z+c.r)/30);
    }

    for (const i of Object.keys(this.cs.reds)) {
      const c = this.cs.reds[i];
      window.setb(5 + parseInt(i, 10), c.x, c.y);
      this.reds[i].position.set(c.x / this.scale, (hc + window.getd(5 + parseInt(i, 10), c.x, c.y)) / hc, c.y / this.scale);
      this.reds[i].scale.set(c.r/30, c.r/30, c.r/30);
    }

    for (const i of Object.keys(this.cs.walls)) {
      this.setWall(i, this.cs.walls[i]);
    }

    for (const i of Object.keys(this.cs.mines)) {
      this.mines[i].position.set(this.cs.mines[i].x / this.scale, 30 / this.scale, this.cs.mines[i].y / this.scale);
    }

    this.redFlag.position.set(this.cs.redFlag.x / this.scale, 40 / this.scale, this.cs.redFlag.y / this.scale);
    this.blueFlag.position.set(this.cs.blueFlag.x / this.scale, 40 / this.scale, this.cs.blueFlag.y / this.scale);
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
