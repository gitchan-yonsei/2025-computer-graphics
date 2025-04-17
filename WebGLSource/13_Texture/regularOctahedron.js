export class RegularOctahedron {
    constructor(gl) {
        this.gl = gl;
        this.initBuffers();
    }

    initBuffers() {
        const gl = this.gl;

        const h = Math.SQRT1_2;  // == 1 / sqrt(2) ≈ 0.7071

        const vertices = new Float32Array([
            0.0,  h,  0.0,  // 0: top
            0.0, -h,  0.0,  // 1: bottom
            -0.5,  0.0,  0.5, // 2
             0.5,  0.0,  0.5, // 3
             0.5,  0.0, -0.5, // 4
            -0.5,  0.0, -0.5  // 5
        ]);

        const indices = new Uint16Array([
            0, 2, 3,  // top - front
            0, 3, 4,  // top - right
            0, 4, 5,  // top - back
            0, 5, 2,  // top - left
            1, 3, 2,  // bottom - front
            1, 4, 3,  // bottom - right
            1, 5, 4,  // bottom - back
            1, 2, 5   // bottom - left
        ]);

        // texture 좌표 4x2 분할에 맞춰 8개 삼각형 각각 다르게 설정
        const texCoords = new Float32Array([
            // --- 위쪽 4면 (v: 0.5 ~ 1.0) ---

            // face 0 (top - front)
            0.125, 1.0,   // top
            0.0,   0.5,
            0.25,  0.5,

            // face 1 (top - right)
            0.375, 1.0,
            0.25,  0.5,
            0.5,   0.5,

            // face 2 (top - back)
            0.625, 1.0,
            0.5,   0.5,
            0.75,  0.5,

            // face 3 (top - left)
            0.875, 1.0,
            0.75,  0.5,
            1.0,   0.5,

            // --- 아래쪽 4면 (v: 0.0 ~ 0.5) ---

            // face 4 (bottom - front)
            0.125, 0.5,   // bottom
            0.0,   0.0,
            0.25,  0.0,

            // face 5 (bottom - right)
            0.375, 0.5,
            0.25,  0.0,
            0.5,   0.0,

            // face 6 (bottom - back)
            0.625, 0.5,
            0.5,   0.0,
            0.75,  0.0,

            // face 7 (bottom - left)
            0.875, 0.5,
            0.75,  0.0,
            1.0,   0.0,
        ]);

        // 정점 위치를 face 별로 펼쳐서 재구성
        const expandedVertices = [];
        for (let i = 0; i < indices.length; i++) {
            const vi = indices[i];
            expandedVertices.push(vertices[vi * 3], vertices[vi * 3 + 1], vertices[vi * 3 + 2]);
        }

        this.vertexCount = indices.length;

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        // vertex position
        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(expandedVertices), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        // texture coordinates
        this.tbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.tbo);
        gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

        gl.bindVertexArray(null);
    }

    draw(shader) {
        const gl = this.gl;
        shader.use();
        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
        gl.bindVertexArray(null);
    }
}
