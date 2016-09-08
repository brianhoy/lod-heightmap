import { Player } from '../player/player';
import { Edge } from './edge';

import '../../shaders/edgemorph.chunk.glsl';
import '../../shaders/colorscale.chunk.glsl';
import { GetTerrainFragmentShader } from '../../shaders/terrain.frag.glsl';
import { GetTerrainVertexShader } from '../../shaders/terrain.vert.glsl';
import { Texture } from './texture';

// ported from https://github.com/felixpalmer/lod-terrain/blob/master/js/app/terrain.js

export class Terrain extends THREE.Object3D{
	private worldWidth: number;
	private levels: number;
	private resolution: number;
	private heightData: any;
	public offset: THREE.Vector2;

	private texture: Texture;
	private shader: THREE.Shader;

	private tiles: THREE.Mesh[];
	private tileGeometry: THREE.PlaneBufferGeometry;

	constructor(heightData, worldWidth, levels, resolution) {
		super();
		
		this.tiles = [];
		//THREE.Object3D.call( this );

		this.worldWidth = ( worldWidth !== undefined ) ? worldWidth : 1024;
		this.levels = ( levels !== undefined ) ? levels : 6;
		this.resolution = ( resolution !== undefined ) ? resolution : 128;
		this.heightData = heightData;
		this.texture = new Texture(() => {
			this.createTiles();
		});

		// Offset is used to re-center the terrain, this way we get the greates detail
		// nearest to the camera. In the future, should calculate required detail level per tile
		this.offset = new THREE.Vector2( 0, 0 );
	}

	private createTiles() {
		// Create geometry that we'll use for each tile, just a standard plane
		this.tileGeometry = new THREE.PlaneBufferGeometry( 1, 1, this.resolution, this.resolution );
		this.tileGeometry.rotateX(-Math.PI / 2);
		// Place origin at bottom left corner, rather than center
		var m = new THREE.Matrix4();
		m.makeTranslation( 0.5, 0, 0.5 );
		m.makeRotationX(- Math.PI / 2);
		//this.tileGeometry.applyMatrix( m );
		this.tileGeometry.translate(0.5, 0, 0.5)
		// Create collection of tiles to fill required space
		/*jslint bitwise: true */
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
		return new THREE.ShaderMaterial({
			uniforms: {
				uEdgeMorph: { type: "i", value: edgeMorph },
				uGlobalOffset: { type: "v2", value: globalOffset },
				uHeightData: { type: "t", value: heightData },
				//uGrass: { type: "t", value: texture.grass },
				uRock: { type: "t", value: this.texture.rock },
				//uSnow: { type: "t", value: texture.snow },
				uTileOffset: { type: "v2", value: offset },
				uScale: { type: "f", value: scale },
				uTileResolution: { type: "f", value: resolution.toFixed(1)}
			},
			vertexShader: GetTerrainVertexShader(),
			fragmentShader: GetTerrainFragmentShader(),
			transparent: true
		})
	}

	private createTile(x, z, scale, edgeMorph) {
		let terrainMaterial = this.createTerrainMaterial(this.heightData,
			this.offset, new THREE.Vector2(x, z), scale, this.resolution, edgeMorph );

		var plane = new THREE.Mesh( this.tileGeometry, terrainMaterial );
		this.add( plane );
		this.tiles.push(plane);
		plane.frustumCulled = false;
	}
}