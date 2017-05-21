/// <reference path="../phaser.d.ts"/>

module GameJam.Title {

	export class Title extends Phaser.State {
		
		private slides : Phaser.Sprite[];
		private currentSlideIndex : number;

		create() {
			this.slides = [];
			this.slides.push(this.game.add.sprite(0, 0, 'cover'));
			this.slides.push(this.game.add.sprite(0, 0, 'instructions0'));
			this.slides.push(this.game.add.sprite(0, 0, 'instructions1'));

			this.currentSlideIndex = 0;
			this.showCurrentSlide();

			// Events
			this.game.input.onDown.add(this.onClickDown, this);
		}

		onClickDown() {
			this.currentSlideIndex++;
			if (this.currentSlideIndex < this.slides.length) {
				this.showCurrentSlide();
			}
			else {
				this.game.state.start("level", true, false, 0);
			}
		}

		showCurrentSlide() {
			for (let s of this.slides) {
				s.visible = false;
			}
			this.slides[this.currentSlideIndex].visible = true;
		}
	}

}
