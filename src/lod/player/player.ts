/// <reference path="../../../typings/threejs/three.d.ts"/>

import {PointerLockControls} from './PointerLockControls';

export class Player {
	public camera: THREE.PerspectiveCamera;

	private moveForward: boolean = false;
	private moveBackward: boolean = false;
	private moveRight: boolean = false;
	private moveLeft: boolean = false;
	private moveUp: boolean = false;
	private moveDown: boolean = false;

	private canJump: boolean = true;
	private jumpOnNext: boolean = false;
	private flyMode: boolean = false;

	private clock: THREE.Clock;

	private pointerLockEnabled: boolean;
	private pointerLockControls: PointerLockControls;

	private velocity: THREE.Vector3;
	private cameraRotation: THREE.Euler;
	private jumpHeight: number;

	constructor(private scene: THREE.Scene) {
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 5000);
		this.camera.up = new THREE.Vector3( 0, 0, 1 );

		var updateSize = () => {
			this.camera.aspect = document.body.offsetWidth / document.body.offsetHeight;
			this.camera.updateProjectionMatrix();
		};
		window.addEventListener( 'resize', updateSize, false );
		updateSize();

		this.pointerLockEnabled = false;
		this.pointerLockControls = new PointerLockControls(this.camera);
		//this.scene.add(this.pLockControls.getObject());
		this.scene.add(this.pointerLockControls.getObject());
		this.jumpHeight = 400;
		this.flyMode = true;
		this.initControls();
	}

	private initControls() {
		document.addEventListener('keydown', this.onKeyDown.bind(this), false);
		document.addEventListener('keyup', this.onKeyUp.bind(this), false);
				
		this.jumpOnNext = false;
		this.canJump = false;
		this.clock = new THREE.Clock();

		this.velocity = new THREE.Vector3(0, 0, 0);
		this.cameraRotation = new THREE.Euler(0, 0, 0);
	}

	private onKeyDown(ev: KeyboardEvent): void {
		switch (ev.keyCode) {
			case 38: // up
			case 87: // w
				this.moveForward = true;
				break;
			case 37: // left
			case 65: // a
				this.moveLeft = true;
				break;
			case 40: // down
			case 83: // s
				this.moveBackward = true;
				break;
			case 39: // right
			case 68: // d
				this.moveRight = true;
				break;
			case 32: // space
				this.moveUp = true;
				if (this.canJump == true) {
					console.log("Jumping");
					this.jumpOnNext = true;
					this.canJump = false;
				}
				break;
			case 16:
				this.moveDown = true;
		}
	}

	private onKeyUp(ev: KeyboardEvent): void {
		switch(ev.keyCode) {
			case 38: // up
			case 87: // w
				this.moveForward = false;
				break;
			case 37: // left
			case 65: // a
				this.moveLeft = false;
				break;
			case 40: // down
			case 83: // s
				this.moveBackward = false;
				break;
			case 39: // right
			case 67:
				this.flyMode = !this.flyMode;
			case 68: // d
				this.moveRight = false;
				break;
			case 32:
				this.moveUp = false;
			case 16:
				this.moveDown = false;
		}
	}

	private calculateNewVelocity(delta: number): void {
		this.velocity.set(0, 0, 0);

		let walkingSpeed = 400;

		if (this.moveForward) this.velocity.z -= walkingSpeed * delta;
		if (this.moveBackward) this.velocity.z += walkingSpeed * delta;

		if (this.moveLeft) this.velocity.x -= walkingSpeed * delta;
		if (this.moveRight) this.velocity.x += walkingSpeed * delta;
		if(this.flyMode) {
			if(this.moveDown) {
				this.velocity.y -= walkingSpeed * delta;
			}
			if(this.moveUp) {
				this.velocity.y += walkingSpeed * delta;
			}
		}
		else {
			if(this.jumpOnNext) { 
				this.velocity.y += this.jumpHeight; 
				this.jumpOnNext = false; 
			}
			this.canJump = true;
		}
	}

	public update(delta: number) {
		this.calculateNewVelocity(delta);

		this.pointerLockControls.getObject().translateX(this.velocity.x);
		this.pointerLockControls.getObject().translateY(this.velocity.y);
		this.pointerLockControls.getObject().translateZ(this.velocity.z);
	}
}