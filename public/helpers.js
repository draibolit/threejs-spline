import * as THREE from "three";

function initLight() {
  let lights = new Array();

  let light1 = new THREE.DirectionalLight(0xffffff, 0.5);
  light1.position.set(1000, 1000, 1000);
  let light2 = new THREE.DirectionalLight(0xffffff, 0.4);
  light2.position.set(1000, -1000, 1000);
  let light3 = new THREE.DirectionalLight(0xffffff, 0.5);
  light3.position.set(1000, 1000, -1000);
  let light4 = new THREE.DirectionalLight(0xffffff, 0.4);
  light4.position.set(-1000, 1000, -1000);
  // White directional light from the top. (y dir)
  let light5 = new THREE.DirectionalLight(0xffffff, 0.05);
  light5.position.set(0, 1000, 0);
  // AmbientLight: soft white light
  let light6 = new THREE.AmbientLight(0x404040, 0.5);

  if (light1){lights.push(light1)}
  if (light2){lights.push(light2)}
  if (light3){lights.push(light3)}
  if (light4){lights.push(light4)}
  if (light5){lights.push(light5)}
  if (light6){lights.push(light6)}

  let intensityRatio = 0.9;
  lights.forEach((light) => {
    light.intensity = intensityRatio * light.intensity;
  });

  return lights;
}

export  { initLight };
