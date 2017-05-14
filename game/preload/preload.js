/// <reference path="../phaser.d.ts"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var GameJam;
(function (GameJam) {
    var Preload;
    (function (Preload_1) {
        var Preload = (function (_super) {
            __extends(Preload, _super);
            function Preload() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Preload.prototype.preload = function () {
                var text = this.game.add.text(this.game.width / 2, this.game.height / 2, "Loading...", { fill: '#ffffff' });
                text.anchor.set(0.5, 0.5);
                // TODO: Load stuff.
                // Images
                //this.game.load.image('car', 'assets/car.png');
                // Spritesheets
                //this.game.load.spritesheet('player', 'assets/player.png', 64, 64);
                // Maps
                //this.game.load.json('lvl0', 'assets/0.json');
                // Sound
                //this.game.load.audio('music', 'assets/music.mp3');
                //this.game.load.audio('laser-snd', 'assets/laser.mp3');
            };
            Preload.prototype.create = function () {
                // Finished loading.
                //var music = this.game.add.sound('music', undefined, Number.MAX_VALUE);
                //music.play();
                // TODO: Switch to next screen.
                //this.game.state.start("intro", true, false);
            };
            return Preload;
        }(Phaser.State));
        Preload_1.Preload = Preload;
    })(Preload = GameJam.Preload || (GameJam.Preload = {}));
})(GameJam || (GameJam = {}));
