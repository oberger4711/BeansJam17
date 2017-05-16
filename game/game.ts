/// <reference path="phaser.d.ts"/>
/// <reference path="preload/preload.ts"/>

module GameJam {
	export class MyGame extends Phaser.Game {

		constructor() {
			super(900, 600, Phaser.CANVAS, 'content', undefined, undefined, false);

			this.state.add("preload", Preload.Preload);
			// TODO: Add more states.
			//this.state.add("intro", Intro.Intro);

			this.state.start("preload");
		}
	}
}

window.onload = () => {
	var game = new GameJam.MyGame();
};
