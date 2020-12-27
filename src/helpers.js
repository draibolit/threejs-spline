import * as THREE from "three";

function createBenzier(vector3Array, numPoints) {
  let spline = new THREE.CubicBezierCurve3(...vector3Array); //pass members of Arr
  let material = new THREE.LineBasicMaterial({
    color: 0xff00f0,
  });
  let splinePoints = spline.getPoints(numPoints);
  let geometry = new THREE.BufferGeometry().setFromPoints(splinePoints);
  let line = new THREE.Line(geometry, material);
  return line;
}

function createSpline(vector3Array, numPoints) {
  let spline = new THREE.CatmullRomCurve3(vector3Array); // pass an array
  let material = new THREE.LineBasicMaterial({
    color: 0xff00f0,
  });
  let splinePoints = spline.getPoints(numPoints);
  let geometry = new THREE.BufferGeometry().setFromPoints(splinePoints);
  let line = new THREE.Line(geometry, material);
  return line;
}

function createBalls(vector3Array, size) {
  let balls = [];
  for (let i = 0; i < vector3Array.length; i++) {
    let geo = new THREE.SphereGeometry(size, 32, 32);
    let mesh = new THREE.Mesh(geo, new THREE.MeshNormalMaterial());
    mesh.position.copy(vector3Array[i]);
    balls.push(mesh);
  }
  return balls;
}

export { createBenzier, createSpline, createBalls };
