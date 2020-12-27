import * as THREE from "three";

function createLineFromPoints(points, color){
  let material = new THREE.LineBasicMaterial({
    color: color,
  });
  let geometry = new THREE.BufferGeometry().setFromPoints(points);
  let line = new THREE.Line(geometry, material);
  return line
}

function createBenzier(vector3Array, numPoints) {
  let spline = new THREE.CubicBezierCurve3(...vector3Array); //pass members of Arr
  let splinePoints = spline.getPoints(numPoints);
  let line = createLineFromPoints(splinePoints, 'blue');
  return line;
}

function createSpline(vector3Array, numPoints) {
  // let spline = new THREE.CatmullRomCurve3(vector3Array); // pass an array
  let spline = new THREE.CatmullRomCurve3(vector3Array, true); // pass an array
  let splinePoints = spline.getPoints(numPoints);
  let line = createLineFromPoints(splinePoints, 'green');
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
