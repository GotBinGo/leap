import * as THREE from 'three';
import { FingerBone } from './finger-bone';

export class Hand extends THREE.Object3D {
    fingerBones;
    palmOutputMatrix;
    tmpPosition;
    tmpQuaternion;
    tmpScale;
    quaternion;
    palmOutputAdjustmentMatrix;
    palmMeshAdjustmentQuaternion;
    palmVelocity;

    palm;
    _scaleVector;
    constructor() {
        super();

        this.fingerBones = [];
        this.palmOutputMatrix = new THREE.Matrix4();
        this.tmpPosition = new THREE.Vector3();
        this.tmpQuaternion = new THREE.Quaternion();
        this.tmpScale = new THREE.Vector3();

        const quaternion = (new THREE.Quaternion()).setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
        quaternion.multiply((new THREE.Quaternion()).setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 6));
        this.palmOutputAdjustmentMatrix = (new THREE.Matrix4()).makeRotationFromQuaternion(quaternion);

        this.palmMeshAdjustmentQuaternion = (new THREE.Quaternion()).setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 6);

        this.palmVelocity = new THREE.Vector3();

        this._initFingers();
        this._initPalm();
    }

    _initFingers() {

        let fingerBone;
        for (let i = 0; i < 5; i++) {
            for (let j = 1; j < 4; j++) {
                fingerBone = new FingerBone(i, j, j + 1);
                this.fingerBones.push(fingerBone);
                this.add(fingerBone);
            }
        }
    }

    _initPalm() {
        const geometry = new THREE.CylinderGeometry(1, 1, 1, 6);
        this.palm = new THREE.Mesh(geometry, this.getMaterial());
        // this.palm.motionMaterial = new MeshMotionMaterial();
        this.palm.castShadow = true;
        this.palm.receiveShadow = true;
        this.add(this.palm);
    }

    leapUpdate = (hand) => {
        console.log(hand);
        const fingers = hand.fingers;
        const fingerBones = this.fingerBones;
        for (let i = 0, len = fingerBones.length; i < len; i++) {
            fingerBones[i].leapUpdate(fingers);
        }

        // update palm
        this.palm.position.fromArray(hand.palmPosition);
        this.palm.rotation.set( hand.pitch(), -hand.yaw(), hand.roll());
        this.palm.translateZ(20);
        this.palm.translateX(-5);
        this.palm.quaternion.multiply(this.palmMeshAdjustmentQuaternion);

        const p0 = (new THREE.Vector3()).fromArray(hand.pinky.positions[1]);
        const p1 = (new THREE.Vector3()).fromArray(hand.thumb.positions[1]);
        const radius = p0.distanceTo(p1) * 0.45;
        this.palm.scale.set(radius, hand.thumb.width * 1.2, radius);

        this.palmVelocity.fromArray(hand.palmVelocity);

        this.updateMatrixWorld(true);

        this.updateOutputMatrix();
    }

    updateOutputMatrix = () => {

        const list = [];

        const palmOutputMatrix = this.palmOutputMatrix;
        const position = this.tmpPosition;
        const quaternion = this.tmpQuaternion;
        const scale = this.tmpScale;

        palmOutputMatrix.copy(this.palm.matrixWorld);
        palmOutputMatrix.multiply(this.palmOutputAdjustmentMatrix);

        palmOutputMatrix.decompose(position, quaternion, scale);
        palmOutputMatrix.compose(position, quaternion, this._scaleVector);
        palmOutputMatrix.getInverse(palmOutputMatrix);


        // match the sdf primitive sin60
        palmOutputMatrix.elements[3] = scale.x * 0.866025;
        palmOutputMatrix.elements[7] = scale.y * 0.866025;
        palmOutputMatrix.elements[11] = scale.z;

        list.push(Array.prototype.slice.call(palmOutputMatrix.elements));

        const fingerBones = this.fingerBones;
        for (let i = 0, len = fingerBones.length; i < len; i++) {
            list.push(fingerBones[i].updateOutputMatrix());
            fingerBones[i].updateOutputMatrix();
        }

        return list;
    }
    getMaterial() {
        return new THREE.MeshStandardMaterial( {
              roughness: 0.86,
              metalness: 0.45,
              color: 0xaaaaaa,
              emissive: 0x000000
        });
      }
}
