import { Scene } from 'phaser'
import img_sky from '../assets/sky.png';
import img_ground from '../assets/platform.png';
import img_star from '../assets/star.png';
import img_bomb from '../assets/bomb.png';
import img_sprite_dude from '../assets/dude.png';

export class Preloader extends Scene {
    constructor () {
        super({
            key: 'preloader'
        })
        console.log('Preloader constructor');
    }

    preload(){
        console.log('Preloader preload');
        
        this.load.image('sky', img_sky);
        this.load.image('ground', img_ground);
        this.load.image('star', img_star);
        this.load.image('bomb', img_bomb);
        this.load.spritesheet('dude', img_sprite_dude, {frameWidth: 32, frameHeight: 48});

        console.log('Preloader finish');
    }

    create(){
        this.scene.start('game');
    }
}