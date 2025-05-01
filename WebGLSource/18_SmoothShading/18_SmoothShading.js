/*--------------------------------------------------------------------------------
18_ConeShading.js

- Viewing a 3D unit cone at origin with perspective projection
- Rotating the cone by ArcBall interface (by left mouse button dragging)
- Keyboard controls:
    - 'a' to switch between camera and model rotation modes in ArcBall interface
    - 'r' to reset arcball
    - 's' to switch to smooth shading
    - 'f' to switch to flat shading
- Applying Diffuse & Specular reflection using Flat/Smooth shading to the cone
----------------------------------------------------------------------------------*/

import { resizeAspectRatio, setupText, updateText } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';
import { Cube } from '../util/cube.js';
import { Arcball } from '../util/arcball.js';
import { Cone } from './Cone.js'; 

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let lampShader;
let textOverlay, textOverlay2, textOverlay3, textOverlay4, textOverlay5, textOverlay6;
let isInitialized = false;

let viewMatrix = mat4.create();
let projMatrix = mat4.create();
let modelMatrix = mat4.create();
let lampModelMatrix = mat4.create();
let arcBallMode = 'CAMERA';
let shadingMode = 'SMOOTH';

const cone = new Cone(gl, 32); // ✅ Cone 객체 생성
const lamp = new Cube(gl);

const cameraPos = vec3.fromValues(0, 0, -3);
const lightPos = vec3.fromValues(1.0, 0.7, 1.0);
const lightSize = vec3.fromValues(0.1, 0.1, 0.1);

const arcball = new Arcball(canvas, 5.0, { rotation: 2.0, zoom: 0.0005 });

document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) return;
    main().then(success => {
        if (!success) console.log('program terminated');
        isInitialized = true;
    }).catch(console.error);
});

function setupKeyboardEvents() {
    document.addEventListener('keydown', (event) => {
        if (event.key == 'a') {
            arcBallMode = arcBallMode === 'CAMERA' ? 'MODEL' : 'CAMERA';
            updateText(textOverlay, "arcball mode: " + arcBallMode);
        } else if (event.key == 'r') {
            arcball.reset();
            modelMatrix = mat4.create();
            arcBallMode = 'CAMERA';
            updateText(textOverlay, "arcball mode: " + arcBallMode);
        } else if (event.key == 's') {
            cone.copyVertexNormalsToNormals?.();  // 선택적 호출 (미구현 시 안전)
            cone.updateNormals?.();
            shadingMode = 'SMOOTH';
            updateText(textOverlay2, "shading mode: " + shadingMode);
            render();
        } else if (event.key == 'f') {
            cone.copyFaceNormalsToNormals?.();
            cone.updateNormals?.();
            shadingMode = 'FLAT';
            updateText(textOverlay2, "shading mode: " + shadingMode);
            render();
        }
    });
}

function initWebGL() {
    if (!gl) {
        console.error('WebGL 2 is not supported.');
        return false;
    }
    canvas.width = 700;
    canvas.height = 700;
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.7, 0.8, 0.9, 1.0);
    return true;
}

async function initShader() {
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    return new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

async function initLampShader() {
    const vertexShaderSource = await readShaderFile('shLampVert.glsl');
    const fragmentShaderSource = await readShaderFile('shLampFrag.glsl');
    return new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

function render() {
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    if (arcBallMode === 'CAMERA') {
        viewMatrix = arcball.getViewMatrix();
    } else {
        modelMatrix = arcball.getModelRotMatrix();
        viewMatrix = arcball.getViewCamDistanceMatrix();
    }

    shader.use();
    shader.setMat4('u_model', modelMatrix);
    shader.setMat4('u_view', viewMatrix);
    shader.setVec3('u_viewPos', cameraPos);
    cone.draw(shader);  // ✅ Cone을 그린다

    lampShader.use();
    lampShader.setMat4('u_view', viewMatrix);
    lamp.draw(lampShader);

    requestAnimationFrame(render);
}

async function main() {
    try {
        if (!initWebGL()) throw new Error('WebGL init failed');

        mat4.translate(viewMatrix, viewMatrix, cameraPos);

        mat4.perspective(
            projMatrix,
            glMatrix.toRadian(60),
            canvas.width / canvas.height,
            0.1,
            100.0
        );

        shader = await initShader();
        lampShader = await initLampShader();

        shader.use();
        shader.setMat4("u_projection", projMatrix);

        shader.setVec3("material.diffuse", vec3.fromValues(1.0, 0.5, 0.31));
        shader.setVec3("material.specular", vec3.fromValues(0.5, 0.5, 0.5));
        shader.setFloat("material.shininess", 16);

        shader.setVec3("light.position", lightPos);
        shader.setVec3("light.ambient", vec3.fromValues(0.2, 0.2, 0.2));
        shader.setVec3("light.diffuse", vec3.fromValues(0.7, 0.7, 0.7));
        shader.setVec3("light.specular", vec3.fromValues(1.0, 1.0, 1.0));
        shader.setVec3("u_viewPos", cameraPos);

        lampShader.use();
        lampShader.setMat4("u_projection", projMatrix);
        mat4.translate(lampModelMatrix, lampModelMatrix, lightPos);
        mat4.scale(lampModelMatrix, lampModelMatrix, lightSize);
        lampShader.setMat4('u_model', lampModelMatrix);

        textOverlay = setupText(canvas, "arcball mode: " + arcBallMode);
        textOverlay2 = setupText(canvas, "shading mode: " + shadingMode, 2);
        textOverlay3 = setupText(canvas, "press 'a' to change arcball mode", 3);
        textOverlay4 = setupText(canvas, "press 'r' to reset arcball", 4);
        textOverlay5 = setupText(canvas, "press 's' to switch to smooth shading", 5);
        textOverlay6 = setupText(canvas, "press 'f' to switch to flat shading", 6);
        setupKeyboardEvents();

        requestAnimationFrame(render);
        return true;
    } catch (error) {
        console.error(error);
        alert('Failed to initialize program');
        return false;
    }
}
