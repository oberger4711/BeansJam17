/// <reference path="../phaser.d.ts"/>

module GameJam.Preload {

	export class Preload extends Phaser.State {

		preload() {
			var text = this.game.add.text(this.game.width / 2, this.game.height / 2, "Loading...", { fill : '#ffffff' });
			text.anchor.set(0.5, 0.5);

			// TODO: Load stuff.
			// Images
			//this.game.load.image('car', 'assets/car.png');

			// Spritesheets
			//this.game.load.spritesheet('player', 'assets/player.png', 64, 64);

			// Maps
			//this.game.load.json('lvl0', 'assets/0.json');

			// Sound
			//this.game.load.audio('music', 'assets/music.mp3');
			//this.game.load.audio('laser-snd', 'assets/laser.mp3');
		}

		create() {
			// Finished loading.
			//let music = this.game.add.audio('music', undefined, Number.MAX_VALUE);
			//music.play();
			// TODO: Switch to next screen.
			//this.game.state.start("intro", true, false);
		}
	}
}
