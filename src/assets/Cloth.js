/*
 * Cloth Simulation using a relaxed constraints solver
 */

// Suggested Readings

// Advanced Character Physics by Thomas Jakobsen Character
// http://freespace.virgin.net/hugo.elias/models/m_cloth.htm
// http://en.wikipedia.org/wiki/Cloth_modeling
// http://cg.alexandra.dk/tag/spring-mass-system/
// Real-time Cloth Animation http://www.darwin3d.com/gamedev/articles/col0599.pdf

var DAMPING = 0.999;
var DRAG = 1 - DAMPING;
var MASS = 3000.1;
var restDistance = 25;

var xSegs = 100;
var ySegs = 100;

var clothFunction = plane( restDistance * xSegs, restDistance * ySegs );

var cloth = new Cloth( xSegs, ySegs );

var GRAVITY = 981 * -0.00 ;
var gravity = new THREE.Vector3( 0, 0, GRAVITY).multiplyScalar( MASS );


var TIMESTEP = 18 / 1000;
var TIMESTEP_SQ = TIMESTEP * TIMESTEP;

var pins = [];


var wind = true;
var windStrength = 2;
var windForce = new THREE.Vector3( 0, 0, 0 );

bp = () => new THREE.Vector3( 0, - 45, 0 );
var ballPositions = [bp(), bp(), bp(), bp(), bp(), bp(), bp(), bp(), bp(), bp(), bp(), bp()]

var ballSize = [30, 30, 30, 300, 300, 30, 30, 30, 30, 30, 30, 30];

var tmpForce = new THREE.Vector3();

var lastTime;


function plane( width, height ) {

	return function ( u, v, target ) {

		var x = ( u - 0.5 ) * width;
		var y = ( v + 0.5 ) * height;
		var z = 0;

		target.set( x, y, z );

	};

}

function Particle( x, y, z, mass ) {

	this.position = new THREE.Vector3();
	this.previous = new THREE.Vector3();
	this.original = new THREE.Vector3();
	this.a = new THREE.Vector3( 0, 0, 0 ); // acceleration
	this.mass = mass;
	this.invMass = 1 / mass;
	this.tmp = new THREE.Vector3();
	this.tmp2 = new THREE.Vector3();

	// init

	clothFunction( x, y, this.position ); // position
	clothFunction( x, y, this.previous ); // previous
	clothFunction( x, y, this.original );

}

// Force -> Acceleration

Particle.prototype.addForce = function ( force ) {

	this.a.add(
		this.tmp2.copy( force ).multiplyScalar( this.invMass )
	);

};


// Performs Verlet integration

Particle.prototype.integrate = function ( timesq ) {

	var newPos = this.tmp.subVectors( this.position, this.previous );
	newPos.multiplyScalar( DRAG ).add( this.position );
	newPos.add( this.a.multiplyScalar( timesq ) );

	this.tmp = this.previous;
	this.previous = this.position;
	this.position = newPos;

	this.a.set( 0, 0, 0 );

};


var diff = new THREE.Vector3();

function satisfyConstraints( p1, p2, distance ) {

	diff.subVectors( p2.position, p1.position );
	var currentDist = diff.length();
	if ( currentDist === 0 ) return; // prevents division by 0
	var correction = diff.multiplyScalar( 1 - distance / currentDist );
	var correctionHalf = correction.multiplyScalar( 0.5 );
	p1.position.add( correctionHalf );
	p2.position.sub( correctionHalf );

}


