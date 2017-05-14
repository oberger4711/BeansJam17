/// <reference path="../phaser.d.ts"/>

module Ld33.Intro {
	export class Intro extends Phaser.State {

		private storyText : Phaser.Text;
		private face : Phaser.Sprite;
		private commandText : Phaser.Text;

		private continueKey : Phaser.Key;

		constructor() {
			super();
		}

		create() {
			this.storyText = this.game.add.text(this.game.width / 2, 20, "This is Joe.\nHe is some top manager at 'Important Industries Inc.'.\nHowever he sees himself surrounded by idiots whenever he is at work.\nSo when he drives home from work he usually is really pissed of.\nHe feels like turning into a monster when driving down the Autobahn\nwith his fast german car switching lanes with 'left' and 'right'.\nHe hates on all the other drivers.\nHe wishes he could shoot lasers from his eyes by pressing 'space'.\nThat way he could blow up those ridiculous super small cars that look like toys anyway.\nBut then again shooting lasers also sucks for Joe.\nJoe also does not like breaking with 'down'.\nHowever it is sometimes necessary to not crash - which is what he dislikes even more.\n\nYou better take care that Joe does not go completely nuts or he'll blow up.\nIf that should happen anyway, press 'enter' to restart the level.", { font: "15px Arial", fill : '#ffffff' });
			this.storyText.anchor.set(0.5, 0);
			this.face = this.game.add.sprite(this.game.width / 2, this.game.height / 2 + 70, 'player-face');
			this.face.anchor.set(0.5, 0);
			this.face.scale.set(4, 4);

			this.commandText = this.game.add.text(this.game.width / 2, this.game.height - 40, "Press 'enter' to start and don't expect to much.", { font : "15px Arial", fill : '#ffffff' });
			this.commandText.anchor.set(0.5, 0.5);

			this.continueKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		}

		update() {
			if (this.continueKey.justDown) {
				this.game.state.start('level', true, false, 0);
			}
		}
			
	}
}
