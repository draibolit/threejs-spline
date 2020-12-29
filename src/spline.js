import * as THREE from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { GUI } from "three/examples/jsm/libs/dat.gui.module.js";

class Spline {
  constructor(scene, new_positions) {
    this.splinePointsLength = new_positions.length;
    this.positions = []; // save the common vecs of objs and spline
    this.point = new THREE.Vector3();

    this.scene = scene;

    // Helper objs: initialize with zero coords, and save its positions
    this.splineHelperObjects = [];
    for (let i = 0; i < this.splinePointsLength; i++) {
      let obj = this.addSplineObject(null);
      this.positions.push(obj.position); // will be referenced by spline
      this.splineHelperObjects.push(obj);
    }

    // Spline: initialize spline with no coords
    let curveGeo = new THREE.BufferGeometry();
    curveGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(Spline.numSegs() * 3), 3)
    );
    this.spline = new THREE.CatmullRomCurve3(this.positions);
    this.spline.mesh = new THREE.Line(
      curveGeo.clone(),
      new THREE.LineBasicMaterial({
        color: 0xff0000,
        opacity: 0.35,
      })
    );

    for (let i = 0; i < this.positions.length; i++) {
      this.positions[i].copy(new_positions[i]);
    }
    this.updateSplineOutline();

    this.scene.add(...this.splineHelperObjects);
    this.scene.add(this.spline.mesh);

    // Gui
    // let scope = this;
    // const params = {
    //   uniform: true,
    //   tension: 0.5,
    //   addPoint: scope.addPoint.bind(scope),
    //   removePoint: scope.removePoint.bind(scope),
    // };
    // const gui = new GUI();
    // gui.add(params, "uniform");
    // gui
    //   .add(params, "tension", 0, 1)
    //   .step(0.01)
    //   .onChange(function (value) {
    //     spline.tension = value;
    //     updateSplineOutline();
    //   });
    // gui.add(params, "addPoint");
    // gui.add(params, "removePoint");
    // gui.open();

  }

  static boxGeo(){
     return new THREE.BoxBufferGeometry(20, 20, 20);
  }
  static numSegs(){ return 200;}

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
      scope.updateSplineOutline();
    });
  }

  addSplineObject(position) {
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

  // add point by a THREE.vector3
  // TODO: need to add a point in the middle <29-12-20, Tuan Nguyen Anh> //
  addPoint(vector3) {
    this.splinePointsLength++;
    let obj = this.addSplineObject(vector3);
    this.splineHelperObjects.push(obj);
    this.scene.add(obj);
    this.positions.push(obj.position);
    this.updateSplineOutline();
  }

  removePoint() {
    if (this.splinePointsLength <= 4) {
      return;
    }
    const point = this.splineHelperObjects.pop();
    this.splinePointsLength--;
    this.positions.pop();
    if (this.transformControl.object === point) this.transformControl.detach();
    this.scene.remove(point);
    this.updateSplineOutline();
  }

  updateSplineOutline() {
    const position = this.spline.mesh.geometry.attributes.position;
    for (let i = 0; i < Spline.numSegs(); i++) {
      const t = i / (Spline.numSegs() - 1);
      this.spline.getPoint(t, this.point);
      position.setXYZ(i, this.point.x, this.point.y, this.point.z);
    }
    position.needsUpdate = true;
  }
}

export { Spline };