function Cloth( w, h ) {

	w = w || 10;
	h = h || 10;
	this.w = w;
	this.h = h;

	var particles = [];
	var constraints = [];

	var u, v;

	// Create particles
	for ( v = 0; v <= h; v ++ ) {

		for ( u = 0; u <= w; u ++ ) {

			particles.push(
				new Particle( u / w, v / h, 0, MASS )
			);

		}

	}

	// Structural

	for ( v = 0; v < h; v ++ ) {

		for ( u = 0; u < w; u ++ ) {

			constraints.push( [
				particles[ index( u, v ) ],
				particles[ index( u, v + 1 ) ],
				restDistance
			] );

			constraints.push( [
				particles[ index( u, v ) ],
				particles[ index( u + 1, v ) ],
				restDistance
			] );

		}

	}

	for ( u = w, v = 0; v < h; v ++ ) {

		constraints.push( [
			particles[ index( u, v ) ],
			particles[ index( u, v + 1 ) ],
			restDistance

		] );

	}

	for ( v = h, u = 0; u < w; u ++ ) {

		constraints.push( [
			particles[ index( u, v ) ],
			particles[ index( u + 1, v ) ],
			restDistance
		] );

	}


	// While many systems use shear and bend springs,
	// the relaxed constraints model seems to be just fine
	// using structural springs.
	// Shear
	// var diagonalDist = Math.sqrt(restDistance * restDistance * 2);


	// for (v=0;v<h;v++) {
	// 	for (u=0;u<w;u++) {

	// 		constraints.push([
	// 			particles[index(u, v)],
	// 			particles[index(u+1, v+1)],
	// 			diagonalDist
	// 		]);

	// 		constraints.push([
	// 			particles[index(u+1, v)],
	// 			particles[index(u, v+1)],
	// 			diagonalDist
	// 		]);

	// 	}
	// }


	this.particles = particles;
	this.constraints = constraints;

	function index( u, v ) {

		return u + v * ( w + 1 );

	}

	this.index = index;

}
function setb(i, x, y, z)
{
	ballPositions[i].z = z || 7;	
	ballPositions[i].x = x/1000.0*1250;
	ballPositions[i].y = 2500 - y/1000.0*1250;
}
last = [[], [], [], [], [], [], [], [], [], [], [], []];
function getd (i, x, y) {
	xx = (parseInt(x/20+50))
	yy = (100-parseInt(y/20+50))-1
	var curr = cloth.particles[yy*101+xx].position.z;
	if (Math.abs(curr) < 30)
		curr = -20;
	last[i].push(curr)
	if(last[i].length > 10) last[i].shift()
	var avg = (last[i][0] + last[i][1] + last[i][2] + last[i][3] + last[i][4]  + last[i][5]  + last[i][6]  + last[i][7]  + last[i][8]  + last[i][9]  )/7.5
	return avg < -200 ?  -200 : avg;
}
function simulate( time ) {

	if ( ! lastTime ) {

		lastTime = time;
		return;

	}

	var i, il, particles, particle, pt, constraints, constraint;

	// Aerodynamics forces

	if ( wind ) {

		var indx;
		var normal = new THREE.Vector3();
		var indices = clothGeometry.index;
		var normals = clothGeometry.attributes.normal;

		particles = cloth.particles;

		for ( i = 0, il = indices.count; i < il; i += 3 ) {

			for ( j = 0; j < 3; j ++ ) {

				indx = indices.getX( i + j );
				normal.fromBufferAttribute( normals, indx )
				tmpForce.copy( normal ).normalize().multiplyScalar( normal.dot( windForce ) );
				particles[ indx ].addForce( tmpForce );

			}

		}

	}

	for ( particles = cloth.particles, i = 0, il = particles.length; i < il; i ++ ) {

		particle = particles[ i ];
		particle.addForce( gravity );

		particle.integrate( TIMESTEP_SQ );

	}

	// Start Constraints

	constraints = cloth.constraints;
	il = constraints.length;

	for ( i = 0; i < il; i ++ ) {

		constraint = constraints[ i ];
		satisfyConstraints( constraint[ 0 ], constraint[ 1 ], constraint[ 2 ] );

	}

	// Ball Constraints
	

	if ( true ) {

		for ( particles = cloth.particles, i = 0, il = particles.length; i < il; i ++ ) {

			particle = particles[ i ];
			var pos = particle.position;
			for (let i of ballPositions.keys()) {
				diff.subVectors( pos, ballPositions[i] );
				if ( diff.length() < ballSize[i] ) {

					// collided
					diff.normalize().multiplyScalar( ballSize[i] );
					pos.copy( ballPositions[i] ).add( diff );

				}
			}

		}

	}


	// Floor Constraints

	for ( particles = cloth.particles, i = 0, il = particles.length; i < il; i ++ ) {

		particle = particles[ i ];
		pos = particle.position;
		if ( pos.y < - 250 ) {

			pos.y = - 250;

		}

	}

	// Pin Constraints

	for ( i = 0, il = pins.length; i < il; i ++ ) {
		var xy = pins[ i ];
		var p = particles[ xy ];
		p.position.copy( p.original );
		p.previous.copy( p.original );

		var hh = Math.sin(Date.now()/500)*0-200;
		var p = particles[ 2499 ];
			p.position.set(p.position.x, p.position.y, hh);
			p.previous.set(p.previous.x, p.previous.y, hh);

		var p = particles[ 7499 ];
			p.position.set(p.position.x, p.position.y, hh);
			p.previous.set(p.previous.x, p.previous.y, hh);
		var hh = Math.sin(Date.now()/500)*0-0;

		var p = particles[ 5500 ];
			p.position.set(p.position.x, p.position.y, hh);
			p.previous.set(p.previous.x, p.previous.y, hh);


		// var p = particles[ 7496 ];
		// 	p.position.set(p.position.x, p.position.y-0.01, p.position.z-0.001);
		// 	p.previous.set(p.position.x, p.position.y-0.01, p.position.z-0.001);

		// var p = particles[ 7502 ];
		// 	p.position.set(p.position.x, p.position.y+0.01, p.position.z-0.001);
		// 	p.previous.set(p.position.x, p.position.y+0.01, p.position.z-0.001);

		// var p = particles[ 7493 ];
		// 	p.position.set(p.position.x, p.position.y-0.01, p.position.z-0.001);
		// 	p.previous.set(p.position.x, p.position.y-0.01, p.position.z-0.001);
		// var p = particles[ 7505 ];
		// 	p.position.set(p.position.x, p.position.y+0.01, p.position.z-0.001);
		// 	p.previous.set(p.position.x, p.position.y+0.01, p.position.z-0.001);


		// var p = particles[ 8105 ];
		// 	p.position.set(p.position.x-0.01, p.position.y, p.position.z-0.001);
		// 	p.previous.set(p.position.x-0.01, p.position.y, p.position.z-0.001);
		// var p = particles[ 6893 ];
		// 	p.position.set(p.position.x+0.01, p.position.y, p.position.z-0.001);
		// 	p.previous.set(p.position.x+0.01, p.position.y, p.position.z-0.001);


		// var p = particles[ 75 ];
		// 	p.position.set(p.position.x+0.01, p.position.y, p.position.z);
		// 	p.previous.set(p.position.x+0.01, p.position.y, p.position.z);
		// var p = particles[ 7299 ];
		// 	p.position.set(p.position.x-0.01, p.position.y, p.position.z);
		// 	p.previous.set(p.position.x-0.01, p.position.y, p.position.z);


	}


}
