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
const gridHelper = new THREE.GridHelper( size, divisions );
scene.add( gridHelper );

// Mesh
let jaw;
var loader = new STLLoader();
loader.load("upperjaw.stl", function (geo) {
  // let mat = new THREE.MeshPhongMaterial({
  //   color: "blue",
  //   flatShading: true,
  //   side: THREE.DoubleSide,
  //   // transparent: true,
  //   // opacity:  0.5,
  // });
  let mat = new THREE.MeshNormalMaterial();
  jaw = new THREE.Mesh(geo, mat)
  scene.add(jaw);
});

renderer.setAnimationLoop(() => {
  cameraCtrl.update();
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
});
