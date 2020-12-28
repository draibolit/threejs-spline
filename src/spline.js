
import * as THREE from "three";

const geometry = new THREE.BoxBufferGeometry( 20, 20, 20 );

function addSplineObject( position ) {
  const material = new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } );
  const object = new THREE.Mesh( geometry, material );
  if ( position ) {
    object.position.copy( position );
  } else {
    object.position.x = Math.random() * 1000 - 500;
    object.position.y = Math.random() * 600;
    object.position.z = Math.random() * 800 - 400;
  }
  object.castShadow = true;
  object.receiveShadow = true;
  // scene.add( object );
  // splineHelperObjects.push( object );
  return object;
}

export { addSplineObject};
