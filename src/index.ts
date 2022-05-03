import vertexSource from "./vertexShader.glsl";
import fragmentSource from "./fragmentShader.glsl";
import textureSource from "./texture.png";

const createShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string
) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    source.split("\n").forEach((line, index) => {
      console.log(index + 1, line);
    });
    throw new Error(gl.getShaderInfoLog(shader));
  }

  return shader;
};

const createProgram = (gl: WebGLRenderingContext) => {
  const program = gl.createProgram();

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  return {
    program,
    attributes: {
      coordinate: gl.getAttribLocation(program, "aCoordinate"),
      textureCoordinate: gl.getAttribLocation(program, "aTextureCoord"),
    },
    uniforms: {
      viewport: gl.getUniformLocation(program, "uViewport"),
      sampler: gl.getUniformLocation(program, "uSampler"),
      textureDimensions: gl.getUniformLocation(program, "uTextureDimensions"),
    },
  };
};

const initBuffers = (gl: WebGLRenderingContext, image: HTMLImageElement) => {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const x = 10,
    y = 10,
    w = 780,
    h = 150;

  // prettier-ignore
  const positions = [
    x + w,  y,     image.width, 0,
    x + w,  y + h, image.width, image.height,
    x, y,          0, 0,
    x, y + h,      0, image.height,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  const indices = [0, 1, 2, 1, 2, 3];
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  return {
    position: positionBuffer,
    indices: indexBuffer,
    indexBufferLength: indices.length,
  };
};

const loadTexture = (src: string) =>
  new Promise<HTMLImageElement>((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      resolve(image);
    };
    image.src = src;
  });

const main = async () => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  canvas.width = 800;
  canvas.height = 600;

  const gl = canvas.getContext("webgl", {
    premultipliedAlpha: true,
    depth: true,
  });
  gl.clearColor(0.9, 0.9, 0.9, 1);
  //   gl.viewport(0, 0, 800, 600);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const programInfo = createProgram(gl);

  const textureImage = await loadTexture(textureSource);
  const buffers = initBuffers(gl, textureImage);

  const stride = 4; // how many bytes to get from one set of values to the next
  // 0 = use type and numComponents above
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  gl.vertexAttribPointer(
    programInfo.attributes.coordinate,
    2,
    gl.FLOAT,
    false,
    stride * Float32Array.BYTES_PER_ELEMENT,
    0
  );
  gl.enableVertexAttribArray(programInfo.attributes.coordinate);

  gl.vertexAttribPointer(
    programInfo.attributes.textureCoordinate,
    2,
    gl.FLOAT,
    false,
    stride * Float32Array.BYTES_PER_ELEMENT,
    2 * Float32Array.BYTES_PER_ELEMENT
  );
  gl.enableVertexAttribArray(programInfo.attributes.textureCoordinate);

  gl.useProgram(programInfo.program);
  gl.uniform2f(programInfo.uniforms.viewport, 800, 600);
  gl.uniform2f(
    programInfo.uniforms.textureDimensions,
    textureImage.width,
    textureImage.height
  );
  gl.uniform1i(programInfo.uniforms.sampler, 0);

  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    textureImage
  );

  const draw = () => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(
      gl.TRIANGLES,
      buffers.indexBufferLength,
      gl.UNSIGNED_SHORT,
      0
    );
  };

  draw();
};

main();
