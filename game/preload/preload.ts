/// <reference path="../phaser.d.ts"/>

module GameJam.Preload {

	export class Preload extends Phaser.State {

		preload() {
			var text = this.game.add.text(this.game.width / 2, this.game.height / 2, "Loading...", { fill : '#ffffff' });
			text.anchor.set(0.5, 0.5);

			// TODO: Load stuff.
			// Images
			this.game.load.image('tiles', 'assets/maps/tiles/tiles.png');

			// Spritesheets
			this.game.load.spritesheet('player', 'assets/spritesheets/player.png', 32, 64);
			this.game.load.spritesheet('enemy', 'assets/spritesheets/enemy.png', 32, 64);

			// Maps
			this.game.load.tilemap('map_test', 'assets/maps/map_test.json', null, Phaser.Tilemap.TILED_JSON);

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
