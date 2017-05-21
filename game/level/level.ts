/// <reference path="../phaser.d.ts"/>

module GameJam.Level {

	const LEVEL_MAP_LIST : string[] = ['map1', 'map2', 'map3', 'map4', 'map5', 'map6'];
	const NUMBER_OF_TRIES_MAP_LIST : number[] = [3, 3, 3, 3, 1, 1];
	const PLAYER_VELOCITY : number = 300;
	const VICTIM_VELOCITY : number = 150;
	const TILE_WIDTH : number = 100;
	const TILE_HEIGHT : number = TILE_WIDTH;
	const TILE_INDEX_START_SOLID : number = 1;
	const TILE_INDEX_END_SOLID : number = 18;
	const TILE_INDEX_START_DEADLY : number = 23;
	const TILE_INDEX_END_DEADLY : number = 40;
	const TILE_INDEX_DARKNESS : number = 51;
	const ESCAPE_DISTANCE : number = 250;

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

		private background : Phaser.Sprite;
		private music : Phaser.Sound;

		private mapIndex : number;
		private mapName : string;
		private map : Phaser.Tilemap;
		private layerSpaceship : Phaser.TilemapLayer;
		private layerDarkness : Phaser.TilemapLayer;
		private layerObjects : Phaser.TilemapLayer;
		private player : Phaser.Sprite;
		private flightLine : Phaser.Line;
		private ui : Phaser.Group;
		private victims : Phaser.Group;
		private deadVictims : Phaser.Sprite[];
		private containers : Phaser.Group;
		private goalContainer : Phaser.Sprite;
		private speechBubble : Phaser.Sprite;
		private numberOfTriesLeft : number;
		private numberOfCaughtEnemies : number;
		private playerInDarkness : boolean;
		private shouldDie : boolean;
		private stickyRotation : number;
		private retryKey : Phaser.Key;
		private jumpIcons : Phaser.Sprite[];

		private levelState : ELevelState;

		init(index : number) {
			// TODO: Remove the following line.
			index = LEVEL_MAP_LIST.length - 1;
			this.mapIndex = index;
			this.mapName = LEVEL_MAP_LIST[index];
			this.numberOfTriesLeft = NUMBER_OF_TRIES_MAP_LIST[index];
			console.log("Initialized level " + this.mapName + ".");
		}

