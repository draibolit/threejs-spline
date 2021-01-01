"use strict";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

import { Spline } from "./spline";

let stats;
let camera, scene, renderer;

const raycaster = new THREE.Raycaster();
// raycaster.params = {
//   Mesh: {threshold: 0.1},
//   Line: { threshold: 1 },
//   LOD: {},
//   Points: { threshold: 1 },
//   Sprite: {},
// };

const onUpPosition = new THREE.Vector2();
const onDownPosition = new THREE.Vector2();
let pointer = new THREE.Vector2();
let spline;

init();
animate();

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  document.body.appendChild(renderer.domElement);
  stats = new Stats();
  document.body.appendChild(stats.dom);
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set(0, 250, 1000);

  scene.add(camera);
  scene.add(new THREE.AmbientLight(0xf0f0f0));

  const light = new THREE.SpotLight(0xffffff, 1.5);
  light.position.set(0, 1500, 200);
  light.angle = Math.PI * 0.2;
  light.castShadow = true;
  light.shadow.camera.near = 200;
  light.shadow.camera.far = 2000;
  light.shadow.bias = -0.000222;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  scene.add(light);

  const planeGeometry = new THREE.PlaneBufferGeometry(2000, 2000);
  planeGeometry.rotateX(-Math.PI / 2);
  const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.y = -200;
  plane.receiveShadow = true;
  scene.add(plane);

  const helper = new THREE.GridHelper(2000, 100);
  helper.position.y = -199;
  helper.material.opacity = 0.25;
  helper.material.transparent = true;
  scene.add(helper);

  document.addEventListener("pointerdown", onPointerDown, false);
  document.addEventListener("pointerup", onPointerUp, false);
  document.addEventListener("pointermove", onPointerMove, false);

  // Camera control
  let cameraCtrl = new OrbitControls(camera, renderer.domElement);
  cameraCtrl.damping = 0.2;

  /*******
   * Curves
   *********/

  // num of vector >=2;
  spline = new Spline(scene, [
    new THREE.Vector3(
      289.76843686945404,
      452.51481137238443,
      56.10018915737797
    ),
    new THREE.Vector3(
      -53.56300074753207,
      171.49711742836848,
      -14.495472686253045
    ),
    new THREE.Vector3(
      -91.40118730204415,
      176.4306956436485,
      -6.958271935582161
    ),
    new THREE.Vector3(-383.785318791128, 491.1365363371675, 47.869296953772746),
    new THREE.Vector3(
      -583.785318791128,
      591.1365363371675,
      147.869296953772746
    ),
  ]);

  spline.initControls(camera, cameraCtrl, renderer);
  // spline.removeControlPoint(1);
  // spline.addControlPoint(new THREE.Vector3(0,0,0), 1);
  spline.addControlPoint(new THREE.Vector3(0, 0, 0), 2);
  spline.activateCreatePoint(renderer.domElement, raycaster, camera);
  spline.activateHighlight(renderer.domElement, raycaster, camera);


// --------------------------
// Create original curve
// var curve = new THREE.CatmullRomCurve3( [
//     new THREE.Vector3( -10, 0, 10 ),
//     new THREE.Vector3( -5, 5, 5 ),
//     new THREE.Vector3( 0, 0, 0 ),
//     new THREE.Vector3( 5, -5, 5 ),
//     new THREE.Vector3( 50, 0, 50 )
// ], false );

// var searchPoint = new THREE.Vector3( 5, -5, 5 ); // Point we're looking for
// var searchArray = [];   // Array for second curve
// var uPosition = null; // Result is null for now

// // Loop through curve.points to find our final point
// for(var i = 0; i < curve.points.length; i++){
//   debugger;
//     searchArray.push(curve.points[i]);

//     // Exit loop once point has been found
//     if(searchPoint.equals(curve.points[i])){
//         // Create shorter curve that stops at desired point
//         var curve2 = new THREE.CatmullRomCurve3(searchArray);

//         // Result is short length / original length
//         uPosition = curve2.getLength() / curve.getLength();
//         break;
//     }
// }

// // Result is null if position not found
// console.log(uPosition);

// --------------------------
//
//
}

function animate() {
  requestAnimationFrame(animate);
  render();
  stats.update();
}

function render() {
  renderer.render(scene, camera);
}

function onPointerDown(event) {
  onDownPosition.x = event.clientX;
  onDownPosition.y = event.clientY;
}

function onPointerUp(event) {
  onUpPosition.x = event.clientX;
  onUpPosition.y = event.clientY;
  if (onDownPosition.distanceTo(onUpPosition) === 0)
    spline.transformControl.detach();
}

function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(spline.splineHelperObjects);
  if (intersects.length > 0) {
    const object = intersects[0].object;
    if (object !== spline.transformControl.object) {
      spline.transformControl.attach(object);
    }
  }
}
