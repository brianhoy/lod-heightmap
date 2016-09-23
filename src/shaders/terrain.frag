/* Start Terrain Fragment Shader */

uniform float uScale;
uniform sampler2D uHeightData;
uniform sampler2D uRock;

varying float vMorphFactor;
varying vec3 vNormal;
varying vec3 vPosition;

#define nFrequency 2.0
#define nOctaves 6
#define nPersistence 0.25
#define nLancunarity 4.0

#include <noisecommon>
#include <noiseperlin>
#include <noisecellular>

float getHeight(vec3 p) {
	vec2 st = p.xz + ((float(WORLD_WIDTH)) / (float(WORLD_WIDTH) * 4.0));

	return texture2D(uHeightData, st).a * 300.0;
}

vec3 getNormal() {
	// Differentiate the position vector (this will give us two vectors perpendicular to the surface)
	// Before differentiating, add the displacement based on the height from the height map. By doing this
	// calculation here, rather than in the vertex shader, we get a per-fragment calculated normal, rather
	// than a per-vertex normal. This improves the look of distant low-vertex terrain.
	float height = getHeight( vPosition );
	vec3 p = vec3( vPosition.x,  vPosition.z, height );
	vec3 dPositiondx = dFdx(p);
	vec3 dPositiondy = dFdy(p);

	// The normal is the cross product of the differentials
	vec3 result = normalize(cross(dPositiondx, dPositiondy));
	  return vec3(result.x, result.z, result.y);
	/*vec3 fdx = vec3( dFdx( vPosition.x ), dFdx( vPosition.y ), dFdx( vPosition.z ) );
	vec3 fdy = vec3( dFdy( vPosition.x ), dFdy( vPosition.y ), dFdy( vPosition.z ) );
	vec3 normal = normalize( cross( fdx, fdy ) );
	return normal; */
}

void main() {
	// Base color
	vec3 lightColor = vec3(1.0, 1.0, 1.0);
	vec3 lightPos = vec3(0.0, 600.0, 0.0);
	//vec3 color = colorForScale(uScale);
	float texScale = 0.03;

	vec3 objectColor = vec3(0.27, 0.27, 0.17); 
	//vec3 color = texture2D(uRock, texScale * vPosition.xz).rgb; 
	//color = mix(vec3(vMorphFactor), color, 1.0 - vMorphFactor);

	vec3 normal = normalize(vNormal);

	float height = getHeight( vPosition );

	// Diffuse light
	vec3 lightDir = normalize(lightPos - vPosition);
	float diff = max(dot(normal, lightDir), 0.0);
	vec3 diffuse = diff * lightColor;

	/* Mix in specular light
	vec3 halfVector = normalize(normalize(cameraPosition - vPosition) + normalize(light - vPosition));
	float specular = dot(normal, halfVector);
	specular = max(0.0, specular);
	specular = pow(specular, 25.0);
	//color = mix(color, vec3(0, 1.0, 1.0), 0.5 * specular);

	// Add more specular light for fun
	vec3 light2 = vec3(420.0, 510.0, 30.0);
	halfVector = normalize(normalize(cameraPosition - vPosition) + normalize(light2 - vPosition));
	specular = dot(normal, halfVector);
	specular = max(0.0, specular);
	specular = pow(specular, 3.0);
	//color = mix(color, vec3(1.0, 0.3, 0), 0.5 * specular);

	vec3 light3 = vec3(0.0, 0.0, 1000.0);
	halfVector = normalize(normalize(cameraPosition - vPosition) + normalize(light3 - vPosition));
	specular = dot(normal, halfVector);
	specular = max(0.0, specular);
	specular = pow(specular, 130.0);
	//color = mix(color, vec3(1.0, 0.5, 0), specular);

	// Add height fog
	float fogFactor = clamp( 1.0 - vPosition.y / 25.0, 0.0, 1.0 );
	fogFactor = pow( fogFactor, 5.4 );
	//color = mix( color, vec3( 1.0, 0.9, 0.8 ), fogFactor );

	// Add distance fog
	float depth = gl_FragCoord.z / gl_FragCoord.w;
	fogFactor = smoothstep( 300.0, 1000.0, depth );
	//fogFactor = fogFactor * ( 1.0 - clamp( ( camH - 5.0 ) / 8.0, 0.0, 1.0 ) );
	//color = mix( color, vec3( 1.0, 1.0, 1.0 ), fogFactor ); */

    vec3 result = (diffuse) * objectColor;

	gl_FragColor = vec4(result, 1.0);
}