/// <reference path="../phaser.d.ts"/>

module GameJam.Preload {

	export class Preload extends Phaser.State {

		preload() {
			// Images
			this.game.load.image('tiles', 'assets/maps/tiles/tiles.png');
			this.game.load.image('darkness', 'assets/maps/tiles/darkness.png');
			this.game.load.image('background', 'assets/misc/background.png');
			this.game.load.image('speechbubble', 'assets/misc/speechbubble.png');
			this.game.load.image('jump', 'assets/misc/jump.png');
			this.game.load.image('cover', 'assets/misc/cover.png');
			this.game.load.image('instructions0', 'assets/misc/instructions0.png');
			this.game.load.image('instructions1', 'assets/misc/instructions1.png');

			// Spritesheets
			this.game.load.spritesheet('player', 'assets/spritesheets/player.png', 64, 64);
			this.game.load.spritesheet('victim', 'assets/spritesheets/victim.png', 64, 64);
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
			this.game.state.start("title", true, false);
		}
	}
}
