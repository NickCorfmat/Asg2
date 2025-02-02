// Nick Corfmat
// ncorfmat@ucsc.edu

// Vertex shader program
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    void main() {
        gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    }`;

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
    }`;

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedSegments = 10;
let g_selectedType = POINT;
let g_globalAngle = 0;

let g_torsoAngle = 0;

let u_ModelMatrix;
let u_GlobalRotateMatrix;

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById("webgl");

  // Retrieve WebGl rendering context
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log("Failed to get WebGL context.");
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders (compile + install shaders)
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to initialize shaders.");
    return;
  }

  // Get the storage location of a_Position variable
  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position.");
    return;
  }

  // Get the storage location of u_FragColor variable
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (!u_FragColor) {
    console.log("Failed to get the storage location of u_FragColor.");
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(
    gl.program,
    "u_GlobalRotateMatrix"
  );
  if (!u_GlobalRotateMatrix) {
    console.log("Failed to get the storage location of u_GlobalRotateMatrix.");
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (!u_ModelMatrix) {
    console.log("Failed to get the storage location of u_ModelMatrix");
    return;
  }

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {
  document
    .getElementById("torsoSlider")
    .addEventListener("mousemove", function () {
      g_torsoAngle = this.value;
      renderScene();
    });

  // Angle slider
  document
    .getElementById("angleSlider")
    .addEventListener("mousemove", function () {
      g_globalAngle = this.value;
      renderScene();
    });

  // Click and drag to rotate
  let isDragging = false;
  let lastX = 0;

  canvas.addEventListener("mousedown", (ev) => {
    if (ev.button === 0) {
      isDragging = true;
      lastX = ev.clientX;
    }
  });

  document.addEventListener("mousemove", (ev) => {
    if (isDragging) {
      let deltaX = ev.clientX - lastX;
      g_globalAngle -= deltaX * 0.5;
      lastX = ev.clientX;
      renderScene();
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
}

function main() {
  // Set up canvas and gl variables
  setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // Set up action for the HTML UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = handleClicks;
  canvas.onmousemove = function (ev) {
    if (ev.buttons == 1) {
      handleClicks(ev);
    }
  };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Render
  requestAnimationFrame(tick);
}

function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  updateAnimationAngles();
  renderScene();
  requestAnimationFrame(tick);
}

// Update the angles of everything if currently animated
function updateAnimationAngles() {
  
}

function handleClicks(ev) {
  // Extract the event click and return it in WebGL coordinates
  let [x, y] = convertCoordinatesEventToGL(ev);

  // Create and store the new point
  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = g_selectedSegments;
  }

  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;

  // Draw every shape that is supposed to be in the canvas
  renderScene();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX;
  var y = ev.clientY;
  var rect = ev.target.getBoundingClientRect();

  x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}

function renderScene() {
  // Check the time at the start of this function
  var startTime = performance.now();

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let M = new Matrix4();
  let color = [0.9, 0.9, 0.9, 1.0];
  let animalSkinColor = [0.427, 0.765, 0.91, 1];

  // let c = new Cube();
  // c.matrix.setTranslate(-0.5, 0, 0.5)
  // c.render();

  // hips
  M.setTranslate(-0.15, -0.2, 0.15);
  M.rotate(20, -1, 1, 0);
  M.scale(0.35, 0.15, 0.35);
  let hipCoords = new Matrix4(M);
  drawCube(M, color);

  // torso
  color = animalSkinColor;
  M = hipCoords;
  M.scale(0.9, 2, 0.9);
  M.rotate(g_torsoAngle, -1, 0, 0)
  M.translate(0.05, 0.3, -0.05);
  drawCube(M, color);

  // // left arm
  // M.setIdentity();
  // M.translate(0.31, -0.19, -0.19);
  // M.rotate(40, -1, 1, 0);
  // M.rotate(5, 0, -1, 1);
  // M.scale(0.08, 0.31, 0.08);
  // drawCube(M, color);

  // // right arm
  // M.setIdentity();
  // M.translate(-0.06, -0.19, -0.1);
  // M.rotate(40, -1, 1, 0);
  // M.rotate(-5, 0, -1, 1);
  // M.scale(0.08, 0.31, 0.08);
  // drawCube(M, color);

  // // neck
  // M.setIdentity();
  // M.translate(0.045, 0.1, -0.185);
  // M.rotate(20, -1, 1, 0);
  // M.scale(0.2, 0.2, 0.2);
  // drawCube(M, color);

  // // head
  // M.setIdentity();
  // M.translate(-0.03, 0.18, -0.1);
  // M.rotate(15, 0, 1, 0);
  // M.rotate(-5, 1, 0, 0);
  // M.scale(0.4, 0.24, 0.4);
  // drawCube(M, color);

  // // nose
  // M.setIdentity();
  // M.translate(-0.015, 0.18, -0.43);
  // M.rotate(15, 0, 1, 0);
  // M.rotate(-5, 1, 0, 0);
  // M.scale(0.18, 0.075, 0.15);
  // drawCube(M, color);

  // // left eye
  // color = [0.1, 0.1, 0.1, 1];
  // M.setIdentity();
  // M.translate(0.14, 0.23, -0.54);
  // M.rotate(15, 0, 1, 0);
  // M.rotate(-5, 1, 0, 0);
  // M.scale(0.07, 0.07, 0.05);
  // drawCube(M, color);

  // // right eye
  // M.setIdentity();
  // M.translate(-0.09, 0.23, -0.49);
  // M.rotate(15, 0, 1, 0);
  // M.rotate(-5, 1, 0, 0);
  // M.scale(0.07, 0.07, 0.05);
  // drawCube(M, color);

  // // right leg
  // color = [1, 1, 1, 1];
  // M.setIdentity();
  // M.translate(0.01, -0.35, 0.02);
  // M.rotate(15, 0, 1, 0);
  // M.rotate(-45, 1, 0, 0);
  // M.scale(0.1, 0.2, 0.1);
  // drawCube(M, color);

  // // right foot
  // M.setIdentity();
  // M.translate(0.01, -0.35, 0.02);
  // M.rotate(15, 0, 1, 0);
  // M.rotate(-45, 1, 0, 0);
  // M.scale(0.1, 0.08, 0.2);
  // drawCube(M, color);

  // // left leg
  // M.setIdentity();
  // M.translate(0.24, -0.35, -0.06);
  // M.rotate(15, 0, 1, 0);
  // M.rotate(-45, 1, 0, 0);
  // M.scale(0.1, 0.2, 0.1);
  // drawCube(M, color);

  // // left foot
  // M.setIdentity();
  // M.translate(0.24, -0.35, -0.06);
  // M.rotate(15, 0, 1, 0);
  // M.rotate(-45, 1, 0, 0);
  // M.scale(0.1, 0.08, 0.2);
  // drawCube(M, color);

  // // hat
  // let cone = new Cone();
  // cone.color = [0.95, 0.95, 0.95, 1.0];
  // cone.height = 0.42;
  // cone.radius = 0.41;
  // cone.matrix.translate(0.1, 0.36, -0.35);
  // cone.matrix.rotate(8, 1, 0, 0);
  // cone.render();

  // Check the time at the end of the function, and display on web page
  var duration = performance.now() - startTime;
  sendTextToHTML(
    " ms: " +
      Math.floor(duration) +
      " fps: " +
      Math.floor(10000 / duration) / 10,
    "numdot"
  );
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML.");
    return;
  }

  htmlElm.innerHTML = text;
}
