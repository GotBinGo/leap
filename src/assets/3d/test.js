window.setTimeout(xxxx => {

		var wsImpl = window.WebSocket || window.MozWebSocket;
		window.ws = new wsImpl('ws://'+'localhost'+':8080/');

        var xx = 0;
        var yy = 0;

		ws.onmessage = function (evt)
		{
			//console.log(evt.data);
			//pre.innerHTML += evt.data;

			var hel = evt.data.split("&nbsp;").join(" ");
            if(evt.data[0] == "/") {
                var j = JSON.parse(hel.split(' ')[1]);
                var nu =j.value.filter(x => x.r == 30)[0];
                xx = nu.x;
                yy = nu.y;
            }
			else
				console.log(hel);
        };
        ws.onopen = function () {

			ws.send("/sn "+'3d');

		};

            var sphereShape, sphereBody, world, physicsMaterial, walls=[], balls=[], ballMeshes=[], boxes=[], boxMeshes=[];

            var camera, scene, renderer;
            var geometry, material, mesh;
            var controls = {enabled: false};
            var time = Date.now();

            var blocker = document.getElementById( 'blocker' );
            var instructions = document.getElementById( 'instructions' );
            var pitchObject = new THREE.Object3D();
            var yawObject = new THREE.Object3D();
            var posx = -25
            var posz = -25

    var moveForward = false;
    var moveBackward = false;
    var moveLeft = false;
    var moveRight = false;
    var light, light2;
    var cube;
    var FPS = [];
    var last = Date.now();
    var PI_2 = Math.PI / 2;
            var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

            if ( havePointerLock ) {

                var element = document.body;

                var pointerlockchange = function ( event ) {

                    if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

                        controls.enabled = true;

                        blocker.style.display = 'none';

                    } else {

                        controls.enabled = false;

                        blocker.style.display = '-webkit-box';
                        blocker.style.display = '-moz-box';
                        blocker.style.display = 'box';

                        instructions.style.display = '';

                    }

                }

                var pointerlockerror = function ( event ) {
                    instructions.style.display = '';
                }

                // Hook pointer lock state change events
                document.addEventListener( 'pointerlockchange', pointerlockchange, false );
                document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
                document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

                document.addEventListener( 'pointerlockerror', pointerlockerror, false );
                document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
                document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );


                function onKeyDown(event) {
                    switch ( event.keyCode ) {
                        case 38: // up
                        case 87: // w
                            moveForward = true;
                            break;

                        case 37: // left
                        case 65: // a
                            moveLeft = true; break;

                        case 40: // down
                        case 83: // s
                            moveBackward = true;
                            break;

                        case 39: // right
                        case 68: // d
                            moveRight = true;
                            break;

                        case 32: // space
                            if ( canJump === true ){
                                velocity.y = jumpVelocity;
                            }
                            canJump = false;
                            break;
                    }
                };

                function onKeyUp(event) {
                    switch( event.keyCode ) {
                        case 38: // up
                        case 87: // w
                            moveForward = false;
                            break;

                        case 37: // left
                        case 65: // a
                            moveLeft = false;
                            break;

                        case 40: // down
                        case 83: // a
                            moveBackward = false;
                            break;

                        case 39: // right
                        case 68: // d
                            moveRight = false;
                            break;
                    }
                };
                function onMouseMove(event) {
                    if ( controls.enabled === false ) return;

                    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
                    var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

                    yawObject.rotation.y -= movementX * 0.002;
                    pitchObject.rotation.x -= movementY * 0.002;

                    pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );
                };

                document.addEventListener( 'mousemove', onMouseMove, false );
                document.addEventListener( 'keydown', onKeyDown, false );
                document.addEventListener( 'keyup', onKeyUp, false );

                instructions.addEventListener( 'click', function ( event ) {
                    instructions.style.display = 'none';

                    // Ask the browser to lock the pointer
                    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

                    if ( /Firefox/i.test( navigator.userAgent ) ) {

                        var fullscreenchange = function ( event ) {

                            if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

                                document.removeEventListener( 'fullscreenchange', fullscreenchange );
                                document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

                                element.requestPointerLock();
                            }

                        }

                        document.addEventListener( 'fullscreenchange', fullscreenchange, false );
                        document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

                        element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

                        element.requestFullscreen();

                    } else {

                        element.requestPointerLock();

                    }

                }, false );

            } else {

                instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

            }

            init();
            animate();



            function init() {
                camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

                scene = new THREE.Scene();
                //scene.fog = new THREE.Fog( 0x000000, 0, 500 );

                var ambient = new THREE.AmbientLight( 0x666666 );
                scene.add( ambient );

                // light = new THREE.PointLight( 0xffffff);
                // light.position.set( 1, 20, 1 );
                // light.target.position.set( 1, 0, 1);
                // if(true){
                //     light.castShadow = true;

                //     light.shadowCameraNear = 0.1;
                //     light.shadowCameraFar = 500;//camera.far;
                //     light.shadowCameraFov = 75;

                //     light.shadowMapBias = 0.1;
                //     light.shadowMapDarkness = 0.7;
                //     light.shadowMapWidth = 2*512;
                //     light.shadowMapHeight = 2*512;
                // }
                // scene.add( light );




                // light = new THREE.PointLight( 0xff0000, 1, 100 );
                // light.position.set( 1, 20, 1);
                // light.castShadow = true;
                // light.shadow.camera.near = 0.1;
                // light.shadow.camera.far = 100;
                // light.shadowCameraFov = 90;

                // light.shadowMapBias = 0.01;
                // light.shadowMapDarkness = 0.7;
                // light.shadowMapWidth = 2*512;
                // light.shadowMapHeight = 2*512;
                // scene.add( light );




                //var light = new THREE.AmbientLight( 0x404040 ); // soft white light
                //scene.add( light );
                //controls = new PointerLockControls( camera );

                pitchObject = new THREE.Object3D();
                pitchObject.add( camera );

                yawObject = new THREE.Object3D();
                yawObject.position.y = 2;
                yawObject.add( pitchObject );
                scene.add( yawObject );

                // floor
                geometry = new THREE.PlaneGeometry( 300, 300, 500, 500);
                geometry.shadowCameraFar = 500;//camera.far;
                geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

                material = new THREE.MeshLambertMaterial( { color: 0xdddddd, shininess: 10, specular: 0x111111, } );

                mesh = new THREE.Mesh( geometry, material );
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                scene.add( mesh );

                renderer = new THREE.WebGLRenderer();
                renderer.shadowMapEnabled = true;
                renderer.shadowMapSoft = true;
                renderer.setSize( window.innerWidth, window.innerHeight );
                //renderer.setClearColor( scene.fog.color, 1 );
                var cand = document.getElementById( 'cand' );
                cand.appendChild( renderer.domElement );

                window.addEventListener( 'resize', onWindowResize, false );

                material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
                var boxGeometry = new THREE.SphereBufferGeometry( 1.2, 3, 3 )
                for(var i=0; i<1; i++){
                    var x = -10;
                    var y = 1;
                    var z = -10;

                    var boxMesh = new THREE.Mesh( boxGeometry, material );

                    //boxMesh.position.set(0,0.5,0);
                    //boxMesh.castShadow = true;
                    //boxMesh.receiveShadow = true;
                    boxMeshes.push(boxMesh);

                //scene.add(boxMesh);
                // pointLight2 = createLight( 0x0000ff, boxMesh);
                // pointLight2.position.set(0, 1, 0);
                // scene.add( pointLight2 );
                // pointLight2 = createLight( 0x0000ff, boxMesh);
                // pointLight2.position.set(10, 1, 0);
                // scene.add( pointLight2 );
                // pointLight2 = createLight( 0x0000ff, boxMesh);
                // pointLight2.position.set(20, 1, 0);
                // scene.add( pointLight2 );
                // pointLight2 = createLight( 0x0000ff, boxMesh);
                // pointLight2.position.set(30, 1, 0);
                // scene.add( pointLight2 );
                pointLight = createLight( 0xff0000, boxMesh);
                light = pointLight
                //scene.add( light );
                pointLight = createLight( 0x0000ff, boxMesh);
                light2 = pointLight
                //scene.add( light2 );
                light.position.set(-20, 1, -10)
                light2.position.set(-20, 1, -30)

                light = new THREE.PointLight( 0xff0000, 1, 100 );
                light.position.set(-20, 1, -10)
                scene.add( light );

                light2 = new THREE.PointLight( 0x0000ff, 1, 100 );
                light2.position.set(-20, 1, -30)
                scene.add( light2 );
                light.castShadow = true;     
                light2.castShadow = true;     

                var geometry = new THREE.BoxGeometry( 1, 1, 1 );
                var material = new THREE.MeshPhongMaterial( {color: 0x444444} );
                cube = new THREE.Mesh( geometry, material );
                cube.position.set(-20, 1, -30)
                cube.castShadow = false;
                cube.receiveShadow = false;
                scene.add( cube );
                }

                function createLight( color, shape) {

var intensity = 1.0;

var pointLight = new THREE.PointLight( color, intensity, 10, 0.99 );
pointLight.castShadow = true;
pointLight.shadow.camera.near = 1;
pointLight.shadow.camera.far = 50;
pointLight.shadowCameraFov = 90;
pointLight.shadow.bias = - 0.5; // reduces self-shadowing on double-sided objects

var geometry = new THREE.SphereBufferGeometry( 0.3, 3, 3 );
var material = new THREE.MeshBasicMaterial( { color: color } );
material.color.multiplyScalar( intensity );
var sphere = new THREE.Mesh( geometry, material );
pointLight.add( shape );


return pointLight;

}
            }

            function onWindowResize() {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize( window.innerWidth, window.innerHeight );
            }
            function animate() {
                requestAnimationFrame( animate );
                for(var i=0; i<boxMeshes.length; i++){
                    var y = 6+Math.sin(Date.now()/100)*5;
                    //light.position.set((xx-800)/30, 1.2, (yy+600)/30);
                    boxMeshes[i].position.set(110, 0, 0);
                    cube.position.set(-20, 3+Math.sin(Date.now()/1000)*3, -30);
                    light.position.set(-20-Math.sin(Date.now()/1000)*5, 1, -30-Math.cos(Date.now()/1000)*5)
                    light2.position.set(-20+Math.sin(Date.now()/1000)*5, 1, -30+Math.cos(Date.now()/1000)*5)
                    if(FPS.length > 100)
                        FPS.shift();
                    FPS.push(Date.now()-last)
                    console.log(FPS.reduce((a, b) => a + b, 0), Date.now()-last) //FPS
                    last = Date.now();
                }

                update( Date.now() - time );
                renderer.render( scene, camera );
                time = Date.now();
            }

            window.addEventListener("click",function(e){

            });
            function update(delta) {
                if(moveRight)
                    posx += 0.1;
                if(moveLeft)
                    posx -= 0.1;
                if(moveForward)
                    posz -=0.1;
                if(moveBackward)
                    posz += 0.1;
                yawObject.position.set(posx, 5, posz);

            };
            console.log('tmi')
        }, 1000);