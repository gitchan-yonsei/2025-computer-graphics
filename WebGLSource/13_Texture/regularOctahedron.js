export class RegularOctahedron {
    constructor(gl) {
        this.gl = gl;
        this.initBuffers();
    }

    initBuffers() {
        const gl = this.gl;

        // 정팔면체 정점: edge 길이 1, 중심 정사각형 xz 평면
        const vertices = new Float32Array([
            0.0,  1.0,  0.0,  // 0: top
            0.0, -1.0,  0.0,  // 1: bottom
            -0.5,  0.0,  0.5, // 2: front-left
             0.5,  0.0,  0.5, // 3: front-right
             0.5,  0.0, -0.5, // 4: back-right
            -0.5,  0.0, -0.5  // 5: back-left
        ]);

        // 각 삼각형 face의 정점 인덱스
        const indices = new Uint16Array([
            0, 2, 3,
            0, 3, 4,
            0, 4, 5,
            0, 5, 2,
            1, 3, 2,
            1, 4, 3,
            1, 5, 4,
            1, 2, 5
        ]);

        // 8개의 삼각형 면마다 서로 다른 텍스처 좌표 할당 (4x2로 나눈 이미지 기준)
        const texCoords = new Float32Array([
            // face 0 (0,0) ~ (1/4, 1/2)
            0.125, 0.5,
            0.0,   1.0,
            0.25,  1.0,

            // face 1 (1/4,0) ~ (2/4, 1/2)
            0.375, 0.5,
            0.25,  1.0,
            0.5,   1.0,

            // face 2 (2/4,0) ~ (3/4, 1/2)
            0.625, 0.5,
            0.5,   1.0,
            0.75,  1.0,

            // face 3 (3/4,0) ~ (4/4, 1/2)
            0.875, 0.5,
            0.75,  1.0,
            1.0,   1.0,

            // face 4 (0, 1/2) ~ (1/4, 1.0)
            0.125, 0.0,
            0.0,   0.5,
            0.25,  0.5,

            // face 5 (1/4,1/2) ~ (2/4, 1.0)
            0.375, 0.0,
            0.25,  0.5,
            0.5,   0.5,

            // face 6 (2/4,1/2) ~ (3/4, 1.0)
            0.625, 0.0,
            0.5,   0.5,
            0.75,  0.5,

            // face 7 (3/4,1/2) ~ (4/4, 1.0)
            0.875, 0.0,
            0.75,  0.5,
            1.0,   0.5,
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
