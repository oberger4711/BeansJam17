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
			this.game.load.image('won', 'assets/misc/won.png');

			// Spritesheets
			this.game.load.spritesheet('player', 'assets/spritesheets/player.png', 64, 64);
			this.game.load.spritesheet('victim', 'assets/spritesheets/victim.png', 64, 64);
			this.game.load.spritesheet('container', 'assets/spritesheets/container.png', 100, 100);

			// Maps
			this.game.load.tilemap('map1', 'assets/maps/map1.json', null, Phaser.Tilemap.TILED_JSON);
			this.game.load.tilemap('map2', 'assets/maps/map2.json', null, Phaser.Tilemap.TILED_JSON);
			this.game.load.tilemap('map3', 'assets/maps/map3.json', null, Phaser.Tilemap.TILED_JSON);
			this.game.load.tilemap('map4', 'assets/maps/map4.json', null, Phaser.Tilemap.TILED_JSON);
			this.game.load.tilemap('map5', 'assets/maps/map5.json', null, Phaser.Tilemap.TILED_JSON);

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
