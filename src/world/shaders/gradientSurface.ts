export const ROOM_GRADIENT_VERTEX = `
  varying vec3 vPos;

  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const ROOM_GRADIENT_FRAGMENT = `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uTime;
  varying vec3 vPos;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 34.52);
    return fract(p.x * p.y);
  }

  void main() {
    vec3 n = normalize(vPos);
    float vertical = smoothstep(-0.35, 0.8, n.y);
    float drift = sin((n.x * 4.2 + n.z * 3.8) + uTime * 0.35) * 0.08;
    float grain = (hash((n.xy + n.yz) * 190.0 + uTime * 0.08) - 0.5) * 0.035;
    vec3 color = mix(uColorA, uColorB, clamp(vertical + drift, 0.0, 1.0));
    color += grain;
    gl_FragColor = vec4(color, 1.0);
  }
`;
