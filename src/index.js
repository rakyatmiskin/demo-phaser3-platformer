import Phaser from "phaser";
import { Preloader } from './scenes/preloader';
import { Game } from './scenes/game';

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'content',
  scene: [
    Preloader,
    Game
  ]
};

const game = new Phaser.Game(config);


window.onresize = function(){
  game.scale.resize(window.innerWidth, window.innerHeight);
  game.events.emit('resize');
}
