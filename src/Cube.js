class Cube {
  constructor() {
    this.type = "cube";
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
  }

  render() {
    var rgba = this.color;

    // Pass the color of a point to u_fragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // pass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    gl.uniform4f(
      u_FragColor,
      rgba[0] * 0.9,
      rgba[1] * 0.9,
      rgba[2] * 0.9,
      rgba[3]
    );

    // Top face
    drawTriangle3D([0, 0, 0, 1, 1, 0, 1, 0, 0]);
    drawTriangle3D([0, 0, 0, 0, 1, 0, 1, 1, 0]);

    // Front face
    drawTriangle3D([0, 0, 0, 1, 0, 0, 1, 0, -1]);
    drawTriangle3D([0, 0, 0, 1, 0, -1, 0, 0, -1]);

    // Back face
    drawTriangle3D([0, 1, 0, 1, 1, 0, 1, 1, -1]);
    drawTriangle3D([0, 1, 0, 1, 1, -1, 0, 1, -1]);

    // Left face
    drawTriangle3D([0, 0, 0, 0, 0, -1, 0, 1, -1]);
    drawTriangle3D([0, 0, 0, 0, 1, -1, 0, 1, 0]);

    // Right face
    drawTriangle3D([1, 0, 0, 1, 0, -1, 1, 1, -1]);
    drawTriangle3D([1, 0, 0, 1, 1, -1, 1, 1, 0]);

    // Bottom face
    drawTriangle3D([0, 0, -1, 1, 0, -1, 1, 1, -1]);
    drawTriangle3D([0, 0, -1, 1, 1, -1, 0, 1, -1]);
  }
}

function drawCube(matrix) {
  gl.enable(gl.DEPTH_TEST);

  var n = 36; // number of vertices

  const vertices = [
    // Front face
    0, 0, 0, 1, 0, 0, 1, 0, -1,
    0, 0, 0, 1, 0, -1, 0, 0, -1,

    // Back face
    0, 1, 0, 1, 1, 0, 1, 1, -1,
    0, 1, 0, 1, 1, -1, 0, 1, -1,

    // Left face
    0, 0, 0, 0, 0, -1, 0, 1, -1,
    0, 0, 0, 0, 1, -1, 0, 1, 0,

    // Right face
    1, 0, 0, 1, 0, -1, 1, 1, -1,
    1, 0, 0, 1, 1, -1, 1, 1, 0,

    // Top face
    0, 0, 0, 1, 1, 0, 1, 0, 0,
    0, 0, 0, 0, 1, 0, 1, 1, 0,

    // Bottom face
    0, 0, -1, 1, 0, -1, 1, 1, -1,
    0, 0, -1, 1, 1, -1, 0, 1, -1,
  ];

  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("Failed to create the buffer object");
    return;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}
