export class Texture {
	public rock: THREE.Texture;

	constructor(onFinishedLoading?: () => void, private loader?: THREE.TextureLoader) {
		this.loader = loader || new THREE.TextureLoader();
		this.loader.load('public/images/rock.jpg', (texture: THREE.Texture) => {
			this.rock = texture;
			this.rock.wrapS = THREE.RepeatWrapping;
			this.rock.wrapT = THREE.RepeatWrapping;
			if(onFinishedLoading) onFinishedLoading();
		});
	}
}