uniform sampler2D uHeightData;
varying vec3 vPosition;

void main() {
	float intensity = texture2D(uHeightData, (vec2(vPosition.x, -vPosition.y) - 32.0) / 64.0).a;

	gl_FragColor = vec4(intensity, intensity, intensity, 1.0);
}