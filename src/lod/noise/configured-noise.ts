import { Noise } from './noise';
import { NoiseModel } from './noise-model';

export class ConfiguredNoise {
	private _noise: Noise;

	constructor() {
		this._noise = new Noise(new NoiseModel("simplex", 0, 4, 0.5, 1, 0.9, 0, 1, "add", []));
	}

	public noise(x: number, y: number): number {
		let noise = this._noise.noise(x, y);
		if(Math.random() > 0.99) console.log(noise);
		return noise;
	}
}