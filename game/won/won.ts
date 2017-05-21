/// <reference path="../phaser.d.ts"/>

module GameJam.Won {

	export class Won extends Phaser.State {
		
		private slide : Phaser.Sprite;

		create() {
			this.game.add.sprite(0, 0, 'won');

			// Events
			this.game.input.onDown.add(this.onClickDown, this);
		}

		onClickDown() {
			this.game.state.start("title", true, false);
		}
	}

}
