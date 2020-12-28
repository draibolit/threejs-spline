import * as THREE from "three";

// Create a arrow helper to show the normal direction of a mesh
class ArrPointer {
  constructor(params) {
    this.objs = new Array(); // objs to raycast

    let color = 0xf9002d;
    // let linewidth = 15;
    if (params.color) {
      color = params.color;
    }
    if (params.linewidth) {
      linewidth = params.linewidth;
    }

    this.arrowLength = 2;
    this.arrowHelper = new CustomArrow(
      new THREE.Vector3(),
      new THREE.Vector3(),
      this.arrowLength,
      color,
      "blue",
      8,
      0.5,
      0.5
    );
  }

  // Let the arrpointer follow obj within its this.objs
  follow(renderer, camera, raycaster) {
    let mulRatio = new THREE.Vector3(
      this.arrowLength,
      this.arrowLength,
      this.arrowLength
    );

    function enableArrPointer(e) {
      let rect = renderer.domElement.getBoundingClientRect();
      const mouse = {
        x: ((e.clientX - rect.left) / (rect.width - rect.left)) * 2 - 1,
        y: -((e.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1,
      };

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(this.objs, false);
      if (intersects.length > 0) {
        let n = intersects[0].face.normal.clone();
        n.transformDirection(intersects[0].object.matrixWorld);
        let vecDir = n.clone().negate();
        let vecPos = intersects[0].point.add(n.multiply(mulRatio));
        this.arrowHelper.setDirection(vecDir);
        this.arrowHelper.position.copy(vecPos);
      }
    }

    renderer.domElement.addEventListener(
      "mousemove",
      enableArrPointer.bind(this),
      false
    );
  }

  // Add mesh obj to this.objs to follow
  add(obj) {
    this.objs.push(obj);
    this.arrowHelper.visible = true;
  }

  // Remove obj from the list
  remove(obj) {
    let idx = this.objs.indexOf(obj);
    if (idx > -1) {
      this.objs.splice(idx, 1);
    }
    if (this.objs.length === 0) {
      this.arrowHelper.visible = false;
    }
  }
}

// Adapted from https://stackoverflow.com/questions/63776448/threejs-applying-edge-geometry-to-arrowhelper
class CustomArrow extends THREE.Object3D {
  constructor(
    dir,
    origin,
    length,
    color,
    edgeColor,
    linewidth,
    headLength,
    headWidth
  ) {
    super();
    // dir is assumed to be normalized

    this.type = "CustomArrow";

    if (dir === undefined) dir = new THREE.Vector3(0, 0, 1);
    if (origin === undefined) origin = new THREE.Vector3(0, 0, 0);
    if (length === undefined) length = 1;
    if (color === undefined) color = 0xffff00;
    if (linewidth == undefined) linewidth = 8;
    if (headLength === undefined) headLength = 0.2 * length;
    if (headWidth === undefined) headWidth = 0.2 * headLength;

    if (this._lineGeometry === undefined) {
      this._lineGeometry = new THREE.BufferGeometry();
      this._lineGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute([0, 0, 0, 0, 1, 0], 3)
      );
      this._coneGeometry = new THREE.ConeBufferGeometry(0.5, 1, 6);
      this._coneGeometry.translate(0, -0.5, 0);
      this._axis = new THREE.Vector3();
    }

    this.position.copy(origin);

    this.line = new THREE.Line(
      this._lineGeometry,
      new THREE.LineBasicMaterial({
        color: color,
        toneMapped: false,
        linewidth: linewidth,
      })
    );
    this.line.matrixAutoUpdate = false;
    this.add(this.line);

    // base material
    this.cone = new THREE.Mesh(
      this._coneGeometry,
      new THREE.MeshBasicMaterial({ color: color, toneMapped: false })
    );
    this.add(this.cone);

    // wire frame
    this.wireframe = new THREE.Mesh(
      this._coneGeometry,
      new THREE.MeshBasicMaterial({
        color: edgeColor,
        toneMapped: false,
        wireframe: true,
        wireframeLinewidth: 2,
      })
    );
    this.add(this.wireframe);

    this.setDirection(dir);
    this.setLength(length, headLength, headWidth);
  }

  setDirection(dir) {
    // dir is assumed to be normalized

    if (dir.y > 0.99999) {
      this.quaternion.set(0, 0, 0, 1);
    } else if (dir.y < -0.99999) {
      this.quaternion.set(1, 0, 0, 0);
    } else {
      this._axis.set(dir.z, 0, -dir.x).normalize();

      const radians = Math.acos(dir.y);

      this.quaternion.setFromAxisAngle(this._axis, radians);
    }
  }

  setLength(length, headLength, headWidth) {
    if (headLength === undefined) headLength = 0.2 * length;
    if (headWidth === undefined) headWidth = 0.2 * headLength;

    this.line.scale.set(1, Math.max(0.0001, length - headLength), 1); // see #17458
    this.line.updateMatrix();

    this.cone.scale.set(headWidth, headLength, headWidth);
    this.cone.position.y = length;
    this.cone.updateMatrix();

    this.wireframe.scale.set(headWidth, headLength, headWidth);
    this.wireframe.position.y = length;
    this.wireframe.updateMatrix();
  }

  setColor(color) {
    this.line.material.color.set(color);
    // this.cone.material.color.set( color );
    // this.wireframe.material.color.set( color );
  }

  copy(source) {
    super.copy(source, false);
    this.line.copy(source.line);
    this.cone.copy(source.cone);
    this.wireframe.copy(source.wireframe);
    return this;
  }
}


export { ArrPointer };
