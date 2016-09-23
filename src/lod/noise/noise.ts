import { ImprovedNoise } from './improved-noise';
import { NoiseModel } from './noise-model';

export class Noise {
	private children: Array<Noise>;
	private _perlin: ImprovedNoise

	private perlin: (x: number, y: number) => number;

	constructor(private noiseModel: NoiseModel) {
		this._perlin = new ImprovedNoise();
		this.perlin = (x: number, y: number) => this._perlin.noise(x, y, 0);

		this.children = new Array<Noise>();
		for(let i = 0; i < this.noiseModel.children.length; i++) {
			this.children.push(new Noise(this.noiseModel.children[i]));
		}
	}

	public noise(x: number, y: number): number {
		let result = 0;
		let childrenResult = 0;

		let frequency = this.noiseModel.frequency;
		let amplitude = 1;

		let min = 0;
		let max = 0;

		// noiseFunction should return a value between 0 and 1
		let noiseFunction = this.perlin.bind(this);
		if(this.noiseModel.type == "truecellular") {
			//noiseFunction = this.truecellular.bind(this);
		}
		else if(this.noiseModel.type == "fastcellular") {
			//noiseFunction = this.fastcellular.bind(this);
		}
		else {
			min = -1;
		}

		for(let i = 0; i < this.noiseModel.octaves; i++) {
			result += noiseFunction(x * frequency, y * frequency) * amplitude;
			max += amplitude;

			frequency *= this.noiseModel.lancunarity;
			amplitude *= this.noiseModel.persistence;
		}
	
		result = this.rescale(result, min, max, this.noiseModel.low, this.noiseModel.high);

		for(let i = 0; i < this.children.length; i++) {
			childrenResult += this.children[i].noise(x, y);
		}

		switch(this.noiseModel.operation) {
			case "multiply":
				return result * childrenResult;
			case "divide":
				return result / childrenResult;
			case "add":
				return result + childrenResult;
			case "subtract":
				return result - childrenResult
		}
	}
	private rescale(value: number, min_old, max_old, min_new, max_new): number {
		return ((max_new - min_new) / (max_old - min_old) * (value - max_old)) + max_new;
	}
}
