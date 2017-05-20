/// <reference path="../phaser.d.ts"/>

module GameJam.Level {

	const LEVEL_MAP_LIST : string[] = ['map_test'];
	const NUMBER_OF_TRIES_MAP_LIST : number[] = [3];
	const PLAYER_VELOCITY : number = 200;
	const VICTIM_VELOCITY : number = 150;
	const TILE_WIDTH : number = 100;
	const TILE_HEIGHT : number = TILE_WIDTH;
	const TILE_INDEX_START_GRIPPY : number = 1;
	const TILE_INDEX_END_GRIPPY : number = 1;
	const TILE_INDEX_START_BOUNCE : number = 3;
	const TILE_INDEX_END_BOUNCE : number = 3;
	const TILE_INDEX_DARKNESS : number = 9;

	enum ELevelState {
		FLYING,
		STICKING,
		WON,
		LOST
	}

	enum EVictimType {
		HORIZONTAL,
		VERTICAL
	}

	export class Level extends Phaser.State {

		private music : Phaser.Sound;

		private mapIndex : number;
		private mapName : string;
		private map : Phaser.Tilemap;
		private layerSpaceship : Phaser.TilemapLayer;
		private layerDarkness : Phaser.TilemapLayer;
		private layerObjects : Phaser.TilemapLayer;
		private player : Phaser.Sprite;
		private flightLine : Phaser.Line;
		private victims : Phaser.Group;
		private containers : Phaser.Group;
		private numberOfTriesLeft : number;
		private numberOfCaughtEnemies : number;
		private playerInDarkness : boolean;
		private retryKey : Phaser.Key;
		private textStyle;
		private numberOfTriesLeftText : Phaser.Text;

		private levelState : ELevelState;

		init(index : number) {
			this.mapIndex = index;
			this.mapName = LEVEL_MAP_LIST[index];
			this.numberOfTriesLeft = NUMBER_OF_TRIES_MAP_LIST[index];
			console.log("Initialized level " + this.mapName + ".");
		}

		create() {
			this.map = this.game.add.tilemap(this.mapName);
			this.map.addTilesetImage('tiles');
			this.map.addTilesetImage('darkness');
			this.map.setCollisionBetween(TILE_INDEX_START_GRIPPY, TILE_INDEX_END_GRIPPY);
			this.map.setCollisionBetween(TILE_INDEX_START_BOUNCE, TILE_INDEX_END_BOUNCE);
			this.map.setCollisionBetween(TILE_INDEX_DARKNESS, TILE_INDEX_DARKNESS);

			// Parse tiles.
			this.layerSpaceship = this.map.createLayer('Spaceship');
			this.layerSpaceship.resizeWorld();

			this.game.physics.startSystem(Phaser.Physics.ARCADE);

			// Parse objects.
			this.victims = this.game.add.group();
			this.containers = this.game.add.group();
			this.game.physics.arcade.enable(this.victims);
			for (let obj of this.map.objects['Objects']) {
				if (obj.name == "Player") {
					this.createPlayer(obj.x, obj.y);
				}
				else if (obj.name == "VictimV") {
					this.createVictim(obj.x, obj.y, EVictimType.VERTICAL);
				}
				else if (obj.name == "VictimH") {
					this.createVictim(obj.x, obj.y, EVictimType.HORIZONTAL);
				}
				else if (obj.name == "Container") {
					this.createContainer(obj.x, obj.y);
				}
			}
			if (this.player == null) {
				console.log("Error: Could not find object with type 'Player' in 'Objects'");
			}
			this.layerDarkness = this.map.createLayer('Darkness');
			this.layerDarkness.resizeWorld();

			// Init other stuff.
			this.flightLine = new Phaser.Line();
			this.numberOfCaughtEnemies = 0;
			this.textStyle = { font: "bold 32px Arial", fill: "#ff0000", boundsAlignH: "center", boundsAlignV: "middle" };
			this.numberOfTriesLeftText = this.game.add.text(0, 0, "", this.textStyle);
			this.numberOfTriesLeftText.fixedToCamera = true;
			this.updateNumberOfTriesLeftText();

			// Add event handlers.
			this.game.input.onDown.add(this.onClickDown, this);
			this.retryKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
			this.retryKey.onDown.add(this.retry, this);

			//this.music = this.game.add.sound('music', 1, true);
			//this.music.play();
		}

		createPlayer(x : number, y : number) : void {
			console.log("Creating player.");
			this.player = this.game.add.sprite(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2, 'player');
			this.player.anchor.x = 0.5;
			this.player.anchor.y = 0.5;
			this.player.animations.add('fly', [0, 1, 2, 3, 4, 5, 6, 7], 100, true);
			this.player.animations.add('stick', [1], 100, true);
			this.player.animations.play('fly');
			this.game.physics.arcade.enable(this.player);
			this.player.body.velocity.x = -PLAYER_VELOCITY;
			this.player.body.velocity.y = 0;
			this.player.body.bounce.set(1);
			this.levelState = ELevelState.FLYING;
			this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
		}

