/// <reference path="../../../typings/threejs/three.d.ts"/>

export class PointerLockControls {
	private static scope: PointerLockControls;
	private pitchObject: THREE.Object3D;
	private yawObject: THREE.Object3D;
	private PI_2: number;
	private rootElement: HTMLElement;

	public havePointerLock: boolean;
	public pointerLockEnabled: boolean;
	public controlsEnabled: boolean;

	constructor(private camera: THREE.Camera) {

		PointerLockControls.scope = this;

		camera.rotation.set( 0, 0, 0 );

		this.pitchObject = new THREE.Object3D();
		this.pitchObject.add(camera);

		this.yawObject = new THREE.Object3D();
		this.yawObject.position.y = 10;
		this.yawObject.add(this.pitchObject);

		this.PI_2 = Math.PI / 2;

		this.havePointerLock = this.checkPointerLock();
		this.initPointerLock();
		this.pointerLockEnabled = false;
 
		console.log("adding event listener");
		document.addEventListener( 'mousemove', this.onMouseMove.bind(this), false );
	}

	private checkPointerLock(): boolean {
		return 'pointerLockElement' in document || 
			'mozPointerLockElement' in document || 
			'webkitPointerLockElement' in document;
	}

	private initPointerLock() {
		this.rootElement = document.body;

		if (this.havePointerLock) {
			document.addEventListener('pointerlockchange', this.pointerLockChange.bind(this), false);
			document.addEventListener('pointerlockerror', this.pointerLockError.bind(this), false);
			this.rootElement.addEventListener('click', this.requestPointerLock.bind(this), false);
		} else {
			this.rootElement.innerHTML = 'Bad browser; No pointer lock';
		}

	}

	private pointerLockChange() {
		if (document.pointerLockElement === this.rootElement) {
			this.controlsEnabled = true;
			this.pointerLockEnabled = true;
		} else {
			this.controlsEnabled = false;
			this.pointerLockEnabled = false;
		}
	}

	private pointerLockError() {
		this.rootElement.innerHTML = 'PointerLock Error';
	}

	private requestPointerLock() {
		this.rootElement.requestPointerLock();
	}

	private onMouseMove(event: MouseEvent) {
		if (this.pointerLockEnabled === false) return;

		let movementX = event.movementX || 0;
		let movementY = event.movementY || 0;

		this.yawObject.rotation.y -= movementX * 0.002;
		this.pitchObject.rotation.x -= movementY * 0.002;
		this.pitchObject.rotation.x = Math.max(-this.PI_2, Math.min(this.PI_2, this.pitchObject.rotation.x));
	}

	public getObject(): THREE.Object3D {
		return this.yawObject;
	}

	public getDirection() {
		let direction = new THREE.Vector3( 0, 0, - 1 );
		let rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

		return function(v: THREE.Vector3) {
			rotation.set(this.pitchObject.rotation.x, this.yawObject.rotation.y, 0 );
			v.copy( direction ).applyEuler( rotation );
			return v;
		};
	}

	public dispose(): void {
		document.removeEventListener( 'mousemove', this.onMouseMove, false );
	}
}