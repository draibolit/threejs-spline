"use strict";
import * as THREE from "three";
import { initLight } from "../public/helpers";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import {createBalls, createSpline, createBenzier} from "./helpers"

let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
let scene = new THREE.Scene();
scene.background = new THREE.Color(0xb0b0b0);
// Light
let lightArr = initLight();
for (let lightSource of lightArr) {
  scene.add(lightSource);
}
// Camera and control
let camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.set(0, 0, 100);
let cameraCtrl = new TrackballControls(camera, renderer.domElement);

const size = 100;
const divisions = 10;
const gridHelper = new THREE.GridHelper(size, divisions);
scene.add(gridHelper);

let vectorArr1 = [];
vectorArr1.push(new THREE.Vector3(-10, 0, 0));
vectorArr1.push(new THREE.Vector3(-5, 15, 0));
vectorArr1.push(new THREE.Vector3(20, 15, 0));
vectorArr1.push(new THREE.Vector3(10, 0, 0));

let vectorArr2 = [];
vectorArr2.push(new THREE.Vector3( -10, 0, 10 ));
vectorArr2.push(new THREE.Vector3( -5, 5, 5 ));
vectorArr2.push(new THREE.Vector3( 0, 0, 0 ));
vectorArr2.push(new THREE.Vector3( 5, -5, 5 ));
vectorArr2.push(new THREE.Vector3( 10, 0, 10 ));


let vectorArr = vectorArr1;
// let vectorArr = vectorArr2;

let benzier = createBenzier(vectorArr, 100);
scene.add(benzier);

let spline = createSpline(vectorArr, 100);
scene.add(spline);

let balls = createBalls(vectorArr, 1);
scene.add(...balls);


renderer.setAnimationLoop(() => {
  cameraCtrl.update();
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
});
