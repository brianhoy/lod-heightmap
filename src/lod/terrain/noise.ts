import { ImprovedNoise } from './improved-noise';

export class Noise {
	public noiseTexture: THREE.DataTexture;

	constructor() {
		let width = 1024;
		let size = width * width;
		let data = new Uint8Array( size );

		// Zero out height data
		for ( let i = 0; i < size; i ++ ) {
			data[i] = 0;
		}

		let perlin = new ImprovedNoise();
		let quality = 1;
		let z = Math.random() * 100;

		// Do several passes to get more detail
		for ( let iteration = 0; iteration < 4; iteration++ ) {
			for ( let i = 0; i < size; i ++ ) {
			let x = i % width;
			let y = Math.floor( i / width );
			data[i] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality );
			}
			quality *= 5;
		}

		let noise = new THREE.DataTexture( data, width, width, THREE.AlphaFormat );
		noise.wrapS = THREE.MirroredRepeatWrapping;
		noise.wrapT = THREE.MirroredRepeatWrapping;
		noise.needsUpdate = true;
		this.noiseTexture = noise;
	}
}