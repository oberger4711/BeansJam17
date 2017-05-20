/// <reference path="../phaser.d.ts"/>

module GameJam.Level {

	const LEVEL_MAP_LIST : string[] = ['map_test'];
	const MAX_FLY_VELOCITY : number = 200;
	const TILE_WIDTH : number = 100;
	const TILE_HEIGHT : number = TILE_WIDTH;

	enum ELevelState {
		FLYING,
		STICKING
	}

	enum EEnemyType {
		HORIZONTAL,
		VERTICAL
	}

	export class Level extends Phaser.State {

		private music : Phaser.Sound;

		private mapName : string;
		private map : Phaser.Tilemap;
		private layerSpaceship : Phaser.TilemapLayer;
		private layerObjects : Phaser.TilemapLayer;
		private player : Phaser.Sprite;
		private flightLine : Phaser.Line;
		private enemies : Phaser.Group;
		private numberOfCaughtEnemies : number;

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
			this.enemies = this.game.add.group();
			this.game.physics.arcade.enable(this.enemies);
			for (let obj of this.map.objects['Object Layer 1']) {
				if (obj.name == "Player") {
					this.createPlayer(obj.x, obj.y);
				}
				else if (obj.name == "EnemyV") {
					this.createEnemy(obj.x, obj.y, EEnemyType.VERTICAL);
				}
				else if (obj.name == "EnemyH") {
					this.createEnemy(obj.x, obj.y, EEnemyType.HORIZONTAL);
				}
			}
			if (this.player == null) {
				console.log("Error: Could not find object with type 'Player' in 'Object Layer 1'");
			}

			// Init other stuff.
			this.flightLine = new Phaser.Line();
			this.numberOfCaughtEnemies = 0;

			// Add event handlers.
			this.game.input.onDown.add(this.onDown, this);

			//this.music = this.game.add.sound('music', 1, true);
			//this.music.play();
		}

		createPlayer(x : number, y : number) : void {
			console.log("Creating player.");
			this.player = this.game.add.sprite(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2, 'player');
			this.player.anchor.x = 0.5;
			this.player.anchor.y = 0.5;
			this.player.animations.add('fly', [0, 1], 100, true);
			this.player.animations.add('stick', [2, 3], 100, true);
			this.player.animations.play('fly');
			this.game.physics.arcade.enable(this.player);
			this.player.body.velocity.x = -MAX_FLY_VELOCITY;
			this.player.body.velocity.y = 0;
			this.levelState = ELevelState.FLYING;
			this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
		}

		createEnemy(x : number, y : number, type : EEnemyType) : void {
			console.log("Creating enemy of type " + EEnemyType[type] + ".");
			let enemy = this.enemies.create(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2, 'enemy');
			enemy.anchor.x = 0.5;
			enemy.anchor.y = 0.5;
			enemy.animations.add('fly', [0, 1], 100, true);
			enemy.animations.add('escape', [2, 3], 100, true);
			enemy.animations.play('escape');
			this.game.physics.arcade.enable(enemy);
			enemy.body.bounce.set(1);
			if (type == EEnemyType.HORIZONTAL) {
				enemy.body.velocity.x = MAX_FLY_VELOCITY;
			}
			else {
				enemy.body.velocity.y = MAX_FLY_VELOCITY;
			}
		}

		onDown(pointer) {
			if (this.levelState == ELevelState.STICKING) {
				this.game.physics.arcade.moveToPointer(this.player, MAX_FLY_VELOCITY, pointer);
				this.transitionToState(ELevelState.FLYING);
			}
		}

		update() {
			this.game.physics.arcade.collide(this.player, this.layerSpaceship, this.onPlayerCollidesWithSpaceShip, null, this);
			this.game.physics.arcade.collide(this.enemies, this.layerSpaceship, this.onEnemyCollidesWithSpaceShip, null, this);
			this.game.physics.arcade.overlap(this.player, this.enemies, this.onPlayerOverlapsWithEnemy, null, this);
			if (this.levelState == ELevelState.STICKING) {
				// Update flight line.
				this.flightLine.start = this.player.position;
				//this.flightLine.start.x = this.player.position.x - this.game.camera.view.x;
				//this.flightLine.start.y = this.player.position.y - this.game.camera.view.y;
				this.flightLine.end.x = this.game.input.activePointer.position.x + this.game.camera.view.x;
				this.flightLine.end.y = this.game.input.activePointer.position.y + this.game.camera.view.y;
				console.log(this.game.input.activePointer.position);
			}
		}

		private onPlayerCollidesWithSpaceShip(player, spaceShipTile) {
			console.log("Collision detected of player with spaceship tile of index " + spaceShipTile.index + ".");
			this.transitionToState(ELevelState.STICKING);
		}

		private onEnemyCollidesWithSpaceShip(enemy, spaceShipTile) {
		}

		private onPlayerOverlapsWithEnemy(player, enemy) {
			if (this.levelState == ELevelState.FLYING) {
				this.enemies.remove(enemy);
				this.numberOfCaughtEnemies++;
			}
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
