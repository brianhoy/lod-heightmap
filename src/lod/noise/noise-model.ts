export class NoiseModel {
    public uid: number;

    constructor(
        /* Currently either 'Cellular' or 'Simplex' */
        public type?: string,
        public baseHeight?: number,
        /* How many layers of noise their should be */
        public octaves?: number,
        /* A multiplier that determines how quickly the amplitudes 
        diminish for each successive octave in a Perlin-noise function. */
        public persistence?: number,
        /* A multiplier that determines how quickly the frequency 
        increases for each successive octave in a Perlin-noise function. */
        public lancunarity?: number,
        /* Multiplied by coordinates in simplex noise function */
        public frequency?: number,
        /* Determines the minimum and maximum value you can get from this noise. */
        public low?: number,
        public high?: number,
        /* Only used for child noise functions. Can be 'add', 'subtract', 'multiply', or 'divide'. */
        public operation?: string,
        public children?: NoiseModel[]
    ) {
        this.type = this.type || "simplex";
		this.baseHeight = this.baseHeight || 100;
		this.octaves = this.octaves || 1;
		this.persistence = this.persistence || 0.5;
		this.lancunarity = this.lancunarity || 2;
		this.frequency = this.frequency || 1;
		this.low = this.low || 0;
		this.high = this.high || 1000;
		this.operation = this.operation || "add";
        this.children = this.children || [];

        this.uid = Math.random();
    }
}