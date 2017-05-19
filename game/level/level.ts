/// <reference path="../phaser.d.ts"/>

module GameJam.Level {

	export class Level extends Phaser.State {


		private mapName : string;
		private map : Phaser.Tilemap;
		private layerSpaceship : Phaser.TilemapLayer;
		private music : Phaser.Sound;

		init(index : number) {
			let LEVELS : string[] = ['map_test'];
			this.mapName = LEVELS[index];
			console.log("Initialized level " + this.mapName + ".");
		}

		create() {
			this.map = this.game.add.tilemap(this.mapName);
			console.log(this.map);

			this.map.addTilesetImage('tiles');
			this.map.setCollisionBetween(1, 100);
			this.layerSpaceship = this.map.createLayer('Tile Layer 1');
			this.layerSpaceship.resizeWorld();

			//this.music = this.game.add.sound('music', 1, true);
			//this.music.play();
		}
	}
}
