"use strict";
import * as THREE from "three";
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

import { addSplineObject } from './spline';

let stats;
let camera, scene, renderer;
const splineHelperObjects = [];
const positions = [];
let splinePointsLength = 4;
const point = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const onUpPosition = new THREE.Vector2();
const onDownPosition = new THREE.Vector2();
let transformControl;
const ARC_SEGMENTS = 200;
const params = {
  uniform: true,
  tension: 0.5,
  addPoint: addPoint,
  removePoint: removePoint,
  exportSpline: exportSpline
};

let spline;

init();
animate();

function init() {
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;

  document.body.appendChild(renderer.domElement);
  stats = new Stats();
  document.body.appendChild( stats.dom );
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xf0f0f0 );
  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.set( 0, 250, 1000 );

  scene.add( camera );
  scene.add( new THREE.AmbientLight( 0xf0f0f0 ) );

  const light = new THREE.SpotLight( 0xffffff, 1.5 );
  light.position.set( 0, 1500, 200 );
  light.angle = Math.PI * 0.2;
  light.castShadow = true;
  light.shadow.camera.near = 200;
  light.shadow.camera.far = 2000;
  light.shadow.bias = - 0.000222;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  scene.add( light );

  const planeGeometry = new THREE.PlaneBufferGeometry( 2000, 2000 );
  planeGeometry.rotateX( - Math.PI / 2 );
  const planeMaterial = new THREE.ShadowMaterial( { opacity: 0.2 } );
  const plane = new THREE.Mesh( planeGeometry, planeMaterial );
  plane.position.y = - 200;
  plane.receiveShadow = true;
  scene.add( plane );

  const helper = new THREE.GridHelper( 2000, 100 );
  helper.position.y = - 199;
  helper.material.opacity = 0.25;
  helper.material.transparent = true;
  scene.add( helper );

  const gui = new GUI();
  gui.add( params, 'uniform' );
  gui.add( params, 'tension', 0, 1 ).step( 0.01 ).onChange( function ( value ) {
    spline.tension = value;
    updateSplineOutline();
  } );
  gui.add( params, 'addPoint' );
  gui.add( params, 'removePoint' );
  gui.add( params, 'exportSpline' );
  gui.open();

  // Controls
  const controls = new OrbitControls( camera, renderer.domElement );
  controls.damping = 0.2;
  controls.addEventListener( 'change', render );
  transformControl = new TransformControls( camera, renderer.domElement );
  transformControl.addEventListener( 'change', render );
  transformControl.addEventListener( 'dragging-changed', function ( event ) {
    controls.enabled = ! event.value;
  } );
  scene.add( transformControl );
  transformControl.addEventListener( 'objectChange', function () {
    updateSplineOutline();
  } );

  document.addEventListener( 'pointerdown', onPointerDown, false );
  document.addEventListener( 'pointerup', onPointerUp, false );
  document.addEventListener( 'pointermove', onPointerMove, false );

  /*******
   * Curves
   *********/
  for ( let i = 0; i < splinePointsLength; i ++ ) {
    let obj = addSplineObject( positions[ i ] );
    splineHelperObjects.push(obj);
    scene.add(obj);
  }

  // positions.length = 0;
  for ( let i = 0; i < splinePointsLength; i ++ ) {
    positions.push( splineHelperObjects[ i ].position );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( ARC_SEGMENTS * 3 ), 3 ) );

  spline = new THREE.CatmullRomCurve3( positions );
  spline.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
    color: 0xff0000,
    opacity: 0.35
  } ) );

  scene.add(spline.mesh);

  load( [ new THREE.Vector3( 289.76843686945404, 452.51481137238443, 56.10018915737797 ),
    new THREE.Vector3( - 53.56300074753207, 171.49711742836848, - 14.495472686253045 ),
    new THREE.Vector3( - 91.40118730204415, 176.4306956436485, - 6.958271935582161 ),
    new THREE.Vector3( - 383.785318791128, 491.1365363371675, 47.869296953772746 ) ] );
}

function addPoint() {
  splinePointsLength ++;
  let obj = addSplineObject();
  splineHelperObjects.push(obj);
  scene.add(obj);
  positions.push( obj.position );
  updateSplineOutline();
}

function removePoint() {
  if ( splinePointsLength <= 4 ) {
    return;
  }
  const point = splineHelperObjects.pop();
  splinePointsLength --;
  positions.pop();
  if ( transformControl.object === point ) transformControl.detach();
  scene.remove( point );
  updateSplineOutline();
}
function updateSplineOutline() {
  const position = spline.mesh.geometry.attributes.position;
  for ( let i = 0; i < ARC_SEGMENTS; i ++ ) {
    const t = i / ( ARC_SEGMENTS - 1 );
    spline.getPoint( t, point );
    position.setXYZ( i, point.x, point.y, point.z );
  }
  position.needsUpdate = true;
}
function exportSpline() {
  const strplace = [];
  for ( let i = 0; i < splinePointsLength; i ++ ) {
    const p = splineHelperObjects[ i ].position;
    strplace.push( `new THREE.Vector3(${p.x}, ${p.y}, ${p.z})` );
  }
  console.log( strplace.join( ',\n' ) );
  const code = '[' + ( strplace.join( ',\n\t' ) ) + ']';
  prompt( 'copy and paste code', code );
}

function load( new_positions ) {
  while ( new_positions.length > positions.length ) {
    addPoint();
  }
  while ( new_positions.length < positions.length ) {
    removePoint();
  }
  for ( let i = 0; i < positions.length; i ++ ) {
    positions[ i ].copy( new_positions[ i ] );
  }
  updateSplineOutline();
}

function animate() {
  requestAnimationFrame( animate );
  render();
  stats.update();
}

function render() {
  renderer.render( scene, camera );
}

function onPointerDown( event ) {
  onDownPosition.x = event.clientX;
  onDownPosition.y = event.clientY;
}

function onPointerUp(event) {
  onUpPosition.x = event.clientX;
  onUpPosition.y = event.clientY;
  if ( onDownPosition.distanceTo( onUpPosition ) === 0 ) transformControl.detach();
}

function onPointerMove( event ) {
  pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  raycaster.setFromCamera( pointer, camera );
  const intersects = raycaster.intersectObjects( splineHelperObjects );
  if ( intersects.length > 0 ) {
    const object = intersects[ 0 ].object;
    if ( object !== transformControl.object ) {
      transformControl.attach( object );
    }
  }
}
