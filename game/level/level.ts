/// <reference path="../phaser.d.ts"/>

module GameJam.Level {

	const LEVEL_MAP_LIST : string[] = ['map_test'];
	const MAX_FLY_VELOCITY : number = 200;

	export class Level extends Phaser.State {

		private music : Phaser.Sound;

		private mapName : string;
		private map : Phaser.Tilemap;
		private layerSpaceship : Phaser.TilemapLayer;
		private layerObjects : Phaser.TilemapLayer;

		private player : Phaser.Sprite;

		init(index : number) {
			this.mapName = LEVEL_MAP_LIST[index];
			console.log("Initialized level " + this.mapName + ".");
		}

		create() {
			this.map = this.game.add.tilemap(this.mapName);
			this.map.addTilesetImage('tiles');
			this.map.setCollisionBetween(1, 1);

			// Parse tiles.
			this.layerSpaceship = this.map.createLayer('Tile Layer 1');
			this.layerSpaceship.resizeWorld();

			this.game.physics.startSystem(Phaser.Physics.ARCADE);

			// Parse objects.
			for (let obj of this.map.objects['Object Layer 1']) {
				console.log(obj);
				if (obj.name == "Player") {
					this.createPlayer(obj.x, obj.y);
				}
			}
			if (this.player == null) {
				console.log("Error: Could not find object with name 'Player' in 'Object Layer 1'");
			}

			//this.music = this.game.add.sound('music', 1, true);
			//this.music.play();
		}

		createPlayer(x : number, y : number) : void {
			this.player = this.game.add.sprite(x, y, 'player');
			this.player.animations.add('fly', [0, 1], 100, true);
			this.player.animations.play('fly');
			this.game.physics.arcade.enable(this.player);
			this.player.body.velocity.x = -MAX_FLY_VELOCITY;
			this.player.body.velocity.y = 0;
		}

		update() {
			this.game.physics.arcade.collide(this.player, this.layerSpaceship);
		}

		render() {
			this.game.debug.body(this.player);
			this.game.debug.body(this.layerSpaceship);
		}
	}
}
