import { Noise } from './noise';

export class ConfiguredNoise {
	private _noise: Noise;

	constructor() {
		this._noise = new Noise(JSON.parse(`
{"type":"simplex","baseHeight":100,"octaves":4,"persistence":0.5,"lancunarity":2,"frequency":0.4,"low":0,"high":5000,"operation":"multiply","children":[{"type":"simplex","baseHeight":100,"octaves":1,"persistence":0.5,"lancunarity":2,"frequency":0.1,"low":0,"high":1,"operation":"add","children":[],"uid":0.8910968614721209}],"uid":0.6775682121284541}
		`));
	}

	public noise(x: number, y: number): number {
		return this._noise.noise(x, y); 
	}
}