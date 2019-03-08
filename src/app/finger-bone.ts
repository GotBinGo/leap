import * as THREE from 'three';

export class FingerBone extends THREE.Object3D {

  fingerIndex;
  fromNodeIndex;
  toNodeIndex;
  outputMatrix;
  tmpPosition;
  tmpQuaternion;
  tmpScale;
  nodeAdjustmentQuaternion;
  bone;
  node;
  _boneGeometry;
  _nodeGeometry;
  _scaleVector;
  constructor(fingerIndex, fromNodeIndex, toNodeIndex) {
    super();

    this.fingerIndex = fingerIndex;
    this.fromNodeIndex = fromNodeIndex;
    this.toNodeIndex = toNodeIndex;

    this.outputMatrix = new THREE.Matrix4();
    this.tmpPosition = new THREE.Vector3();
    this.tmpQuaternion = new THREE.Quaternion();
    this.tmpScale = new THREE.Vector3();
    this.nodeAdjustmentQuaternion = (new THREE.Quaternion()).setFromAxisAngle(new THREE.Vector3(1,0,0), -Math.PI / 2);

    this.bone = new THREE.Mesh(this._getBoneGeometry(), this.getMaterial());
    // this.bone.motionMaterial = new MeshMotionMaterial();
    this.bone.castShadow = true;
    this.bone.receiveShadow = true;
    this.add(this.bone);

    this.node = new THREE.Mesh(this._getNodeGeometry(), this.getMaterial());
    // this.node.motionMaterial = new MeshMotionMaterial();
    this.node.castShadow = true;
    this.node.receiveShadow = true;
    this.add(this.node);
  }
  _getBoneGeometry () {
    if (!this._boneGeometry) {
        this._boneGeometry = new THREE.CylinderGeometry(1, 1, 1, 12, 1);
        this._boneGeometry.translate ( 0, -0.5, 0 );
    }
    return this._boneGeometry;
  }

  _getNodeGeometry() {
    if (!this._nodeGeometry) {
        this._nodeGeometry = new THREE.SphereGeometry(1, 10, 12);
    }
    return this._nodeGeometry;
  }

  updateOutputMatrix() {
    const outputMatrix = this.outputMatrix;
    const position = this.tmpPosition;
    const quaternion = this.tmpQuaternion;
    const scale = this.tmpScale;

    outputMatrix.copy(this.bone.matrixWorld);
    outputMatrix.decompose(position, quaternion, scale);
    outputMatrix.compose(position, quaternion, this._scaleVector);
    outputMatrix.getInverse(outputMatrix);

    outputMatrix.elements[3] = scale.x;
    outputMatrix.elements[7] = scale.y;
    outputMatrix.elements[11] = scale.z;

    return Array.prototype.slice.call(outputMatrix.elements);
  }

  leapUpdate = (fingers) => {
    console.log(fingers);
    const finger = fingers[this.fingerIndex];
    const fingerPosition = finger.positions;
    const from = fingerPosition[this.fromNodeIndex];
    const to = fingerPosition[this.toNodeIndex];
    const scale = finger.width / 2;
    this.node.position.set(from[0], from[1], from[2]);
    this.bone.position.set(to[0], to[1], to[2]);
    this.bone.lookAt(this.node.position);
    this.node.scale.set(scale, scale, scale);
    const length = this.bone.position.distanceTo(this.node.position);
    this.node.position.copy(this.bone.position);
    this.bone.scale.set(scale, length, scale);
    this.bone.quaternion.multiply(this.nodeAdjustmentQuaternion);
  }
  getMaterial() {
    return new THREE.MeshStandardMaterial( {
          roughness: 0.86,
          metalness: 0.45,
          color: 0xffaaaa,
          emissive: 0x000000
    });
  }
}
