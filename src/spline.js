import * as THREE from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { GUI } from "three/examples/jsm/libs/dat.gui.module.js";

class Spline {
  constructor(scene, new_positions) {
    this.boxGeo = new THREE.BoxBufferGeometry(20, 20, 20); //const
    this.splineHelperObjects = [];
    this.splinePointsLength = 4; //const
    this.positions = [];
    this.point = new THREE.Vector3();
    this.ARC_SEGMENTS = 200; //const

    this.scene = scene;

    for (let i = 0; i < this.splinePointsLength; i++) {
      let obj = this.addSplineObject(this.positions[i]);
      this.splineHelperObjects.push(obj);
      scene.add(obj);
    }

    for (let i = 0; i < this.splinePointsLength; i++) {
      this.positions.push(this.splineHelperObjects[i].position);
    }

    let curveGeo = new THREE.BufferGeometry();
    curveGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(this.ARC_SEGMENTS * 3), 3)
    );

    let scope = this;
    // Gui
    const params = {
      uniform: true,
      tension: 0.5,
      addPoint: scope.addPoint.bind(scope),
      removePoint: scope.removePoint.bind(scope),
    };

    const gui = new GUI();
    gui.add(params, "uniform");
    gui
      .add(params, "tension", 0, 1)
      .step(0.01)
      .onChange(function (value) {
        spline.tension = value;
        updateSplineOutline();
      });
    gui.add(params, "addPoint");
    gui.add(params, "removePoint");
    gui.open();

    this.spline = new THREE.CatmullRomCurve3(this.positions);
    this.spline.mesh = new THREE.Line(
      curveGeo.clone(),
      new THREE.LineBasicMaterial({
        color: 0xff0000,
        opacity: 0.35,
      })
    );
    this.scene.add(this.spline.mesh);

    this.load(new_positions);
  }

  load(new_positions) {
    while (new_positions.length > this.positions.length) {
      this.addPoint();
    }
    while (new_positions.length < this.positions.length) {
      this.removePoint();
    }
    for (let i = 0; i < this.positions.length; i++) {
      this.positions[i].copy(new_positions[i]);
    }
    this.updateSplineOutline();
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
      scope.updateSplineOutline();
    });
  }

  addSplineObject(position) {
    const material = new THREE.MeshLambertMaterial({
      color: Math.random() * 0xffffff,
    });
    const object = new THREE.Mesh(this.boxGeo, material);
    if (position) {
      object.position.copy(position);
    } else {
      object.position.x = Math.random() * 1000 - 500;
      object.position.y = Math.random() * 600;
      object.position.z = Math.random() * 800 - 400;
    }
    object.castShadow = true;
    object.receiveShadow = true;
    return object;
  }

  addPoint() {
    this.splinePointsLength++;
    let obj = this.addSplineObject();
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
    for (let i = 0; i < this.ARC_SEGMENTS; i++) {
      const t = i / (this.ARC_SEGMENTS - 1);
      this.spline.getPoint(t, this.point);
      position.setXYZ(i, this.point.x, this.point.y, this.point.z);
    }
    position.needsUpdate = true;
  }
}

export { Spline };
