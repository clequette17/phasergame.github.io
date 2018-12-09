var config = {
    type: Phaser.CANVAS,
    width: 1280,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }

};
var game = new Phaser.Game(config);
var character;
var enemies;
var level;
var varLevel = 1800;
var varTire = 1800;
//var temps = 0;
//var tempsms = 0;
var addEnemy;
var score = 0;
var afficherScore;
//var afficherTemps;
var afficherFin1;
var afficherFin2;
var fin = false;

function preload() {

    this.load.image('background', 'assets/background.png');
    
    this.load.spritesheet('character', 'assets/character.png', {frameWidth: 90.6, frameHeight: 100});
    this.load.image('spell', 'assets/spell.png');
    
    this.load.spritesheet('enemy', 'assets/enemy1.png', {frameWidth: 91.7, frameHeight: 100});
    this.load.image('spellE', 'assets/spellE.png');
    this.load.image('tombe', 'assets/tombe.png');
    
    this.load.audio('gameover', 'assets/sounds/gameover.wav');
}
function create() {

    window.console.log(game.actualFps);

    background = this.add.image(0, 0, 'background').setOrigin(0, 0);
    background.setDisplaySize(1280, 720);

    cursors = this.input.keyboard.createCursorKeys();

    character = this.physics.add.sprite(200, 360, 'character');
    character.setCollideWorldBounds(true);
    character.flipX = true;

    enemies = this.physics.add.group();

    addEnemy = this.time.addEvent({
        delay: varLevel,
        callback: ajouterEnemy,
        callbackScope: this,
        loop: true
    });

    level = this.time.addEvent({
        delay: 5000,

        callback: function () {
            if (varLevel > 900) {
                varLevel -= 100;
            }
            addEnemy.delay = varLevel;

            if (varLevel == 900) {
                if (varTire > 700) {
                    varTire -= 100;
                }
            }
        },
        callbackScope: this,
        loop: true
    });

    this.anims.create({
        key: 'tireC',
        frames: this.anims.generateFrameNumbers('character', {start: 0, end: 19}),
        frameRate: 120,
        repeat: 0
    });

    this.anims.create({
        key: 'tireE',
        frames: this.anims.generateFrameNumbers('enemy', {start: 0, end: 18}),
        frameRate: 120,
        repeat: 0
    });

    if (!fin) {
        this.input.on('pointerdown', function (pointer) {
            if (!fin) {
                this.anims.play('tireC', character);
                if (character.flipX) {
                    var spell = this.physics.add.sprite(character.x + 55, character.y - 20, 'spell');
                } else {
                    var spell = this.physics.add.sprite(character.x - 45, character.y - 20, 'spell');
                }

                this.physics.moveTo(spell, this.input.x + this.cameras.main.scrollX, this.input.y + this.cameras.main.scrollY, 1000, null);
                this.physics.add.collider(spell, enemies, tuerEnemy, null, this);
            }
        }, this);

    }

    afficherScore = this.add.text(16, 16, 'Score : 0', {fontSize: '32px', fill: '#000'});
}

function update() {

    window.console.log(game.loop.actualFps);

    if (!fin) {
        character.setVelocity(0);
        if (cursors.left.isDown)
        {
            character.flipX = false;
            character.setVelocityX(-350);
        }
        if (cursors.right.isDown)
        {
            character.flipX = true;
            character.setVelocityX(350);
        }
        if (cursors.up.isDown)
        {
            character.setVelocityY(-350);
        }
        if (cursors.down.isDown)
        {
            character.setVelocityY(350);
        }

    } else {

        if (cursors.space.isDown) {
            restart();
        }
    }

}

function ajouterEnemy() {

    var randomY = Math.random() * 720;
    var randomX = 780 + Math.random() * 500;
    var enemy = this.physics.add.sprite(randomX, randomY, 'enemy');

    this.time.addEvent({
        delay: 500,
        callback: function () {
            this.anims.play('tireE', enemy);
            var spell = this.physics.add.sprite(enemy.x - 20, enemy.y, 'spellE');
            this.physics.moveToObject(spell, character, 700, null);
            this.physics.add.collider(spell, character, finDePartie, null, this);
        },
        callbackScope: this
    });

    enemy.tire = this.time.addEvent({
        delay: varTire,
        callback: function () {
            this.anims.play('tireE', enemy);
            var spell = this.physics.add.sprite(enemy.x - 20, enemy.y, 'spellE');
            this.physics.moveToObject(spell, character, 700, null);
            this.physics.add.collider(spell, character, finDePartie, null, this);
        },
        callbackScope: this,
        loop: true
    });
    enemies.add(enemy);

}

function tuerEnemy(spell, enemy) {

    score += 10;
    afficherScore.setText("Score : " + score);
    enemy.tire.destroy();
    enemies.remove(enemy);
    enemy.destroy();
    spell.destroy();
}

function finDePartie() {

    fin = true;

    character.body.enable = false;
    character.visible = false;

    tombe = this.add.image(character.x, character.y, 'tombe');

    addEnemy.paused = true;

    for (var i = 0; i < enemies.getChildren().length; i++) {
        enemies.getChildren()[i].tire.destroy();
    }
    
    afficherFin1 = this.add.text(640, 330, 'Fin de partie !', {fontSize: '70px', fill: '#000'}).setOrigin(0.5, 0.5);
    afficherFin2 = this.add.text(640, 390, 'Appuyez sur espace pour recommencer.', {fontSize: '20px', fill: '#000'}).setOrigin(0.5, 0.5);

    var gameover = this.sound.add('gameover');
    gameover.play();
}

function restart() {

    fin = false;

    enemies.clear(false, true);

    afficherFin1.destroy();
    afficherFin2.destroy();

    addEnemy.paused = false;
    character.angle = 0;
    character.x = 200;
    character.y = 360;
    character.body.enable = true;
    character.visible = true;
    tombe.destroy();

    score = 0;
    afficherScore.setText("Score : " + score);

    varLevel = 1800;
    varTire = 1800;
}