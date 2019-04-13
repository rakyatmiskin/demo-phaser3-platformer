import { Scene } from 'phaser';
import {GlobalVariable} from '../globalvariable';

export class Game extends Scene {
    constructor () {
        super({
            key: 'game',
            physics: {
                default: 'arcade',
                arcade: {
                    debug: false,
                    gravity: { y:300 }
                }
            }
        })

        this.bg_image = null;
        this.stars = null;

        this.platforms = null;
        this.player = null;
        this.cursors = null;
        this.bombs = null;

        this.gameOver = false;
        this.gameEnded = false;
        this.score = 0;
        this.scoreText = null;

        this.norm_X = 0; //set the normal X position centering
        this.norm_Y = 0; //set the normal Y position centering
    }

    create(){
        this.initEnvironment();
        this.initStars();
        this.initBombs();

        this.initPlayer();
        this.initCursors();
        this.initUI();

        // this.game.world.setBounds(0, 0, 800, 600);

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

        this.sys.game.events.on('resize', this.resize, this);
        this.resize();
        this.events.once('shutdown', this.shutdown, this);
    }

    initUI(){
        this.scoreText = this.add.text(this.norm_X - 384, this.norm_Y - 284, 'Score: 0', {fontSize: '32px', fill: '#000'});
    }
    updateUI(){
        this.scoreText.setText('Score: ' + this.score);
    }

    initEnvironment(){
        this.bg_image = this.add.image(this.norm_X, this.norm_Y, 'sky');
        
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(this.norm_X, this.norm_Y + 268, 'ground').setScale(2).refreshBody(); // refreshBody() is for refresing physics boundary
        this.platforms.create(this.norm_X + 200, this.norm_Y + 100, 'ground');
        this.platforms.create(this.norm_X - 350, this.norm_Y - 50, 'ground');
        this.platforms.create(this.norm_X + 350, this.norm_Y - 80, 'ground');
    }

    initBombs(){
        this.bombs = this.physics.add.group();
    }
    attachBomb(){
        let x = (this.player.x < this.norm_X)?Phaser.Math.Between(this.norm_X, this.norm_X + 400) : Phaser.Math.Between(this.norm_X - 400, this.norm_X);

        let bomb = this.bombs.create(x, this.norm_Y - 284, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
    resetBombs(){
        var bombLength = this.bombs.getLength();
        for (let index = 0; index < bombLength; index++) {
            let bomb = this.bombs.getChildren()[0];
            bomb.destroy();
        }

        this.bombs.clear();
    }

    initStars(){
        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: {x: this.norm_X - 388, y: this.norm_Y - 300, stepX: 70}
        });
        this.stars.children.iterate(function(child){
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        })
    }
    resetStars(){
        for (let index = 0; index < this.stars.getLength(); index++) {
            let star = this.stars.getChildren()[index];
            star.enableBody(true, star.x, this.norm_Y - 300, true, true);
        }
    }

    initPlayer(){
        this.player = this.physics.add.sprite(this.norm_X - 300, this.norm_Y + 150, 'dude');

        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8}),
            frameRate: 10,
            repeat: -1
        });

        this.player.body.setGravityY(300);
    }
    resetPlayer(){
        this.player.setTint(0xffffff);

        this.player.x = this.norm_X - 300;
        this.player.y = this.norm_Y + 150;
    }

    initCursors(){
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    updateCursors(){
        let isLeft = this.cursors.left.isDown || this.input.keyboard.addKey('A').isDown;
        let isRight = this.cursors.right.isDown || this.input.keyboard.addKey('D').isDown;
        let isUp = this.cursors.up.isDown || this.input.keyboard.addKey('W').isDown;
        if(isLeft){
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
        }else if(isRight){
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
        }else{
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

        if(isUp && this.player.body.touching.down){
            this.player.setVelocityY(-500);
        }
    }

    resetGame(){
        this.gameOver = false;
        this.gameEnded = false;

        this.resetPlayer();
        this.resetStars();
        this.resetBombs();
        this.physics.resume();
    }

    update(){
        this.updateCursors();

        if(this.gameOver && !this.gameEnded){
            this.gameEnded = true;

            this.time.delayedCall(1000, this.resetGame, [], this);
        }
    }

    collectStar(player, star){
        star.disableBody(true, true);

        this.score += 10;
        this.updateUI();

        if(this.stars.countActive(true) === 0){
            this.resetStars();
            this.attachBomb();
        }
    }

    hitBomb(player, bomb){
        this.physics.pause();

        this.player.setTint(0xff0000);
        this.player.anims.play('turn');

        this.gameOver = true;
    }

    resize () {
        console.log('resize game');
        this.physics.world.setBounds(this.norm_X - 400, this.norm_Y - 300, 800, 600, true, true, true, true);

        let cam = this.cameras.main;
        cam.setViewport(0,0,window.innerWidth, window.innerHeight);
        cam.centerToBounds();
        // cam.setBounds(0, 0, 800, 600);
        cam.setScroll(-window.innerWidth/2 + this.norm_X, -window.innerHeight/2 + this.norm_Y);
        cam.zoom = Math.min(window.innerWidth/GlobalVariable.getScreenWidth(), window.innerHeight/GlobalVariable.getScreenHeight());
        // cam.startFollow(this.player);
    }

    shutdown () {
        console.log('shutdown game');
        // When this scene exits, remove the resize handler
        this.sys.game.events.off('resize', this.resize, this);
    }
}