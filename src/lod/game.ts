import { Player } from './player/player';
import { Terrain } from './terrain/Terrain';
import { Noise } from './terrain/noise';

export class Game {
	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private renderer: THREE.WebGLRenderer;
	private player: Player;
	private clock: THREE.Clock;
	private terrain: Terrain;

	constructor() {
		this.initThreeJS();
		this.player = new Player(this.scene);
		this.clock = new THREE.Clock();

		let noise = new Noise().noiseTexture;

		this.terrain = new Terrain(noise, 1024, 4, 64);

		this.terrain.visible = true;

		this.scene.add(this.terrain);
		this.addTestGeometry();
		this.render();
	}

	addTestGeometry() {
		for(let i = 0; i < 1000; i++) {
			var geometry = new THREE.BoxGeometry( 1, 1, 1 );
			var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
			var cube = new THREE.Mesh( geometry, material );
			cube.position.z = Math.random() * 1000;
			cube.position.x = Math.random() * 1000;
			cube.position.y = Math.random() * 1000;

			this.scene.add( cube );
		}

		this.player.camera.position.z = 5;

		var axisHelper = new THREE.AxisHelper( 5000 );
		this.scene.add( axisHelper );
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

		requestAnimationFrame(() => {
			this.render(this.clock.getDelta()); 
		});
	}
}