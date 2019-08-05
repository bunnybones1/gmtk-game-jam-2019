attribute vec2 uv;
attribute vec4 position;
attribute vec3 color;
attribute float weight;

#ifdef USE_SCREENSPACE
uniform vec2 offset;
uniform float prescale;
uniform vec4 clipSpacePosition;
uniform vec2 pixelSizeInClipSpace;
#else
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
#endif
varying vec2 vUv;
varying vec3 vColor;
varying float vWeight;

void main() {
  vUv = uv;
  vColor = color;
  vWeight = weight;

  #ifdef USE_SCREENSPACE
    vec2 finalOffset = (offset + position.xy) * pixelSizeInClipSpace * prescale;
    #ifdef CONSTANT_SIZE_ON_SCREEN
     finalOffset *= clipSpacePosition.w;
    #endif
    gl_Position = clipSpacePosition;
    gl_Position.xy += finalOffset;
  #else
    gl_Position = projectionMatrix * modelViewMatrix * position;
  #endif
}