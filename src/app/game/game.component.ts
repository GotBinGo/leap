import { Component, OnInit, HostListener } from '@angular/core';
import * as THREE from 'three';
import { ConnectionService } from '../connection.service';
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

  geometry = new THREE.SphereBufferGeometry( 30 / 40, 32, 32 );
  rm = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
  bm = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
  rs = new THREE.Mesh( this.geometry, this.rm );
  bs = new THREE.Mesh( this.geometry, this.bm );
  blues = [this.bs, this.bs, this.bs];
  reds = [this.rs, this.rs, this.rs];

  ngOnInit() {
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

    const geometry = new THREE.PlaneGeometry( 300, 300, 500, 500);
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

    const material = new THREE.MeshLambertMaterial( { color: 0xdddddd } );

    const mesh = new THREE.Mesh( geometry, material );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add( mesh );

    this.pitchObject = new THREE.Object3D();
    this.pitchObject.add( this.camera );

    this.yawObject = new THREE.Object3D();
    this.yawObject.position.y = 2;
    this.yawObject.add( this.pitchObject );
    this.scene.add( this.yawObject );

    this.scene.add(this.blues[0]);
    this.scene.add(this.blues[1]);
    this.scene.add(this.blues[2]);
    this.scene.add(this.reds[0]);
    this.scene.add(this.reds[1]);
    this.scene.add(this.reds[2]);

    this.animate();
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    this.update( Date.now() - this.time );
    this.renderer.render( this.scene, this.camera );
    this.time = Date.now();
  }

  update = (time) => {

    for (const i of Object.keys(this.cs.blues)) {
      const c = this.cs.blues[i];
      this.yawObject.position.set(this.cs.pos.x / this.scale, 5, this.cs.pos.y / this.scale);
      console.log(c.x / this.scale);
      this.blues[i].position.set(c.x / this.scale, 1, c.y / this.scale);
    }
    for (const i of Object.keys(this.cs.reds)) {
      const c = this.cs.reds[i];
      this.reds[i].position.set(c.x / this.scale, 1, c.y / this.scale);
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove = (event) => {
    if ( this.controls.enabled === false ) {
      return;
    }

    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

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

  onKeyDown = (e) => {
    if (document.activeElement !== document.body) {
      return;
    }
    if (e.keyCode === 37 || e.keyCode === 65) { // left
      if (!this.keys[0]) {
        this.keys[0] = true;
        console.log('left');
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
        console.log('left up');
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
// function onKeyUp(e)
// {
// 	if(e.keyCode == 37 || e.keyCode == 65)
// 	{
// 		if(keys[0])
// 		{
// 			keys[0] = false;
// 			ws.send("/game keys 0 0");
// 		}
// 	}
// 	if(e.keyCode == 38 || e.keyCode == 87)
// 	{
// 		if(keys[1])
// 		{
// 			keys[1] = false;
// 			ws.send("/game keys 1 0");
// 		}
// 	}
// 	if(e.keyCode == 39 || e.keyCode == 68)
// 	{
// 		if(keys[2])
// 		{
// 			keys[2] = false;
// 			ws.send("/game keys 2 0");
// 		}
// 	}
// 	if(e.keyCode == 40 || e.keyCode == 83)
// 	{
// 		if(keys[3])
// 		{
// 			keys[3] = false;
// 			ws.send("/game keys 3 0");
// 		}
// 	}
// 	if(e.keyCode == 9) //TAB
// 	{	
// 		ws.send("/game keys 4 0");
// 		e.preventDefault();	
// 	}	
// }
}
