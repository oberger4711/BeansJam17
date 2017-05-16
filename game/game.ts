/// <reference path="phaser.d.ts"/>
/// <reference path="preload/preload.ts"/>
/// <reference path="level/level.ts"/>

module GameJam {
	export class MyGame extends Phaser.Game {

		constructor() {
			super(900, 600, Phaser.CANVAS, 'content', undefined, undefined, false);

			this.state.add("preload", Preload.Preload);
			this.state.add("level", Level.Level);

			this.state.start("preload");
		}
	}
}

window.onload = () => {
	var game = new GameJam.MyGame();
};
