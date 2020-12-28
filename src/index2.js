"use strict";
import * as THREE from "three";
import { initLight } from "../public/helpers";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import {createBalls, createSpline, createBenzier} from "./helpers";

import { ArrPointer } from "./arrowpointer";

let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
let scene = new THREE.Scene();
scene.background = new THREE.Color(0xb0b0b0);
// Light
let lightArr = initLight();
scene.add(...lightArr);
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


// Insert curve here


// Mesh
let jaw;
var loader = new STLLoader();
loader.load("upperjaw.stl", function (geo) {
  let mat = new THREE.MeshNormalMaterial();
  jaw = new THREE.Mesh(geo, mat)
  scene.add(jaw);
});

// ArrPointer
let raycaster = new THREE.Raycaster();

let arrowPointer = new ArrPointer({});
arrowPointer.follow(renderer, camera, raycaster);
scene.add(arrowPointer.arrowHelper);

// Event
renderer.domElement.addEventListener( 'pointerdown', onPointerDown, false );
renderer.domElement.addEventListener( 'pointermove', onPointerMove, false );

let onDownPosition = new THREE.Vector2();
function onPointerDown( e ) {
  let rect = renderer.domElement.getBoundingClientRect();
  const mouse = {
    x: ((e.clientX - rect.left) / (rect.width - rect.left)) * 2 - 1,
    y: -((e.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1,
  };
  onDownPosition.x = mouse.x;
  onDownPosition.y = mouse.y;
}

let mulRatio = new THREE.Vector3( 2,2,2);
function onPointerMove(e) {
  let rect = renderer.domElement.getBoundingClientRect();
  const mouse = {
    x: ((e.clientX - rect.left) / (rect.width - rect.left)) * 2 - 1,
    y: -((e.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1,
  };
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([jaw,], false);
  if (intersects.length > 0) {
    let n = intersects[0].face.normal.clone();
    n.transformDirection(intersects[0].object.matrixWorld);
    let vecDir = n.clone().negate();
    let vecPos = intersects[0].point.add(n.multiply(mulRatio));
    arrowPointer.arrowHelper.setDirection(vecDir);
    arrowPointer.arrowHelper.position.copy(vecPos);
  }
}

renderer.setAnimationLoop(() => {
  cameraCtrl.update();
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
});

// TODO: add jaw; determine raycaster point;draw and update curve when click to that point <28-12-20, Tuan Nguyen Anh> //
//
//
//
// let vectorArr = [
// new THREE.Vector3( -10, 0, 10 ),
// new THREE.Vector3( -5, 5, 5 ),
// // new THREE.Vector3( 0, 0, 0 ),
// // new THREE.Vector3( 5, -5, 5 ),
// // new THREE.Vector3( 10, 0, 10 )
// ];

// // let benzier = createBenzier(vectorArr, 100);
// // scene.add(benzier);
// let spline = createSpline(vectorArr, 100);
// scene.add(spline);
// let balls = createBalls(vectorArr, 0.5);
// scene.add(...balls);
