"use strict";

import * as THREE from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { GUI } from "three/examples/jsm/libs/dat.gui.module.js";

/*
Create spline curve base on CatmullRomCurve3 algorithm
  Each control points in the curve will be attached with an obj helper
  Current problem: the more control points will be created, the more unsmoothy
    the curve will be due to to fixed number of segs in its line mesh
  */
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
    this.spline = new THREE.CatmullRomCurve3(this.positions); // interpolate seg points from control points (positions)
    this.spline.curveType = "catmullrom"; // to control the tension
    let curveGeo = new THREE.BufferGeometry();
    curveGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(Spline.numSegs() * 3), 3)
    );
    // add the mesh to spline obj to easily manage (spline doesn't have mesh natively)
    this.color = "red";
    this.spline.mesh = new THREE.Line(
      curveGeo,
      new THREE.LineBasicMaterial({
        color: this.color,
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

  activateCreatePoint(renderDom, raycaster, camera) {
    let scope = this;
    renderDom.addEventListener("pointerdown", onPointerDown, false);
    function onPointerDown(e) {
      let rect = renderDom.getBoundingClientRect();
      const mouse = {
        x: ((e.clientX - rect.left) / (rect.width - rect.left)) * 2 - 1,
        y: -((e.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1,
      };
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([scope.spline.mesh]);
      if (intersects.length > 0) {
        const intersectPoint = intersects[0].point;
        console.log("intersectPoint:", intersectPoint);
        scope.addControlPoint(intersectPoint);
        // TODO: need to determine the position in spline <31-12-20, Tuan Nguyen Anh> //
      }
    }
  }

  activateHighlight(renderDom, raycaster, camera) {
    let scope = this;
    renderDom.addEventListener("pointermove", onPointerMove, false);
    function onPointerMove(e) {
      let rect = renderDom.getBoundingClientRect();
      const mouse = {
        x: ((e.clientX - rect.left) / (rect.width - rect.left)) * 2 - 1,
        y: -((e.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1,
      };
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([scope.spline.mesh]);
      if (intersects.length > 0) {
        scope.spline.mesh.material.color.set("yellow");
      } else {
        if (scope.spline.mesh.material.color.color != scope.color) {
          scope.spline.mesh.material.color.set(scope.color);
        }
      }
    }
  }

  // Add point by a THREE.vector3, if no arg --> random position
  addControlPoint(vector3, afterPosition) {
    // random if not vector3
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

    // create new obj afterPosition
    let helperObj = this._addHelperObj(vec);
    if (afterPosition) {
      this.splineHelperObjects.splice(afterPosition, 0, helperObj);
      this.positions.splice(afterPosition, 0, helperObj.position);
    } else {
      this.splineHelperObjects.push(helperObj);
      this.positions.push(helperObj.position);
    }

    this.splinePointsLength++;
    this.scene.add(helperObj);
    this._updateSplineOutline();
  }

  // Remove a control point from a Pos; no arg --> last Pos
  removeControlPoint(atPosition) {
    if (this.splinePointsLength <= 2) {
      return;
    }

    let obj;
    if (atPosition) {
      [obj] = this.splineHelperObjects.splice(atPosition, 1);
      this.positions.splice(atPosition, 1);
    } else {
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

// TODO: create name argument for functions <30-12-20, Tuan Nguyen Anh> //
