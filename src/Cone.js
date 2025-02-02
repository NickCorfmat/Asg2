// Cone implementation created with the help of ChatGPT.
// Conversation: https://chatgpt.com/share/679ef67c-d10c-8013-a404-e035d012db19

class Cone {
  constructor() {
    this.type = "cone";
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.height = 1.0;
    this.radius = 1.0;
    this.slices = 12;
  }

  render() {
    var rgba = this.color;

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    this.drawBase();
    this.drawSides();
  }

  drawBase() {
    let vertices = [];
    let angleStep = (2 * Math.PI) / this.slices;

    let center = [0, 0, 0];
    for (let i = 0; i < this.slices; i++) {
      let angle = i * angleStep;
      let x = this.radius * Math.cos(angle);
      let z = this.radius * Math.sin(angle);
      let nextAngle = (i + 1) % this.slices;
      let xNext = this.radius * Math.cos(nextAngle * angleStep);
      let zNext = this.radius * Math.sin(nextAngle * angleStep);

      vertices.push(center[0], center[1], center[2]);
      vertices.push(x, 0, z);
      vertices.push(xNext, 0, zNext);
    }

    this.drawTriangle3D(vertices);
  }

  drawSides() {
    let vertices = [];
    let angleStep = (2 * Math.PI) / this.slices;

    let apex = [0, this.height, 0];

    for (let i = 0; i < this.slices; i++) {
      let angle = i * angleStep;
      let x = this.radius * Math.cos(angle);
      let z = this.radius * Math.sin(angle);
      let nextAngle = (i + 1) % this.slices;
      let xNext = this.radius * Math.cos(nextAngle * angleStep);
      let zNext = this.radius * Math.sin(nextAngle * angleStep);

      vertices.push(x, 0, z);
      vertices.push(xNext, 0, zNext);
      vertices.push(apex[0], apex[1], apex[2]);
    }

    this.drawTriangle3D(vertices);
  }

  drawTriangle3D(vertices) {
    var n = vertices.length / 3;

    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log("Failed to create the buffer object");
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n);
  }
}
