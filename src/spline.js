'use strict'

import * as THREE from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { GUI } from "three/examples/jsm/libs/dat.gui.module.js";

class Spline {
  constructor(scene, new_positions) {
    this.scene = scene;

    this.splinePointsLength = new_positions.length;
    this.positions = []; // save the common vecs of objs and spline

    // Helper objs:
    this.splineHelperObjects = [];
    for (let i = 0; i < this.splinePointsLength; i++) {
      let helperObj = this._addHelperObj(new_positions[i]);
      this.positions.push(helperObj.position); // will be referenced by spline
      this.splineHelperObjects.push(helperObj);
    }

    // Spline: initialize spline with boilerplate of coords
    this.spline = new THREE.CatmullRomCurve3(this.positions); // interpolate seg points from main points (positions)
    let curveGeo = new THREE.BufferGeometry();
    curveGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(Spline.numSegs() * 3), 3)
    );
    this.spline.mesh = new THREE.Line(
      curveGeo,
      new THREE.LineBasicMaterial({
        color: 0xff0000,
        opacity: 0.35,
      })
    );

    this._updateSplineOutline();

    this.scene.add(...this.splineHelperObjects);
    this.scene.add(this.spline.mesh);

    // Gui
    let scope = this;
    const params = {
      uniform: true,
      tension: 0.5,
      addControlPoint: scope.addControlPoint.bind(scope),
      removeControlPoint: scope.removeControlPoint.bind(scope),
    };
    const gui = new GUI();
    gui.add(params, "uniform");
    gui
      .add(params, "tension", 0, 1)
      .step(0.01)
      .onChange(function (value) {
        console.log("tension value:", value); //? why tension doesn't work
        scope.spline.tension = value;
        scope._updateSplineOutline();
      });
    gui.add(params, "addControlPoint");
    gui.add(params, "removeControlPoint");
    gui.open();
  }

  static boxGeo() {
    return new THREE.BoxBufferGeometry(20, 20, 20);
  }
  static numSegs() {
    return 200;
  }

  initControls(camera, cameraCtrl, renderer) {
    this.transformControl = new TransformControls(camera, renderer.domElement);
    let scope = this;
    this.transformControl.addEventListener(
      "dragging-changed",
      function (event) {
        cameraCtrl.enabled = !event.value;
      }
    );
    this.scene.add(this.transformControl);
    this.transformControl.addEventListener("objectChange", function () {
      scope._updateSplineOutline();
    });
  }

  _addHelperObj(position) {
    const material = new THREE.MeshLambertMaterial({
      color: Math.random() * 0xffffff,
    });
    const object = new THREE.Mesh(Spline.boxGeo(), material);
    if (position) {
      object.position.copy(position);
    } else {
      object.position.x = 0;
      object.position.y = 0;
      object.position.z = 0;
    }
    object.castShadow = true;
    object.receiveShadow = true;
    return object;
  }

  // add point by a THREE.vector3, if no arg --> random position
  // TODO: need to add a point in the middle <29-12-20, Tuan Nguyen Anh> //
  addControlPoint(vector3) {
    let vec;
    if (vector3) {
      vec = vector3;
    } else {
      vec = new THREE.Vector3(
        Math.random() * 1000 - 500,
        Math.random() * 600,
        Math.random() * 800 - 400
      );
    }

    this.splinePointsLength++;
    let helperObj = this._addHelperObj(vec);
    this.splineHelperObjects.push(helperObj);
    this.positions.push(helperObj.position); // todo: add to after a position here
    this.scene.add(helperObj);
    this._updateSplineOutline();
  }

  // Remove a control point from a Pos; no arg --> last Pos
  removeControlPoint(atPosition) {
    if (this.splinePointsLength <= 2) {
      return;
    }

    // let obj;
    const obj;
    if (atPosition){
      [obj,] = this.splineHelperObjects.splice(atPosition, 1);
      this.positions.splice(atPosition, 1);

    }else{
      obj = this.splineHelperObjects.pop();
      this.positions.pop();
    }

    this.splinePointsLength--;
    if (this.transformControl.object === obj) this.transformControl.detach();
    this.scene.remove(obj);
    this._updateSplineOutline();
  }

  // Update seg points
  _updateSplineOutline() {
    let tempPoint = new THREE.Vector3();
    const meshPointPosition = this.spline.mesh.geometry.attributes.position; // get the mesh point reference
    for (let i = 0; i < Spline.numSegs(); i++) {
      const pos = i / (Spline.numSegs() - 1);
      this.spline.getPoint(pos, tempPoint); // save spline point to the immediate var
      meshPointPosition.setXYZ(i, tempPoint.x, tempPoint.y, tempPoint.z); // push from immediate var to mesh point
    }
    meshPointPosition.needsUpdate = true;
  }
}

export { Spline };
