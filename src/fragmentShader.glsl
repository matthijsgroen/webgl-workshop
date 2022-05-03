varying lowp vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform lowp vec2 uTextureDimensions;

void main() {
  highp vec2 coord = vTextureCoord.xy / uTextureDimensions;
  mediump vec4 texelColor = texture2D(uSampler, coord);

  highp vec2 shadowCoord = vec2(vTextureCoord.x, vTextureCoord.y - 8.0) / uTextureDimensions;
  mediump vec4 shadowTexelColor = texture2D(uSampler, shadowCoord);


  highp vec2 redChannel = vec2(vTextureCoord.x + 18.0, vTextureCoord.y ) / uTextureDimensions;
  mediump vec4 redTexelColor = texture2D(uSampler, redChannel);

  highp vec2 blueChannel = vec2(vTextureCoord.x - 18.0, vTextureCoord.y ) / uTextureDimensions;
  mediump vec4 blueTexelColor = texture2D(uSampler, blueChannel);

  highp vec4 shadow = vec4(0.0, 0.0, 0.0, shadowTexelColor.a);
  highp vec4 red = vec4(redTexelColor.r, 0.0, 0.0, redTexelColor.a);
  highp vec4 blue = vec4(0.0, 0.0, blueTexelColor.b, blueTexelColor.a);
  gl_FragColor = shadow + red + blue + vec4(texelColor.rgb * texelColor.a, texelColor.a);
    // gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
}