export class Cone {
    constructor(gl, numSlices = 32, height = 1.0, radius = 0.5) {
        this.gl = gl;
        this.numSlices = numSlices;
        this.height = height;
        this.radius = radius;

        this.initBuffers();
    }

    initBuffers() {
        const positions = [];
        const normals = [];
        const indices = [];

        const angleStep = (2 * Math.PI) / this.numSlices;
        const apex = [0, this.height / 2, 0];
        const baseY = -this.height / 2;

        // Apex vertex
        positions.push(...apex);
        normals.push(0, 1, 0); // placeholder

        for (let i = 0; i <= this.numSlices; i++) {
            const theta = i * angleStep;
            const x = this.radius * Math.cos(theta);
            const z = this.radius * Math.sin(theta);
            positions.push(x, baseY, z);

            // approximate normal for side
            const nx = x;
            const ny = this.radius / this.height;
            const nz = z;
            const len = Math.hypot(nx, ny, nz);
            normals.push(nx / len, ny / len, nz / len);
        }

        for (let i = 1; i <= this.numSlices; i++) {
            indices.push(0, i, i + 1);
        }

        this.positionBuffer = this.createBuffer(positions, this.gl.ARRAY_BUFFER, Float32Array);
        this.normalBuffer = this.createBuffer(normals, this.gl.ARRAY_BUFFER, Float32Array);
        this.indexBuffer = this.createBuffer(indices, this.gl.ELEMENT_ARRAY_BUFFER, Uint16Array);
        this.indexCount = indices.length;
    }

    createBuffer(data, target, Type) {
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(target, buffer);
        this.gl.bufferData(target, new Type(data), this.gl.STATIC_DRAW);
        return buffer;
    }

    draw(shader) {
        const gl = this.gl;

        // a_position (location = 0)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        // a_normal (location = 1)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
    }

    // smooth shading
    copyVertexNormalsToNormals() { 
        const vertexCount = this.positions.length / 3;
        const newNormals = Array(vertexCount).fill(0).map(() => [0, 0, 0]);
    
        // 각 face의 법선을 계산하고, 각 vertex에 누적
        for (let i = 0; i < this.indices.length; i += 3) {
            const i0 = this.indices[i];
            const i1 = this.indices[i + 1];
            const i2 = this.indices[i + 2];
    
            const v0 = this.positions.slice(i0 * 3, i0 * 3 + 3);
            const v1 = this.positions.slice(i1 * 3, i1 * 3 + 3);
            const v2 = this.positions.slice(i2 * 3, i2 * 3 + 3);
    
            const edge1 = v1.map((v, idx) => v - v0[idx]);
            const edge2 = v2.map((v, idx) => v - v0[idx]);
            const n = this.cross(edge1, edge2);
            const norm = this.normalize(n);
    
            [i0, i1, i2].forEach(i => {
                newNormals[i][0] += norm[0];
                newNormals[i][1] += norm[1];
                newNormals[i][2] += norm[2];
            });
        }
    
        // 정규화
        const flatNormals = [];
        newNormals.forEach(n => {
            const norm = this.normalize(n);
            flatNormals.push(...norm);
        });
    
        this.normals = flatNormals;
    }

    // flat shading
    copyFaceNormalsToNormals() {
        const newNormals = Array(this.positions.length).fill(0);
    
        for (let i = 0; i < this.indices.length; i += 3) {
            const i0 = this.indices[i];
            const i1 = this.indices[i + 1];
            const i2 = this.indices[i + 2];
    
            const v0 = this.positions.slice(i0 * 3, i0 * 3 + 3);
            const v1 = this.positions.slice(i1 * 3, i1 * 3 + 3);
            const v2 = this.positions.slice(i2 * 3, i2 * 3 + 3);
    
            const edge1 = v1.map((v, idx) => v - v0[idx]);
            const edge2 = v2.map((v, idx) => v - v0[idx]);
            const n = this.cross(edge1, edge2);
            const norm = this.normalize(n);
    
            for (let j = 0; j < 3; j++) {
                newNormals[i0 * 3 + j] = norm[j];
                newNormals[i1 * 3 + j] = norm[j];
                newNormals[i2 * 3 + j] = norm[j];
            }
        }
    
        this.normals = newNormals;
    }
    
    updateNormals() {
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
    }    

    cross(a, b) {
        return [
            a[1]*b[2] - a[2]*b[1],
            a[2]*b[0] - a[0]*b[2],
            a[0]*b[1] - a[1]*b[0]
        ];
    }

    normalize(v) {
        const len = Math.hypot(...v);
        return len > 0 ? v.map(x => x / len) : [0, 0, 0];
    }
}
