import { ConfiguredNoise } from '../noise/configured-noise';

/*
	Handles the texture that contains the heightmap data sent to the GPU
*/

export class TerrainGenerator {
	private size: number;
	private data: Uint8Array;
	public texture: THREE.DataTexture;
	private perlin: ConfiguredNoise;
	private half: number;

	private cornerCoords: THREE.Vector2; // The real-world coordinates fed into the perlin noise function at writeCoords
	private writeCoords: THREE.Vector2; // The coordinates of the used drawing area
	private deltaCoords: THREE.Vector2;
	private oldDeltaCoords: THREE.Vector2; // used to find the delta, which is used to update the texture
	private delta: THREE.Vector2;

	private tempDimensions: THREE.Vector2;
	private tempWritePos: THREE.Vector2;
	private tempCornerCords: THREE.Vector2;

	constructor(private terrainSize: number, private obsCoordinates) {
		this.size = this.terrainSize * 2;

		// Initialize perlin noise and corner coords
		this.perlin = new ConfiguredNoise();
		this.half = (this.size - 1) / 2;
		this.cornerCoords = new THREE.Vector2(-this.terrainSize, -this.terrainSize)

		// Initialize coordinates
		this.writeCoords = new THREE.Vector2(0, 0);
		this.oldDeltaCoords = this.writeCoords.clone();
		this.deltaCoords = new THREE.Vector2(0, 0);
		this.delta = new THREE.Vector2(0,0);

		// Intialize temp variables
		this.tempDimensions = new THREE.Vector2(0, 0);
		this.tempWritePos = new THREE.Vector2(0, 0);
		this.tempCornerCords = new THREE.Vector2(0, 0);

		// Create Uint8Array to be used in data texture
		this.data = new Uint8Array(this.size * this.size);

		// Initialize 1st square
		this.writeSubRectangle(new THREE.Vector2(0, 0), this.cornerCoords, new THREE.Vector2(this.terrainSize, this.terrainSize));

		// Initialize the texture
		this.texture = new THREE.DataTexture(this.data, this.size, this.size, THREE.AlphaFormat );
		this.texture.wrapS = THREE.RepeatWrapping;
		this.texture.wrapT = THREE.RepeatWrapping;
		this.texture.needsUpdate = true;
	}

	/*
	*	Writes to a specified rectangle on the texture
	*
	*	@param writeLoc the coordinates of the texture to start writing at (zero-based)
	*	@param cornerCoords the physical coordinates that writeLoc represents, to be used in generating noise
	*	@param dimensions the dimensions of the rectangle to write to 
	*/
	private writeSubRectangle(writeLoc: THREE.Vector2, cornerCoords: THREE.Vector2, dimensions: THREE.Vector2): void {
		//console.log("writeSubRectangle called", writeLoc, cornerCoords, dimensions);

		let rowIndex = writeLoc.y;
		let colIndex = writeLoc.x;

		let obsX = cornerCoords.x;
		let obsY = cornerCoords.y;

		for(let row = 0; row < dimensions.y; row++, obsY++, rowIndex++) {
			rowIndex = this.ensureWithinTexture(rowIndex);

			for(let col = 0; col < dimensions.x; col++, obsX++, colIndex++) {
				colIndex = this.ensureWithinTexture(colIndex);

				let index = rowIndex * this.size + colIndex;
				this.data[index] = this.noise(obsX, obsY);
				//if(Math.random() > 0.99999)
					//console.log('setting data at index ', index, 'obsX', obsX, 'obsY', obsY, 'result', this.data[index]);
			}

			obsX = cornerCoords.x;
			colIndex = writeLoc.x;
		}
	}

