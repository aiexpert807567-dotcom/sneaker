import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const stage = document.querySelector('.stage');
const canvas = document.querySelector('#sneaker-canvas');
const loaderBadge = document.querySelector('#loader');

const scene = new THREE.Scene();
scene.background = new THREE.Color('#08090d');
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(0, 1.25, 6);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

const controls = new OrbitControls(camera, canvas);
controls.enablePan = false;
controls.enableZoom = false;
controls.minPolarAngle = 1.05;
controls.maxPolarAngle = 1.95;
controls.enableDamping = true;

scene.add(new THREE.HemisphereLight('#ffffff', '#2f3560', 2.2));
const keyLight = new THREE.SpotLight('#ffffff', 42, 12, 0.42, 0.8);
keyLight.position.set(5, 7, 6);
keyLight.castShadow = true;
scene.add(keyLight);
const cyanLight = new THREE.PointLight('#69f7ff', 6, 10);
cyanLight.position.set(-4, 1, -3);
scene.add(cyanLight);

const floor = new THREE.Mesh(new THREE.CircleGeometry(3.2, 96), new THREE.MeshBasicMaterial({ color: '#1be7ff', transparent: true, opacity: 0.11 }));
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.7;
scene.add(floor);

let sneaker;
new GLTFLoader().load('/models/scene-optimized.glb', (gltf) => {
  sneaker = gltf.scene;
  const box = new THREE.Box3().setFromObject(sneaker);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  sneaker.position.sub(center);
  sneaker.scale.multiplyScalar(3.1 / Math.max(size.x, size.y, size.z));
  sneaker.position.y = -0.55;
  sneaker.rotation.set(0.08, -0.55, 0);
  sneaker.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.material.envMapIntensity = 1.4;
    }
  });
  scene.add(sneaker);
  loaderBadge.hidden = true;
});

function resize() {
  const { width, height } = stage.getBoundingClientRect();
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

window.addEventListener('resize', resize);
resize();

function animate(time) {
  requestAnimationFrame(animate);
  if (sneaker) {
    sneaker.rotation.y = -0.55 + Math.sin(time * 0.00045) * 0.12;
    sneaker.position.y = -0.55 + Math.sin(time * 0.0012) * 0.035;
  }
  floor.scale.setScalar(1 + Math.sin(time * 0.001) * 0.025);
  controls.update();
  renderer.render(scene, camera);
}
animate(0);
