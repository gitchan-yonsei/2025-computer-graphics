import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const scene = new THREE.Scene();

// 🪐 Camera + OrbitControls
let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, 150);
camera.lookAt(scene.position);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;

const stats = new Stats();
document.body.appendChild(stats.dom);

// 🌞 Sun
const sun = new THREE.Mesh(
    new THREE.SphereGeometry(10, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffff00 })
);
scene.add(sun);

// 🌎 Planet Data
const planetsData = [
    { name: 'Mercury', radius: 1.5, distance: 20, rotationSpeed: 0.02, orbitSpeed: 0.02 },
    { name: 'Venus', radius: 3, distance: 35, rotationSpeed: 0.015, orbitSpeed: 0.015 },
    { name: 'Earth', radius: 3.5, distance: 50, rotationSpeed: 0.01, orbitSpeed: 0.01 },
    { name: 'Mars', radius: 2.5, distance: 65, rotationSpeed: 0.008, orbitSpeed: 0.008 }
];

const textureLoader = new THREE.TextureLoader();
const planets = [];

planetsData.forEach(data => {
    const texture = textureLoader.load(`${data.name}.jpg`);
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.8,
        metalness: 0.2
    });
    const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
    const planet = new THREE.Mesh(geometry, material);
    planet.userData = {
        distance: data.distance,
        angle: Math.random() * Math.PI * 2,
        orbitSpeed: data.orbitSpeed,
        rotationSpeed: data.rotationSpeed
    };
    scene.add(planet);
    planets.push(planet);
});

// 🌟 Light
const light = new THREE.PointLight(0xffffff, 2, 500);
light.position.set(0, 0, 0);
scene.add(light);

// 🛠️ GUI
const gui = new GUI();
const settings = { perspective: true };

gui.add(settings, 'perspective').name('Perspective Mode').onChange(() => {
    if (settings.perspective) {
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 50, 150);
        camera.lookAt(scene.position);
    } else {
        camera = new THREE.OrthographicCamera(
            window.innerWidth / -20, window.innerWidth / 20,
            window.innerHeight / 20, window.innerHeight / -20,
            0.1, 1000
        );
        camera.position.set(0, 50, 150);
        camera.lookAt(scene.position);
    }
    orbitControls.dispose();
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
});

planets.forEach((planet, i) => {
    const folder = gui.addFolder(planetsData[i].name);
    folder.add(planet.userData, 'rotationSpeed', 0, 0.05);
    folder.add(planet.userData, 'orbitSpeed', 0, 0.05);
});

// 🎥 Animation
animate();
function animate() {
    requestAnimationFrame(animate);

    planets.forEach(planet => {
        planet.userData.angle += planet.userData.orbitSpeed;
        planet.position.x = Math.cos(planet.userData.angle) * planet.userData.distance;
        planet.position.z = Math.sin(planet.userData.angle) * planet.userData.distance;
        planet.rotation.y += planet.userData.rotationSpeed;
    });

    orbitControls.update();
    stats.update();
    renderer.render(scene, camera);
}

// 🌟 Responsive
window.addEventListener('resize', () => {
    if (camera.isPerspectiveCamera) {
        camera.aspect = window.innerWidth / window.innerHeight;
    } else {
        camera.left = window.innerWidth / -20;
        camera.right = window.innerWidth / 20;
        camera.top = window.innerHeight / 20;
        camera.bottom = window.innerHeight / -20;
    }
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
