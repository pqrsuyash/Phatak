import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 10, 15);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;
camera.position.y = 2;
camera.position.x = 5;
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const loader = new GLTFLoader();

const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

const dLight = new THREE.DirectionalLight(0xffffff, 2);
// const dLightG = new THREE.DirectionalLightHelper(dLight, 1);
scene.add(dLight);
// scene.add(dLightG);
dLight.position.z = 4;
dLight.position.y = 1;
dLight.position.x = 0;
dLight.rotation.x = Math.PI / 3;

// *******************************************************
let phataks;
let rail;
let engine;
let boogey;
let plank;
let engineStartPos = -6;
loader.load(
  "Models.glb",
  function (gltf) {
    // console.log(gltf);
    phataks = gltf.scene.children[0];
    plank = gltf.scene.children[4];
    // plank.rotation.y = -Math.PI; // CLOSED
    plank.rotation.y = -Math.PI / 3; // OPENED
    boogey = gltf.scene.children[3];
    boogey.position.set(0, 1, 0);
    rail = gltf.scene.children[1];
    engine = gltf.scene.children[2];
    engine.position.set(engineStartPos, 1, 0);
    scene.add(engine);
    scene.add(phataks);
    scene.add(plank);
    scene.add(rail);

    for (let i = 1; i <= 5; i++) {
      let rail2 = rail.clone();
      rail2.position.x -= i * 2.67;
      scene.add(rail2);
    }

    for (let i = 1; i <= 5; i++) {
      let rail2 = rail.clone();
      rail2.position.x += i * 2.67;
      scene.add(rail2);
    }
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// ********************************************
let StartedPlaying = false;

let BoggiesNumEL = document.getElementById("BoggiesNum");
let speedEL = document.getElementById("speed");
let playEL = document.getElementById("play");
let timeEl = document.getElementById("time");
const length = 20;
let speed;
let num;
let Boogies = new Array();
let totalDis;
let time;

//  for audio ****************************
const listener = new THREE.AudioListener();
camera.add(listener);

// Step 2: Create a global audio source
const sound = new THREE.Audio(listener);

// Step 3: Load a sound and set it as the audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load('sound.mp3', function(buffer) {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.5);
});




playEL.addEventListener("click", function () {
  // 4
  if (boogey) {
    // Get the speed and number of boogies from the input elements
    speed = speedEL.value;
    num = parseInt(BoggiesNumEL.value); // Ensure num is an integer
    totalDis = 2 + 2 * num + 4;
    time = totalDis / speed;
    console.log(time, "sec");
    engine.position.x = engineStartPos;
    // Clear existing boogies from the scene
    while (Boogies.length > 0) {
      let boogie = Boogies.pop();
      scene.remove(boogie);
    }

    // Position for the new boogies
    let pos = engineStartPos - 2;

    // Add the specified number of boogies
    for (let i = 0; i < num; i++) {
      let newBoogie = boogey.clone(); // Clone the boogey object
      newBoogie.position.x = pos;
      pos -= 2; // Update the position for the next boogie
      scene.add(newBoogie); // Add the new boogie to the scene
      Boogies.push(newBoogie); // Add the new boogie to the Boogies array
    }
    StartedPlaying = true;
  }
});

// ********************************************

let unitTime;

function animate() {
  if (time >= 0) {
    timeEl.innerHTML = "Time left: " + Math.round(time);
  }

  if (StartedPlaying) {
    if (!sound.isPlaying) {
      sound.play();
    }
    if(Boogies[Boogies.length - 1].position.x   >= num){
      sound.stop();
    }
    engine.position.x += 0.01 * speed;
    unitTime = 0.01;

    for (let boogie of Boogies) {
      boogie.position.x += 0.01 * speed;
    }
    if (Boogies[Boogies.length - 1].position.x >= 2) {
      openPhatakAnimation();
    }
    if (engine.position.x >= -2) {
      closePhatakAnimation();
      if (time >= 0) {
        time = time - unitTime;
      }
    }
  }
  renderer.render(scene, camera);
}

function openPhatakAnimation() {
  if (plank && plank.rotation.y <= -Math.PI / 3) {
    plank.rotation.y += 0.03;
  }
}
function closePhatakAnimation() {
  if (
    plank &&
    plank.rotation.y >= -Math.PI &&
    Boogies[Boogies.length - 1].position.x <= 2
  ) {
    plank.rotation.y -= 0.03;
  }
}
