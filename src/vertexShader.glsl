attribute vec2 aCoordinate;
uniform vec2 uViewport;

attribute vec2 aTextureCoord;
varying lowp vec2 vTextureCoord;

mat4 viewportScale = mat4(
  2.0 / uViewport.x, 0, 0, 0,   
  0, -2.0 / uViewport.y, 0, 0,    
  0, 0, 1, 0,    
  -1, +1, 0, 1
);

void main() {
    vTextureCoord = aTextureCoord.xy;
    gl_Position = viewportScale *  vec4(aCoordinate.xy, 0.0, 1.0);
}