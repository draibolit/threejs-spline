"use strict";
import * as THREE from "three";
import { initLight } from "../public/helpers";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";

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

// smooth my curve over this many points
let vectorArr1 = [];
vectorArr1.push(new THREE.Vector3(-10, 0, 0));
vectorArr1.push(new THREE.Vector3(-5, 15, 0));
vectorArr1.push(new THREE.Vector3(20, 15, 0));
vectorArr1.push(new THREE.Vector3(10, 0, 0));

let vectorArr2 = [];
vectorArr2.push(new THREE.Vector3(0, 0, 0));
vectorArr2.push(new THREE.Vector3(0, 200, 0));
vectorArr2.push(new THREE.Vector3(150, 150, 0));
vectorArr2.push(new THREE.Vector3(150, 50, 0));

// let spline = new THREE.CubicBezierCurve3(vectorArr1[0], vectorArr1[1], vectorArr1[2], vectorArr1[3]);
let spline = new THREE.CubicBezierCurve3(
  vectorArr2[0],
  vectorArr2[1],
  vectorArr2[2],
  vectorArr2[3]
);
let material = new THREE.LineBasicMaterial({
  color: 0xff00f0,
});
let numPoints = 100;
let splinePoints = spline.getPoints(numPoints);
// let geometry = new THREE.Geometry();
// for(let i = 0; i < splinePoints.length; i++){
//     geometry.vertices.push(splinePoints[i]);
// }
let geometry = new THREE.BufferGeometry().setFromPoints(splinePoints);
let line = new THREE.Line(geometry, material);
scene.add(line);

for (let i=0; i < vectorArr2.length; i++) {
  let geo = new THREE.SphereGeometry(3, 32, 32);
  let mesh = new THREE.Mesh(geo, new THREE.MeshNormalMaterial());
  mesh.position.copy(vectorArr2[i]);
  scene.add(mesh);
}

renderer.setAnimationLoop(() => {
  cameraCtrl.update();
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
});
