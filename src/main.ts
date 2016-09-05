import { Game } from './lod/game';

class App {
	private game: Game;

	constructor() {
		window.onload = () => {
			this.game = new Game();
		}
	}
}

let app = new App();