		create() {

			this.map = this.game.add.tilemap(this.mapName);
			this.map.addTilesetImage('tiles');
			this.map.addTilesetImage('darkness');
			this.map.setCollisionBetween(TILE_INDEX_START_DEADLY, TILE_INDEX_END_DEADLY);
			this.map.setCollisionBetween(TILE_INDEX_START_SOLID, TILE_INDEX_END_SOLID);
			this.map.setCollisionBetween(TILE_INDEX_DARKNESS, TILE_INDEX_DARKNESS);

			// Create visible stuff.
			this.background = this.game.add.sprite(0, 0, 'background');
			this.background.fixedToCamera = true;
			this.layerSpaceship = this.map.createLayer('Spaceship');
			this.layerSpaceship.resizeWorld();

			this.game.physics.startSystem(Phaser.Physics.ARCADE);

			// Parse objects.
			this.victims = this.game.add.group();
			this.game.physics.arcade.enable(this.victims);
			this.deadVictims = [];
			this.containers = this.game.add.group();
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
			this.ui = this.game.add.group();
			this.jumpIcons = [];
			for (let i : number = 0; i < this.numberOfTriesLeft; i++) {
				let icon : Phaser.Sprite = this.ui.create(50 + i * 100, 60, 'jump');
				icon.anchor.x = 0.5;
				icon.anchor.y = 0.5;
				icon.fixedToCamera = true;
				this.jumpIcons.push(icon);
			}

			// Init other stuff.
			this.shouldDie = false;
			this.playerInDarkness = false;
			this.flightLine = new Phaser.Line();
			this.numberOfCaughtEnemies = 0;

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
			this.player.animations.add('fly', [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
			this.player.animations.add('stick', [8], 1, true);
			this.player.animations.add('bounce', [9], 1, true);
			this.player.animations.add('grilled', [10, 15], 10, true);
			this.player.animations.add('exhausted', [18], 1, false);
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
			victim.animations.add('fly', [0], 1, false);
			victim.animations.add('escape', [0, 1, 2, 3, 4, 5, 6, 7, 8], 10, true);
			victim.animations.add('caught', [9], 1, false);
			victim.animations.play('fly');
			this.game.physics.arcade.enable(victim);
			victim.body.bounce.set(1);
			if (type == EVictimType.HORIZONTAL) {
				victim.rotation = Math.PI / 2;
				victim.body.velocity.x = VICTIM_VELOCITY;
			}
			else {
				victim.rotation = Math.PI;
				victim.body.velocity.y = VICTIM_VELOCITY;
			}
		}

		createContainer(x : number, y : number) : void {
			console.log("Creating container.");
			let container = this.containers.create(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2, 'container');
			container.anchor.x = 0.5;
			container.anchor.y = 0.5;
			container.animations.add('still', [0], 1, false);
			var fightAnim = container.animations.add('fight', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 10, false);
			fightAnim.onComplete.add((s, a) => {s.animations.play('shake');}, this);
			container.animations.add('shake', [10, 11, 12, 13, 14, 15], 8, true);
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
			this.updateDeadVictims();
			if (this.levelState == ELevelState.STICKING) {
				this.player.rotation = this.stickyRotation;
			}
			if (this.levelState == ELevelState.FLYING) {
				this.updateVictimAnimations();
			}
			else {
				this.resetVictimAnimations();
			}
			if (this.levelState == ELevelState.WON) {
				// Remove victims when touching container.
				this.game.physics.arcade.overlap(this.victims, this.containers, (v, c) => {
					v.exists = false;
				}, null, this);
			}
			if (this.levelState != ELevelState.WON && this.levelState != ELevelState.LOST) {
				this.shouldDie = false;
				this.game.physics.arcade.overlap(this.player, this.layerSpaceship, (p, tile) => { if (this.isTileDeadly(tile)) { this.shouldDie = true }}, null, this);
				if (this.shouldDie) {
					// Get grilled.
					this.player.animations.play('grilled');
					this.transitionToState(ELevelState.LOST);
				}
				else {
					this.game.physics.arcade.collide(this.player, this.layerSpaceship, this.onPlayerCollidesWithSpaceShip, null, this);
				}
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

		private resetVictimAnimations() {
			this.victims.forEachAlive((v) => {
				v.animations.play('fly');
				this.faceVictimToItsDirection(v);
			}, this);
		}

		private updateDeadVictims() {
			let time : number = 500;
			var dest = this.player;
			if (this.levelState == ELevelState.WON) {
				dest = this.goalContainer;
			}
			if (this.deadVictims.length > 0) {
				this.game.physics.arcade.moveToObject(this.deadVictims[0], dest, 60, time);
				this.deadVictims[0].rotation = this.game.physics.arcade.angleBetween(this.deadVictims[0], dest);
				for (let i : number = 1; i < this.deadVictims.length; i++) {
					var nextDest = this.deadVictims[i - 1];
					if (this.levelState == ELevelState.WON) {
						nextDest = dest;
					}
					this.game.physics.arcade.moveToObject(this.deadVictims[i], nextDest, 60, time);
					this.deadVictims[i].rotation = this.game.physics.arcade.angleBetween(this.deadVictims[i], nextDest);
				}
			}
		}

		private updateVictimAnimations() {
			this.victims.forEachAlive((v) => {
				let distance : number = this.player.position.distance(v.position);
				if (distance < ESCAPE_DISTANCE) {
					v.animations.play('escape');
					v.scale.x = 1;
					v.scale.y = -1;
					v.rotation = (Math.PI / 2) + this.game.physics.arcade.angleBetween(v, this.player);
				}
				else {
					v.animations.play('fly');
					this.faceVictimToItsDirection(v);
				}
			}, this);
		}

		private faceVictimToItsDirection(v) {
			if (Math.abs(v.body.velocity.x) > 0.1) {
				// Horizontal
				v.rotation = Math.PI / 2;
				if (v.body.velocity.x > 0) {
					v.scale.y = 1;
				}
				else {
					v.scale.y = -1;
				}
			}
			else {
				// Vertical
				v.rotation = Math.PI;
				if (v.body.velocity.y > 0) {
					v.scale.y = 1;
				}
				else {
					v.scale.y = -1;
				}
			}
		}

		private onPlayerCollidesWithSpaceShip(player, spaceShipTile) {
			console.log("Collision detected of player with spaceship tile of index " + spaceShipTile.index + ".");
			let playerInDarkness : boolean = this.checkInDarkness();
			console.log("In Darkness : " + playerInDarkness);
			if (playerInDarkness) {
				// Stick to wall.
				if (this.numberOfTriesLeft > 0) {
					// Rotate sprite to head away from the tile.
					let diff : Phaser.Point = Phaser.Point.subtract(new Phaser.Point(spaceShipTile.worldX + TILE_WIDTH / 2, spaceShipTile.worldY + TILE_HEIGHT / 2), this.player.position);
					this.player.body.angularVelocity = 0;
					if (Math.abs(diff.x) > Math.abs(diff.y)) {
						if (diff.x > 0) {
							// From right
							this.stickyRotation = -Math.PI / 2;
						}
						else {
							// From left
							this.stickyRotation = Math.PI / 2;
						}
					}
					else {
						if (diff.y > 0) {
							// From top
							this.stickyRotation = 0;
						}
						else {
							// From bottom
							this.stickyRotation = Math.PI;
						}
					}
					this.transitionToState(ELevelState.STICKING);
				}
				else {
					this.player.rotation = 0;
					this.player.animations.play('exhausted');
					this.game.add.tween(this.player).to( { alpha: 0 }, 1000, "Linear", true, 1000, 0, false);
					this.transitionToState(ELevelState.LOST);
				}
			}
			else {
				// Bounce from wall.
				this.player.body.angularVelocity = -500;
				this.player.animations.play('bounce');
			}
		}

		private checkInDarkness() : boolean {
			this.playerInDarkness = false;
			this.game.physics.arcade.overlap(this.player, this.layerDarkness, (p, darknessTile) => {
				if (darknessTile.index != TILE_INDEX_DARKNESS) {
					return;
				}
				// At least 50 % must intersect to be in darkness.
				if (Phaser.Rectangle.containsPoint(new Phaser.Rectangle(darknessTile.worldX - 10, darknessTile.worldY - 10, TILE_WIDTH + 20, TILE_HEIGHT + 20), this.player.position)) {
					this.playerInDarkness = true;
				}
				else {
					console.log('nope: ');
				}
			}, null, this);

			return this.playerInDarkness;
		}

		private isTileDeadly(spaceShipTile) : boolean {
			return TILE_INDEX_START_DEADLY <= spaceShipTile.index && spaceShipTile.index <= TILE_INDEX_END_DEADLY;
		}

		private onVictimCollidesWithSpaceShip(victim, spaceShipTile) {
		}

		private onPlayerOverlapsWithVictim(player, victim) {
			if (victim.alive == true) {
				if (this.levelState == ELevelState.FLYING) {
					victim.alive = false;
					victim.animations.play('caught');
					victim.scale.y = 1;
					victim.scale.x = 1;
					this.deadVictims.push(victim);
					this.numberOfCaughtEnemies++;
				}
			}
		}

		private onPlayerOverlapsWithContainer(player, container) {
			if (this.levelState == ELevelState.FLYING && this.victims.total == this.deadVictims.length) {
				// Caught all victims.
				this.goalContainer = container;
				container.animations.play('fight');
				this.speechBubble = this.ui.create(container.x, container.y, 'speechbubble');
				this.speechBubble.scale.x = 0.5;
				this.speechBubble.scale.y = 0.5;
				this.speechBubble.anchor.x = 1;
				this.speechBubble.anchor.y = 1;
				this.speechBubble.alpha = 0;
				let scale : Phaser.Tween = this.game.add.tween(this.speechBubble.scale).to( { x : 0.9, y: 0.7 }, 300, "Linear", true, 0, 999, true);
				let fadeIn : Phaser.Tween = this.game.add.tween(this.speechBubble).to( { alpha: 1 }, 300, "Linear", true, 300, 0, false);
				let fadeOut : Phaser.Tween = this.game.add.tween(this.speechBubble).to( { alpha: 0 }, 300, "Linear", false, 1000, 0, false);
				fadeIn.chain(fadeOut);
				this.transitionToState(ELevelState.WON);
			}
		}

		private transitionToState(next : ELevelState) {
			if (this.levelState == ELevelState.WON || this.levelState == ELevelState.LOST) {
				// These are final states.
				return;
			}
			if (next == this.levelState) {
				return;
			}
			console.log("Transitioning from level state " + ELevelState[this.levelState] + " to level state " + ELevelState[next] + ".");
			if (next == ELevelState.STICKING) {
				this.player.body.velocity.x = 0;
				this.player.body.velocity.y = 0;
				this.player.body.angularVelocity = 0;
				this.player.animations.play('stick');
			}
			if (next == ELevelState.FLYING) {
				this.numberOfTriesLeft--;
				this.removeOneJumpIcon();
				this.player.animations.play('fly');
			}
			if (next == ELevelState.WON) {
				this.player.exists = false;
				this.game.time.events.add(3000, this.switchToNextLevel, this);
			}
			if (next == ELevelState.LOST) {
				this.player.body.velocity.x = 0;
				this.player.body.velocity.y = 0;
				this.player.body.angularVelocity = 0;
				this.game.time.events.add(2000, this.retry, this);
			}
			this.levelState = next;
		}

		removeOneJumpIcon() {
			let icon : Phaser.Sprite = this.jumpIcons[this.numberOfTriesLeft];
			this.game.add.tween(icon).to( { alpha: 0 }, 300, "Linear", true, 0, 0, false);
			this.game.add.tween(icon.scale).to( { x : 2, y: 2 }, 300, "Linear", true, 0, 0, false);
		}

		switchToNextLevel() : void {
			let nextLevelIndex : number = this.mapIndex + 1;
			if (nextLevelIndex == LEVEL_MAP_LIST.length) {
				this.game.state.start('won', true, false);
			}
			else {
				this.game.state.start("level", true, false, nextLevelIndex);
			}
		}

		render() {
			if (this.levelState == ELevelState.STICKING) {
				this.game.debug.geom(this.flightLine);
			}
		}
	}
}