	public updateTexture() {
		this.updateAllCoordinates();
		// Determine which sub-rectangles need to be written	 
		/*	[] [] [] X
			[] [] [] X
			[] [] [] X */
		if(this.delta.x > 0) {
			this.tempWritePos.set(this.ensureWithinTexture(this.writeCoords.x - this.delta.x + this.terrainSize),
				this.writeCoords.y);
			this.tempDimensions.set(this.delta.x,
				this.terrainSize);
			this.tempCornerCords.set(this.cornerCoords.x - this.delta.x + this.terrainSize,
				this.cornerCoords.y);

			this.writeSubRectangle(this.tempWritePos, this.tempCornerCords, this.tempDimensions);
			this.oldDeltaCoords.setX(this.deltaCoords.x);
		}
		/*	X [] [] [] 
			X [] [] [] 
			X [] [] [] */
		else if(this.delta.x < 0) {
			this.tempWritePos.set(this.ensureWithinTexture(this.writeCoords.x),
				this.writeCoords.y);
			this.tempDimensions.set(Math.abs(this.delta.x),
				this.terrainSize);
			this.tempCornerCords.set(this.cornerCoords.x,
				this.cornerCoords.y);
			this.writeSubRectangle(this.writeCoords, this.tempCornerCords, this.tempDimensions);
			this.oldDeltaCoords.setX(this.deltaCoords.x);
		}

		/*  X  X  X
			[] [] [] 
			[] [] [] 
			[] [] [] */
		if(this.delta.y < 0) {
			this.tempWritePos.set(this.writeCoords.x,
				this.ensureWithinTexture(this.writeCoords.y));
			this.tempDimensions.set(this.terrainSize,
				Math.abs(this.delta.y));
			this.tempCornerCords.set(this.cornerCoords.x,
				this.cornerCoords.y);
			this.writeSubRectangle(this.tempWritePos, this.tempCornerCords, this.tempDimensions);
			this.oldDeltaCoords.setY(this.deltaCoords.y);
		}
		/*	[] [] [] 
			[] [] [] 
			[] [] [] 
		    X  X  X */
		else if(this.delta.y > 0) {
			this.tempWritePos.set(this.writeCoords.x,
				this.ensureWithinTexture(this.writeCoords.y - this.delta.y + this.terrainSize));
			this.tempDimensions.set(this.terrainSize,
				this.delta.y);
			this.tempCornerCords.set(this.cornerCoords.x,
				this.cornerCoords.y - this.delta.y + this.terrainSize);
			this.writeSubRectangle(this.tempWritePos, this.tempCornerCords, this.tempDimensions);
			this.oldDeltaCoords.setY(this.deltaCoords.y);
		}

		this.delta.set(0, 0);
		this.texture.needsUpdate = true; 
	}

	private ensureWithinTexture(value: number): number {
		return ((value % this.size) + this.size) % this.size;
	}

	private ensureInRange(value: number, min: number, max: number): number {
		let result = value;
		while(value > max) value -= max;
		while(value < min) value += max;
		return result;
	}

	private updateAllCoordinates() {
		// Update the coordinates at the corner
		this.updateCornerCoords();

		// Update the write coords (where in the texture the corner of the drawing area is - aka the player's coordinates floored)
		this.updateWriteCoords();

		this.updateDeltaCoords();
		if(Math.abs(this.deltaCoords.x - this.oldDeltaCoords.x) > 20 || Math.abs(this.deltaCoords.y - this.oldDeltaCoords.y) > 20) {
			this.updateDelta();
			//console.log("updating delta", this.delta);
			//console.log("obsPosition: ", this.obsCoordinates);
		}
	}

	private updateCornerCoords() {
		this.cornerCoords.set(
			Math.floor(this.obsCoordinates.x) - this.terrainSize,
			Math.floor(this.obsCoordinates.y) - this.terrainSize
		);
	}

	private updateWriteCoords() {
		this.writeCoords.set(
			this.ensureWithinTexture(Math.floor(this.obsCoordinates.x)), 
			this.ensureWithinTexture(Math.floor(this.obsCoordinates.y))
		);
	}

	private updateDeltaCoords() {
		this.deltaCoords.set(
			Math.floor(this.obsCoordinates.x),
			Math.floor(this.obsCoordinates.y)
		)
	}

	private updateDelta() {
		this.delta.set(
			this.deltaCoords.x - this.oldDeltaCoords.x,
			this.deltaCoords.y - this.oldDeltaCoords.y
		);
	}

	private noise(x: number, y: number): number {
		return (this.perlin.noise(x / 100, y / 100)) / 10;
	}
}