		createVictim(x : number, y : number, type : EVictimType) : void {
			console.log("Creating victim of type " + EVictimType[type] + ".");
			let victim = this.victims.create(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2, 'victim');
			victim.anchor.x = 0.5;
			victim.anchor.y = 0.5;
			victim.animations.add('fly', [0, 1], 100, true);
			victim.animations.add('escape', [2, 3], 100, true);
			victim.animations.play('escape');
			this.game.physics.arcade.enable(victim);
			victim.body.bounce.set(1);
			if (type == EVictimType.HORIZONTAL) {
				victim.body.velocity.x = VICTIM_VELOCITY;
			}
			else {
				victim.body.velocity.y = PLAYER_VELOCITY;
			}
		}

		createContainer(x : number, y : number) : void {
			console.log("Creating container.");
			let container = this.containers.create(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2, 'container');
			container.anchor.x = 0.5;
			container.anchor.y = 0.5;
			container.animations.add('still', [0], 1, false);
			container.animations.add('fight', [2, 3], 200, true);
			container.animations.play('still');
			this.game.physics.arcade.enable(container);
		}

		onClickDown(pointer) {
			if (this.levelState == ELevelState.STICKING) {
				this.game.physics.arcade.moveToPointer(this.player, PLAYER_VELOCITY, pointer);
				this.player.rotation = this.game.physics.arcade.angleToPointer(this.player, pointer) + (Math.PI / 2);
				this.transitionToState(ELevelState.FLYING);
			}
		}

		retry() {
			this.game.state.start("level", true, false, this.mapIndex);
		}

		update() {
			if (this.levelState != ELevelState.WON && this.levelState != ELevelState.LOST) {
				this.game.physics.arcade.collide(this.player, this.layerSpaceship, this.onPlayerCollidesWithSpaceShip, null, this);
			}
			this.game.physics.arcade.collide(this.victims, this.layerSpaceship, this.onVictimCollidesWithSpaceShip, null, this);
			if (this.levelState != ELevelState.WON && this.levelState != ELevelState.LOST) {
				this.game.physics.arcade.overlap(this.player, this.victims, this.onPlayerOverlapsWithVictim, null, this);
			}
			if (this.levelState != ELevelState.WON && this.levelState != ELevelState.LOST) {
				this.game.physics.arcade.overlap(this.player, this.containers, this.onPlayerOverlapsWithContainer, null, this);
			}
			if (this.levelState == ELevelState.STICKING) {
				// Update flight line.
				this.flightLine.start = this.player.position;
				this.flightLine.end.x = this.game.input.activePointer.position.x + this.game.camera.view.x;
				this.flightLine.end.y = this.game.input.activePointer.position.y + this.game.camera.view.y;
			}
		}

		private onPlayerCollidesWithSpaceShip(player, spaceShipTile) {
			console.log("Collision detected of player with spaceship tile of index " + spaceShipTile.index + ".");
			if (this.shouldStickToSpaceShipTile(spaceShipTile)) {
				this.playerInDarkness = false;
				this.game.physics.arcade.overlap(this.player, this.layerDarkness, this.onPlayerOverlapsWithDarkness, null, this);
				console.log("In Darkness : " + this.playerInDarkness);
				if (this.numberOfTriesLeft > 0 && this.playerInDarkness) {
					this.transitionToState(ELevelState.STICKING);
				}
				else {
					this.transitionToState(ELevelState.LOST);
				}
			}
		}

		private shouldStickToSpaceShipTile(spaceShipTile) : boolean {
			return !(TILE_INDEX_START_BOUNCE <= spaceShipTile.index && spaceShipTile.index <= TILE_INDEX_END_BOUNCE);
		}

		private onPlayerOverlapsWithDarkness(player, darknessTile) {
			// At least 50 % must intersect to be in darkness.
			if (Phaser.Rectangle.containsPoint(new Phaser.Rectangle(darknessTile.worldX - 10, darknessTile.worldY + 10, TILE_WIDTH + 20, TILE_HEIGHT + 20), this.player.position)) {
				this.playerInDarkness = true;
			}
		}

		private onVictimCollidesWithSpaceShip(victim, spaceShipTile) {
		}

		private onPlayerOverlapsWithVictim(player, victim) {
			if (this.levelState == ELevelState.FLYING) {
				this.victims.remove(victim);
				this.numberOfCaughtEnemies++;
			}
		}

		private onPlayerOverlapsWithContainer(player, container) {
			if (this.levelState == ELevelState.FLYING && this.victims.total == 0) {
				// Caught all victims.
				container.animations.play('fight');
				this.transitionToState(ELevelState.WON);
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
				this.player.animations.play('stick');
			}
			if (next == ELevelState.FLYING) {
				this.numberOfTriesLeft--;
				this.updateNumberOfTriesLeftText();
				this.player.animations.play('fly');
			}
			if (next == ELevelState.WON) {
				this.player.exists = false;
				this.game.time.events.add(2000, this.switchToNextLevel, this);
			}
			if (next == ELevelState.LOST) {
				this.player.exists = false;
				this.game.time.events.add(2000, this.retry, this);
			}
			this.levelState = next;
		}

		updateNumberOfTriesLeftText() {
			this.numberOfTriesLeftText.text = "Jumps left: " + this.numberOfTriesLeft;
		}

		switchToNextLevel() : void {
			let nextLevelIndex : number = (this.mapIndex + 1) % LEVEL_MAP_LIST.length;
			this.game.state.start("level", true, false, nextLevelIndex);
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
