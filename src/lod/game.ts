// TODO Add mesh to visualize the terrain texture

import { Player } from './player/player';
import { Terrain } from './terrain/Terrain';

export class Game {
	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private renderer: THREE.WebGLRenderer;
	private player: Player;
	private clock: THREE.Clock;
	private terrain: Terrain;

	private debugTerrainPlane: THREE.Mesh; 
	constructor() {
		this.initThreeJS();
		this.player = new Player(this.scene);
		this.clock = new THREE.Clock();

		this.terrain = new Terrain(1024, 4, 128);

		this.terrain.visible = true;

		this.scene.add(this.terrain);
		var axisHelper = new THREE.AxisHelper( 5000 );
		this.scene.add( axisHelper );
		this.addTestGeometry();
		this.render();
	}

	addTestGeometry() {
		/*for(let i = 0; i < 1000; i++) {
			var geometry = new THREE.BoxGeometry( 1, 1, 1 );
			var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
			var cube = new THREE.Mesh( geometry, material );
			cube.position.z = Math.random() * 1000;
			cube.position.x = Math.random() * 1000;
			cube.position.y = Math.random() * 1000;

			this.scene.add( cube );
		}*/

		{
			let material = new THREE.ShaderMaterial({
				uniforms: {
					uHeightData: { type: "t", value: this.terrain.terrainGenerator.texture }
				},
				fragmentShader: require('../shaders/debugterrain.frag'),
				vertexShader: require('../shaders/debugterrain.vert')
			})
			material.extensions.derivatives = true;
			let geometry = new THREE.PlaneGeometry(64, 64, 10, 10);
			//geometry.rotateX(-Math.PI / 2);

			this.debugTerrainPlane = new THREE.Mesh(geometry, material);

			this.debugTerrainPlane.position.z = -60;
			this.debugTerrainPlane.position.x = -50;
			this.debugTerrainPlane.position.y = -10;
			//this.debugTerrainPlane.position.y = 50;

			this.player.pointerLockControls.pitchObject.add(this.debugTerrainPlane);
			//this.scene.add(this.debugTerrainPlane);
		}

		this.player.camera.position.z = 5;

	}

	initThreeJS() {
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( this.renderer.domElement );
		window.onresize = () => {
			this.renderer.setSize( window.innerWidth, window.innerHeight );
		}
	}

	render(delta?: number) {
		delta = delta || 1/60;
		this.renderer.render(this.scene, this.player.camera);
		this.player.update(delta);
		this.terrain.offset.x = this.player.pointerLockControls.getObject().position.x;
		this.terrain.offset.y = this.player.pointerLockControls.getObject().position.z;
		this.terrain.frustumCulled = false;
		this.terrain.update();

		//this.debugTerrainPlane.position.set(this.player.camera.getWorldPosition().x, this.player.camera.getWorldPosition().y, this.player.camera.getWorldPosition().z);


		requestAnimationFrame(() => {
			this.render(this.clock.getDelta()); 
		});
	}
}