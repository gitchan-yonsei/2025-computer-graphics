import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const scene = new THREE.Scene();

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

const sun = new THREE.Mesh(
    new THREE.SphereGeometry(10, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffff00 })
);
scene.add(sun);

const planetsData = [
    { name: 'Mercury', radius: 1.5, distance: 20, rotationSpeed: 0.02, orbitSpeed: 0.02, color: '#a6a6a6' },
    { name: 'Venus', radius: 3, distance: 35, rotationSpeed: 0.015, orbitSpeed: 0.015, color: '#e39e1c' },
    { name: 'Earth', radius: 3.5, distance: 50, rotationSpeed: 0.01, orbitSpeed: 0.01, color: '#3498db' },
    { name: 'Mars', radius: 2.5, distance: 65, rotationSpeed: 0.008, orbitSpeed: 0.008, color: '#c0392b' }
];

const textureLoader = new THREE.TextureLoader();
const planets = [];

planetsData.forEach(data => {
    const texture = textureLoader.load(`${data.name}.jpg`);
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        color: new THREE.Color(data.color),
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
const light = new THREE.PointLight(0xffffff, 10000, 0); // distance = 0 → 무한
light.position.set(0, 0, 0);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const gui = new GUI();
const controls = new function () {
    this.currentCamera = "Perspective";
    this.switchCamera = function () {
        const aspect = window.innerWidth / window.innerHeight;
        const distance = 150; // 🌟 perspective camera position z 값과 동일
        const frustumSize = 100; // 🌟 tuning parameter. 50~100 정도 추천
    
        if (camera instanceof THREE.PerspectiveCamera) {
            // ➡ Orthographic으로 변경
            camera = new THREE.OrthographicCamera(
                (frustumSize * aspect) / -2, (frustumSize * aspect) / 2,
                frustumSize / 2, frustumSize / -2,
                0.1, 1000
            );
            camera.position.set(0, 50, distance);
            camera.lookAt(scene.position);
            orbitControls.dispose();
            orbitControls = new OrbitControls(camera, renderer.domElement);
            orbitControls.enableDamping = true;
            this.currentCamera = "Orthographic";
        } else {
            // ➡ Perspective로 변경
            camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
            camera.position.set(0, 50, distance);
            camera.lookAt(scene.position);
            orbitControls.dispose();
            orbitControls = new OrbitControls(camera, renderer.domElement);
            orbitControls.enableDamping = true;
            this.currentCamera = "Perspective";
        }
    };
    
};
const cameraFolder = gui.addFolder('Camera');
cameraFolder.add(controls, 'switchCamera').name('Switch Camera Type');
cameraFolder.add(controls, 'currentCamera').name('Current Camera').listen();

planets.forEach((planet, i) => {
    const folder = gui.addFolder(planetsData[i].name);
    folder.add(planet.userData, 'rotationSpeed', 0, 0.05).name('Rotation Speed');
    folder.add(planet.userData, 'orbitSpeed', 0, 0.05).name('Orbit Speed');
});

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
