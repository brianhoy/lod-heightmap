import { Player } from '../player/player';
import { Edge } from './edge';

import { Texture } from './texture';
import { TerrainGenerator } from './terrain-generator';

// ported from https://github.com/felixpalmer/lod-terrain/blob/master/js/app/terrain.js

export class Terrain extends THREE.Object3D {
	private worldWidth: number;
	private levels: number;
	private resolution: number;
	private heightData: any;
	private seed: number;

	public offset: THREE.Vector2;
	public terrainGenerator: TerrainGenerator;

	private texture: Texture;
	private shader: THREE.Shader;

	private tiles: THREE.Mesh[];
	private tileGeometry: THREE.PlaneBufferGeometry;

	private vertexShader: string;
	private fragmentShader: string;
	
	private terrainTexture: THREE.Texture;

	constructor(heightData, worldWidth, levels, resolution) { super();
		// Initialize seed - this will be passed to the vertex shader so the noise is more random.
		this.seed = Math.round(Math.random() * 10000);

		this.tiles = [];

		// Initialize WorldWidth, Levels, Resolution, and HeightData variables
		this.worldWidth = ( worldWidth !== undefined ) ? worldWidth : 1024.0;
		this.levels = ( levels !== undefined ) ? levels : 6;
		this.resolution = ( resolution !== undefined ) ? resolution : 128;
		this.heightData = heightData;

		// Load shaders
		this.loadShaders();

		this.texture = new Texture(() => {
			this.createTiles();
		});

		// Offset is used to re-center the terrain, this way we get the greates detail
		// nearest to the camera. In the future, should calculate required detail level per tile
		this.offset = new THREE.Vector2( 0, 0 );

		this.terrainGenerator = new TerrainGenerator(worldWidth, this.offset);
		this.terrainTexture = this.terrainGenerator.texture;
	}

	private loadShaders() {
		THREE.ShaderChunk['edgemorph'] = require('../../shaders/chunks/edgemorph.glsl');
		THREE.ShaderChunk['colorscale'] = require('../../shaders/chunks/colorscale.glsl');
		THREE.ShaderChunk['noisecommon'] = require('../../shaders/chunks/noisecommon.glsl');
		THREE.ShaderChunk['noiseperlin'] = require('../../shaders/chunks/noiseperlin.glsl');
		THREE.ShaderChunk['noisecellular'] = require('../../shaders/chunks/noisecellular.glsl');

		this.fragmentShader = require('../../shaders/terrain.frag');
		this.vertexShader = require('../../shaders/terrain.vert');
	}

	private createTiles() {
		// Create geometry that we'll use for each tile, just a standard plane
		this.tileGeometry = new THREE.PlaneBufferGeometry( 1, 1, this.resolution, this.resolution );
		this.tileGeometry.rotateX(-Math.PI / 2); // Tiles are parallel to the xz plane

		// Place origin at bottom left corner, rather than center
		var m = new THREE.Matrix4();
		m.makeTranslation( 0.5, 0, 0.5 );
		//m.makeRotationX(- Math.PI / 2);

		this.tileGeometry.translate(0.5, 0, 0.5)
		// Create collection of tiles to fill required space
		let initialScale = this.worldWidth / Math.pow( 2, this.levels );

		// Create center layer first
		//    +---+---+
		//    | O | O |
		//    +---+---+
		//    | O | O |
		//    +---+---+
		this.createTile( -initialScale, -initialScale, initialScale, Edge.NONE );
		this.createTile( -initialScale, 0, initialScale, Edge.NONE );
		this.createTile( 0, 0, initialScale, Edge.NONE );
		this.createTile( 0, -initialScale, initialScale, Edge.NONE );

		// Create "quadtree" of tiles, with smallest in center
		// Each added layer consists of the following tiles (marked 'A'), with the tiles
		// in the middle being created in previous layers
		// +---+---+---+---+
		// | A | A | A | A |
		// +---+---+---+---+
		// | A |   |   | A |
		// +---+---+---+---+
		// | A |   |   | A |
		// +---+---+---+---+
		// | A | A | A | A |
		// +---+---+---+---+
		for ( var scale = initialScale; scale < this.worldWidth; scale *= 2 ) {
			this.createTile( -2 * scale, -2 * scale, scale, Edge.BOTTOM | Edge.LEFT );
			this.createTile( -2 * scale, -scale, scale, Edge.LEFT );
			this.createTile( -2 * scale, 0, scale, Edge.LEFT );
			this.createTile( -2 * scale, scale, scale, Edge.TOP | Edge.LEFT );

			this.createTile( -scale, -2 * scale, scale, Edge.BOTTOM );
			// 2 tiles 'missing' here are in previous layer
			this.createTile( -scale, scale, scale, Edge.TOP );

			this.createTile( 0, -2 * scale, scale, Edge.BOTTOM );
			// 2 tiles 'missing' here are in previous layer
			this.createTile( 0, scale, scale, Edge.TOP );

			this.createTile( scale, -2 * scale, scale, Edge.BOTTOM | Edge.RIGHT );
			this.createTile( scale, -scale, scale, Edge.RIGHT );
			this.createTile( scale, 0, scale, Edge.RIGHT );
			this.createTile( scale, scale, scale, Edge.TOP | Edge.RIGHT );
		}

	}

	private createTerrainMaterial(heightData, globalOffset, offset, scale, resolution, edgeMorph): THREE.ShaderMaterial {
		let mat = new THREE.ShaderMaterial({
			uniforms: {
				uEdgeMorph: { type: "i", value: edgeMorph },
				uGlobalOffset: { type: "v2", value: globalOffset },
				uHeightData: { type: "t", value: this.terrainTexture },
				//uGrass: { type: "t", value: texture.grass },
				uRock: { type: "t", value: this.texture.rock },
				//uSnow: { type: "t", value: texture.snow },
				uTileOffset: { type: "v2", value: offset },
				uScale: { type: "f", value: scale },
				uTileResolution: { type: "f", value: resolution.toFixed(1)},
				uSeed: { type: "f", value: this.seed }
			},
			defines: {
				WORLD_WIDTH: this.worldWidth
			},
			vertexShader: this.vertexShader,
			fragmentShader: this.fragmentShader,
			transparent: true
		});
		mat.extensions.derivatives = true;
		return mat;
	}

	private createTile(x, z, scale, edgeMorph) {
		let terrainMaterial = this.createTerrainMaterial(this.heightData,
			this.offset, new THREE.Vector2(x, z), scale, this.resolution, edgeMorph );

		var plane = new THREE.Mesh( this.tileGeometry, terrainMaterial );
		this.add( plane );
		this.tiles.push(plane);
		plane.frustumCulled = false;
	}

	public update() {
		this.terrainGenerator.updateTexture();
	}
}