/// <reference path="../phaser.d.ts"/>

module GameJam.Level {

	const LEVEL_MAP_LIST : string[] = ['map_test'];
	const MAX_FLY_VELOCITY : number = 200;

	enum ELevelState {
		FLYING,
		STICKING
	}

	export class Level extends Phaser.State {

		private music : Phaser.Sound;

		private mapName : string;
		private map : Phaser.Tilemap;
		private layerSpaceship : Phaser.TilemapLayer;
		private layerObjects : Phaser.TilemapLayer;
		private player : Phaser.Sprite;
		private flightLine : Phaser.Line;

		private levelState : ELevelState;

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

			this.flightLine = new Phaser.Line();

			this.game.input.onDown.add(this.onDown, this);

			//this.music = this.game.add.sound('music', 1, true);
			//this.music.play();
		}

		createPlayer(x : number, y : number) : void {
			this.player = this.game.add.sprite(x, y, 'player');
			this.player.anchor.x = 0.5;
			this.player.anchor.y = 0.5;
			this.player.position.x += this.player.width / 2;
			this.player.position.y += this.player.height / 2;
			this.player.animations.add('fly', [0, 1], 100, true);
			this.player.animations.add('stick', [2, 3], 100, true);
			this.player.animations.play('fly');
			this.game.physics.arcade.enable(this.player);
			this.player.body.velocity.x = -MAX_FLY_VELOCITY;
			this.player.body.velocity.y = 0;
			this.levelState = ELevelState.FLYING;
		}

		onDown(pointer) {
			if (this.levelState == ELevelState.STICKING) {
				this.game.physics.arcade.moveToPointer(this.player, MAX_FLY_VELOCITY, pointer);
				this.transitionToState(ELevelState.FLYING);
			}
		}

		update() {
			this.game.physics.arcade.collide(this.player, this.layerSpaceship, this.onPlayerCollidesWithSpaceShip, null, this);
			if (this.levelState == ELevelState.STICKING) {
				// Update flight line.
				this.flightLine.start = this.player.position;
				this.flightLine.end = this.game.input.activePointer.position;
			}
		}

		private onPlayerCollidesWithSpaceShip(player, spaceShipTile) {
			console.log("Collision detected of player with spaceship tile of index " + spaceShipTile.index + ".");
			this.transitionToState(ELevelState.STICKING);
		}

		private transitionToState(next : ELevelState) {
			if (next == this.levelState) {
				return;
			}
			console.log("Transitioning from level state " + ELevelState[this.levelState] + " to level state " + ELevelState[next] + ".");
			if (next == ELevelState.STICKING) {
				this.player.rotation = 0;
				this.player.body.velocity.x = 0;
				this.player.body.velocity.y = 0;
				this.levelState = ELevelState.STICKING;
				this.player.animations.play('stick');
			}
			if (next == ELevelState.FLYING) {
				this.levelState = ELevelState.FLYING;
				this.player.animations.play('fly');
			}
		}


		render() {
			if (this.levelState == ELevelState.STICKING) {
				this.game.debug.geom(this.flightLine);
			}
			//this.game.debug.body(this.player);
			//this.game.debug.body(this.layerSpaceship);
		}
	}
}
