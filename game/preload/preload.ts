/// <reference path="../phaser.d.ts"/>

module GameJam.Preload {

	export class Preload extends Phaser.State {

		preload() {
			// Images
			this.game.load.image('tiles', 'assets/maps/tiles/tiles.png');
			this.game.load.image('darkness', 'assets/maps/tiles/darkness.png');

			// Spritesheets
			this.game.load.spritesheet('player', 'assets/spritesheets/player.png', 64, 64);
			this.game.load.spritesheet('victim', 'assets/spritesheets/victim.png', 32, 64);
			this.game.load.spritesheet('container', 'assets/spritesheets/container.png', 100, 100);

			// Maps
			this.game.load.tilemap('map_test', 'assets/maps/map_test.json', null, Phaser.Tilemap.TILED_JSON);
			this.game.load.tilemap('map_container_test', 'assets/maps/map_container_test.json', null, Phaser.Tilemap.TILED_JSON);
			this.game.load.tilemap('map_sticky_test', 'assets/maps/map_sticky_test.json', null, Phaser.Tilemap.TILED_JSON);

			// Sound
			//this.game.load.audio('music', 'assets/music.mp3');
			//this.game.load.audio('laser-snd', 'assets/laser.mp3');
		}

		create() {
			// Finished loading.
			this.game.state.start("level", true, false, 0);
		}
	}
}
