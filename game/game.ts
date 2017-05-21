/// <reference path="phaser.d.ts"/>
/// <reference path="preload/preload.ts"/>
/// <reference path="title/title.ts"/>
/// <reference path="level/level.ts"/>
/// <reference path="won/won.ts"/>

module GameJam {
	export class MyGame extends Phaser.Game {

		constructor() {
			super(1200, 800, Phaser.CANVAS, 'content', undefined, undefined, false);

			this.state.add("preload", Preload.Preload);
			this.state.add("title", Title.Title);
			this.state.add("level", Level.Level);
			this.state.add("won", Won.Won);

			this.state.start("preload");
		}
	}
}

window.onload = () => {
	var game = new GameJam.MyGame();
};
